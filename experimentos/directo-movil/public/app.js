// @ts-check
// Interfaz del experimento: emitir, mirar y finalizar. WebRTC sin STUN/TURN (solo candidatos locales).
// LIVE-FASE03-E03 añade una cronología de continuidad, estados visibles por componente y una recuperación
// manual controlada dentro de la misma sesión. No hay reintentos automáticos de la señalización.
import {
  agregarEstadisticas,
  construirInforme,
  contarPistasActivas,
  copiarTexto,
  LIMITE_ESTADISTICAS_INFORME_MS,
  liberarMedios,
  serializarInforme,
  solicitarMedios,
} from './medios.js';
import { CanalSenalizacion, categoriaCanal, crearSesion } from './senalizacion.js';
import { Cronologia, exportarCronologia, serializarCronologia } from './cronologia.js';
import {
  derivarContinuidad,
  estadoPistas,
  evaluarProgreso,
  LIMITES_RECUPERACION,
  MAX_NEGOCIACION,
  ofertaAceptable,
  siguienteNegociacion,
  TEXTOS_ESTADO,
  TEXTOS_MOTIVO,
} from './continuidad.js';

/** @typedef {import('./senalizacion.js').EventoSse} EventoSse */
/** @typedef {import('./senalizacion.js').EstadoCanal} EstadoCanal */
/** @typedef {import('./senalizacion.js').CategoriaCanal} CategoriaCanal */

/**
 * @template {HTMLElement} T
 * @param {string} id
 * @param {{ new (): T, prototype: T }} tipo
 * @returns {T}
 */
function el(id, tipo) {
  const elemento = document.getElementById(id);
  if (!(elemento instanceof tipo)) throw new Error(`Falta el elemento #${id}`);
  return elemento;
}

const ui = {
  vistas: {
    inicio: el('vista-inicio', HTMLElement),
    emisor: el('vista-emisor', HTMLElement),
    espectador: el('vista-espectador', HTMLElement),
    final: el('vista-final', HTMLElement),
  },
  vistaContinuidad: el('vista-continuidad', HTMLElement),
  btnCrear: el('btn-crear', HTMLButtonElement),
  btnCopiar: el('btn-copiar', HTMLButtonElement),
  btnActivar: el('btn-activar', HTMLButtonElement),
  btnFinalizar: el('btn-finalizar', HTMLButtonElement),
  btnReproducir: el('btn-reproducir', HTMLButtonElement),
  btnSalir: el('btn-salir', HTMLButtonElement),
  btnNueva: el('btn-nueva', HTMLButtonElement),
  btnReintentar: el('btn-reintentar', HTMLButtonElement),
  btnInforme: el('btn-informe', HTMLButtonElement),
  btnCopiarInforme: el('btn-copiar-informe', HTMLButtonElement),
  btnCronologia: el('btn-cronologia', HTMLButtonElement),
  btnCopiarCronologia: el('btn-copiar-cronologia', HTMLButtonElement),
  informeTexto: el('informe-texto', HTMLTextAreaElement),
  estadoInforme: el('estado-informe', HTMLElement),
  cronologiaTexto: el('cronologia-texto', HTMLTextAreaElement),
  estadoCronologia: el('estado-cronologia', HTMLElement),
  estadoRecuperacion: el('estado-recuperacion', HTMLElement),
  enlace: el('enlace-espectador', HTMLInputElement),
  videoLocal: el('video-local', HTMLVideoElement),
  videoRemoto: el('video-remoto', HTMLVideoElement),
  textoFinal: el('texto-final', HTMLElement),
  error: el('mensaje-error', HTMLElement),
  estado: {
    rol: el('estado-rol', HTMLElement),
    senal: el('estado-senal', HTMLElement),
    conexion: el('estado-conexion', HTMLElement),
    ice: el('estado-ice', HTMLElement),
    medios: el('estado-medios', HTMLElement),
  },
  continuidad: {
    sesion: el('estado-sesion', HTMLElement),
    par: el('estado-par', HTMLElement),
    pistas: el('estado-pistas', HTMLElement),
    reproduccion: el('estado-reproduccion', HTMLElement),
    continuidad: el('estado-continuidad', HTMLElement),
  },
};

/** Sin servidores STUN/TURN: el experimento no depende de servicios externos. */
const CONFIG_RTC = /** @type {RTCConfiguration} */ ({ iceServers: [] });

const PATRON_SESION = /^[A-Za-z0-9_-]{22}$/;
const PATRON_TOKEN = /^[A-Za-z0-9_-]{43}$/;
/**
 * Espera técnica máxima para cerrar la señalización tras el aviso de salida del espectador. La captura y la
 * conexión se liberan en el acto; el canal se cierra cuando el servidor responde al aviso o, a más tardar,
 * pasado este tiempo. Así el servidor registra la salida antes de ver cerrarse el flujo y el emisor no la
 * confunde con una desconexión.
 */
const ESPERA_CIERRE_TRAS_AVISO_MS = 300;

/** @type {Record<string, string>} */
const MOTIVOS_FIN = {
  'finalizada-por-el-emisor': 'El emisor finalizó la emisión.',
  'salida-del-espectador': 'Has salido de la sesión.',
  expirada: 'La sesión de prueba caducó.',
  abandonada: 'La sesión se cerró por inactividad.',
  'servidor-detenido': 'El servidor local se detuvo.',
};

/** Reloj monotónico de la página (milisegundos), para intervalos técnicos. */
const reloj = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());

/**
 * Espera acotada y cancelable. `resolver` cancela su temporizador y la retira del conjunto: al terminar la
 * sesión, `cancelarEsperas` resuelve todas las pendientes como `cancelada`, sin temporizadores huérfanos.
 * @template T
 * @typedef {{ resolver: (valor: T) => void, clave?: unknown }} Espera
 */

/**
 * @template T
 * @param {Set<Espera<T>>} conjunto
 * @param {number} ms
 * @param {T} alAgotar
 * @param {unknown} [clave] Objeto al que pertenece la espera (una conexión o un canal).
 * @returns {Promise<T>}
 */
function esperarEn(conjunto, ms, alAgotar, clave) {
  return new Promise((resolve) => {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let temporizador;
    /** @type {Espera<T>} */
    const espera = {
      clave,
      resolver(valor) {
        clearTimeout(temporizador);
        conjunto.delete(espera);
        resolve(valor);
      },
    };
    conjunto.add(espera);
    temporizador = setTimeout(() => espera.resolver(alAgotar), ms);
  });
}

/**
 * @template T
 * @param {Set<Espera<T>>} conjunto
 * @param {T} valor
 * @param {unknown} [clave] Si se indica, solo se resuelven las esperas de esa clave.
 */
function notificar(conjunto, valor, clave) {
  for (const espera of [...conjunto]) if (clave === undefined || espera.clave === clave) espera.resolver(valor);
}

const cronologia = new Cronologia({
  capacidades: {
    visibilidad: typeof document.visibilityState === 'string',
    pagehide: 'onpagehide' in window,
    pageshow: 'onpageshow' in window,
    freeze: 'onfreeze' in document,
    resume: 'onresume' in document,
    descarte: 'wasDiscarded' in document,
    red: typeof navigator.onLine === 'boolean',
    getStats: typeof RTCPeerConnection === 'function' && typeof RTCPeerConnection.prototype?.getStats === 'function',
  },
});

/**
 * @param {string} categoria
 * @param {string} evento
 * @param {{ estado?: unknown, pista?: unknown, detalle?: unknown }} [extra]
 */
function registrar(categoria, evento, extra) {
  cronologia.registrar(categoria, evento, extra);
}

/**
 * Resultado de un reintento. Un `exito` lleva la conexión y la época de interrupciones en que se comprobó: solo
 * vale mientras ambas sigan siendo las actuales (E03-R01-02 y E03-R01-06).
 * @typedef {{ tipo: 'exito' | 'fallo' | 'agotada' | 'sin-verificar', detalle: string, texto: string,
 *   pc?: RTCPeerConnection, epoca?: number }} ResultadoRecuperacion
 */

const estado = {
  /** @type {'emisor' | 'espectador' | null} */
  rol: null,
  /** @type {CanalSenalizacion | null} */
  canal: null,
  /** @type {RTCPeerConnection | null} */
  pc: null,
  /** @type {MediaStream | null} */
  streamLocal: null,
  /** @type {MediaStream | null} */
  streamRemoto: null,
  parPresente: false,
  /** Motivo de la última ausencia del otro participante, según el servidor. */
  /** @type {'salida' | 'desconexion' | null} */
  parMotivo: null,
  terminado: false,
  /**
   * Identidad de la sesión en curso. Cambia al terminar una sesión y al empezar otra: las operaciones
   * pendientes de una generación anterior se descartan al resolverse.
   */
  generacion: 0,
  /** Último intento de captura; solo se acepta el resultado del último intento de la generación vigente. */
  intentoCaptura: 0,
  /** Capturas que llegaron para una sesión o un intento ya cerrados y se detuvieron al recibirse. */
  capturasDescartadas: 0,
  /** Resultado del aviso de fin o de salida enviado al servidor. */
  /** @type {'sin-aviso' | 'pendiente' | 'confirmado' | 'sin-confirmar'} */
  avisoCierre: 'sin-aviso',
  /**
   * Estado del canal de señalización, como valor de lista cerrada para el informe de diagnóstico (esquema 2,
   * sin cambios: una interrupción consta como `error`, como en E02).
   */
  /** @type {'sin-canal' | 'conectando' | 'conectada' | 'cerrada' | 'error' | 'no-iniciada'} */
  canalEstado: 'sin-canal',
  /** Estado detallado del canal para la continuidad (E03): distingue interrupción de error de apertura. */
  /** @type {'sin-canal' | 'conectando' | 'conectada' | 'interrumpida' | 'error' | 'cerrada'} */
  canalDetalle: 'sin-canal',
  /** @type {CategoriaCanal | null} */
  canalMotivo: null,
  /** El canal llegó a conectarse en esta sesión (la sesión existió en el servidor). */
  canalConectadoAlgunaVez: false,
  /**
   * E03-R01-05: el canal vigente recibió la bienvenida del servidor. Una respuesta HTTP 200 sin bienvenida no
   * confirma la señalización.
   */
  canalConfirmado: false,
  /**
   * E03-R01-02: contador de interrupciones observadas (transporte `disconnected`, `failed` o `closed`, pistas
   * silenciadas o terminadas, señalización perdida y sustitución de la conexión). Una comprobación de progreso
   * solo vale si no cambió mientras se hacía, y una confirmación solo describe el estado mientras no cambie.
   */
  epocaInterrupcion: 0,
  /** Estado de la sesión tal como lo conoce esta página. */
  /** @type {'sin-sesion' | 'vigente' | 'finalizada' | 'inexistente' | 'no-autorizada'} */
  sesionEstado: 'sin-sesion',
  /**
   * Credenciales de la sesión vigente, solo en memoria (nunca en almacenamiento del navegador ni en informes).
   * Permiten reabrir la señalización de ESTA sesión; se borran al terminar.
   */
  /** @type {{ sesion: string, token: string } | null} */
  credenciales: null,
  /** Estado de la captura local, como valor de lista cerrada para el informe de diagnóstico. */
  /** @type {'sin-sesion' | 'no-aplica' | 'sin-activar' | 'solicitando' | 'activa' | 'sin-captura' | 'liberada'} */
  captura: 'sin-sesion',
  /** Código del último fallo de captura, o `null`. */
  /** @type {string | null} */
  codigoCaptura: null,
  /** Último informe solicitado. Un informe solo se muestra o se copia si sigue siendo la última solicitud. */
  solicitudInforme: 0,
  /** Última cronología solicitada, con la misma regla. */
  solicitudCronologia: 0,
  /**
   * Hay una copia en curso, del informe o de la cronología. Solo puede haber una: así dos escrituras al
   * portapapeles no terminan en orden inverso.
   */
  copiando: false,
  /** Categorías de error ocurridas en esta página, sin repetir y de lista cerrada (sin mensajes ni datos). */
  /** @type {string[]} */
  errores: [],
  /** Candidatos recibidos antes de la descripción remota de su negociación (cola acotada). */
  /** @type {RTCIceCandidateInit[]} */
  candidatosPendientes: [],
  /** Todos los flujos capturados en esta página, también los descartados, para comprobar que no quedan pistas. */
  /** @type {MediaStream[]} */
  historialLocal: [],
  /**
   * Negociación vigente. En el emisor, la última que creó (1, 2…); en el espectador, la de la última oferta
   * aplicada, o `null` si la oferta no traía identificador. Solo correlaciona señales; no autentica.
   */
  neg: 0,
  /** @type {number | null} */
  negRemota: null,
  /** El emisor envió una oferta cuya respuesta no se ha aplicado. */
  negPendiente: false,
  /** Instante (reloj monotónico) de la última oferta creada por el emisor. */
  ultimaOfertaEn: Number.NEGATIVE_INFINITY,
  /** Ofertas aplicadas y respondidas por el espectador, para que la recuperación reconozca una nueva. */
  ofertasRespondidas: 0,
  /** Señales y candidatos descartados por pertenecer a otra negociación o por desbordar una cola. */
  senalesDescartadas: 0,
  /** Recuperación en curso, como máximo una por página. */
  /** @type {{ id: number, generacion: number } | null} */
  recuperacion: null,
  recuperaciones: 0,
  /** @type {'ninguna' | 'confirmada' | 'no-confirmada'} */
  recuperacionResultado: 'ninguna',
  /** @type {string | null} */
  recuperacionDetalle: null,
  /**
   * E03-R01-06: conexión y época en que se publicó el último resultado. Ese resultado solo representa el estado
   * actual mientras ambas sigan siendo las vigentes; si no, se conserva como antecedente.
   */
  /** @type {RTCPeerConnection | null} */
  recuperacionPc: null,
  recuperacionEpoca: -1,
  recuperacionTexto: '',
  /** Retira los oyentes de las pistas locales y remotas vigentes. */
  /** @type {(() => void)[]} */
  quitarOyentesLocales: [],
  /** @type {(() => void)[]} */
  quitarOyentesRemotos: [],
  /** @type {Set<Espera<{ ok: true, parPresente: boolean } | { ok: false, detalle: string }>>} */
  esperasBienvenida: new Set(),
  /** @type {Set<Espera<string>>} */
  esperasConexion: new Set(),
  /** @type {Set<Espera<string>>} */
  esperasNegociacion: new Set(),
  /** @type {Set<Espera<string>>} */
  esperasPausa: new Set(),
  /** E03-R02-02: operaciones WebRTC nativas acotadas en curso (createOffer, setRemoteDescription…). */
  /** @type {Set<Espera<ResultadoOperacion>>} */
  esperasOperacion: new Set(),
};

/**
 * Resultado de una operación nativa acotada. `tiempo-agotado` y `cancelada` son cancelaciones LÓGICAS: la
 * promesa del navegador no admite cancelación y puede resolverse después; su resultado ya no se usa.
 * @typedef {{ estado: 'ok', valor: any } | { estado: 'error', error: unknown } | { estado: 'tiempo-agotado' }
 *   | { estado: 'cancelada' }} ResultadoOperacion
 */

/**
 * E03-R02-02: acota una operación WebRTC nativa con `LIMITES_RECUPERACION.operacionRtcMs`. La espera se
 * registra para que `terminar` la cancele (y su temporizador) de inmediato.
 * @param {Promise<unknown>} promesa
 * @returns {Promise<ResultadoOperacion>}
 */
function acotar(promesa) {
  return new Promise((resolve) => {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let temporizador;
    /** @type {Espera<ResultadoOperacion>} */
    const espera = {
      resolver(valor) {
        clearTimeout(temporizador);
        estado.esperasOperacion.delete(espera);
        resolve(valor);
      },
    };
    estado.esperasOperacion.add(espera);
    temporizador = setTimeout(() => espera.resolver({ estado: 'tiempo-agotado' }), LIMITES_RECUPERACION.operacionRtcMs);
    promesa.then(
      (valor) => espera.resolver({ estado: 'ok', valor }),
      (error) => espera.resolver({ estado: 'error', error }),
    );
  });
}

/** Canales que se interrumpieron, fallaron o se cerraron: no se pueden volver a confirmar (E03-R03-01). */
/** @type {WeakSet<CanalSenalizacion>} */
const canalesTerminados = new WeakSet();

/** Conexiones cuya negociación se abandonó por agotar el límite de una operación (E03-R02-02). */
/** @type {WeakSet<RTCPeerConnection>} */
const conexionesAgotadas = new WeakSet();

/**
 * Abandona la negociación de una conexión cuya operación agotó su límite: si sigue siendo la vigente se libera
 * (cancelación lógica; la promesa nativa puede resolverse más tarde sin efecto).
 * @param {RTCPeerConnection} pc
 */
function abandonarNegociacion(pc) {
  conexionesAgotadas.add(pc);
  registrar('webrtc', 'negociacion', { detalle: 'negociacion-agotada' });
  notificar(estado.esperasNegociacion, 'negociacion-agotada');
  if (estado.pc === pc) cerrarPeer();
}

/**
 * Aplica el resultado de una operación acotada. Devuelve `true` si se puede continuar; si no, ya actuó.
 * @param {ResultadoOperacion} resultado
 * @param {RTCPeerConnection} pc
 * @param {() => boolean} vigente
 */
function continuar(resultado, pc, vigente) {
  if (!vigente()) return false;
  if (resultado.estado === 'ok') return true;
  if (resultado.estado === 'tiempo-agotado') {
    abandonarNegociacion(pc);
    return false;
  }
  if (resultado.estado === 'error') throw resultado.error;
  return false;
}

/** @param {keyof typeof ui.vistas} nombre */
function mostrar(nombre) {
  for (const [clave, vista] of Object.entries(ui.vistas)) vista.hidden = clave !== nombre;
  actualizarContinuidad();
}

/**
 * @param {keyof typeof ui.estado} campo
 * @param {string} texto
 */
function fijar(campo, texto) {
  ui.estado[campo].textContent = texto;
  actualizarContinuidad();
}

/**
 * @param {string} mensaje
 * @param {string} categoria Categoría de lista cerrada (ver `CATEGORIAS_ERROR` en medios.js).
 */
function mostrarError(mensaje, categoria) {
  ui.error.textContent = mensaje;
  ui.error.hidden = false;
  if (!estado.errores.includes(categoria)) estado.errores.push(categoria);
}

function limpiarError() {
  ui.error.textContent = '';
  ui.error.hidden = true;
}

/** @param {{ estadoHttp?: number, error?: string } | undefined} detalle */
function errorCanal(detalle) {
  switch (detalle?.estadoHttp) {
    case 401:
    case 403:
      return { texto: 'El enlace no es válido para esta sesión.', categoria: 'canal-no-autorizado' };
    case 404:
      return { texto: 'La sesión no existe o ya terminó.', categoria: 'canal-inexistente' };
    case 409:
      // E03-R01-04: solo el código `rol-ya-conectado` es un rol ocupado.
      return categoriaCanal(detalle) === 'rol-ocupado'
        ? { texto: 'Ya hay otro participante conectado con este rol.', categoria: 'canal-rol-ocupado' }
        : { texto: 'El servidor rechazó la conexión por un conflicto.', categoria: 'canal-perdido' };
    case 429:
      return { texto: 'El servidor local limitó las señales de esta sesión.', categoria: 'canal-perdido' };
    default:
      return detalle?.error === 'tiempo-agotado'
        ? { texto: 'El servidor local de señalización no respondió a tiempo.', categoria: 'canal-perdido' }
        : { texto: 'Se perdió la conexión con el servidor local de señalización.', categoria: 'canal-perdido' };
  }
}

// ---------- Estados visibles de continuidad ----------

/** @param {MediaStream | null} flujo */
function pistasDe(flujo) {
  try {
    return flujo ? flujo.getTracks() : [];
  } catch {
    return [];
  }
}

/** Estado de reproducción del video recibido, como en el informe de diagnóstico. */
function estadoReproduccion() {
  if (estado.rol !== 'espectador') return 'no-aplica';
  const video = ui.videoRemoto;
  if (video.srcObject === null) return 'sin-flujo';
  if (!ui.btnReproducir.hidden) return 'requiere-gesto';
  return video.paused ? 'pausada' : 'reproduciendo';
}

/** Anota una interrupción observada (E03-R01-02). */
function marcarInterrupcion() {
  estado.epocaInterrupcion += 1;
}

/** El último resultado de recuperación sigue describiendo la conexión actual (E03-R01-06). */
function resultadoVinculado() {
  return (
    estado.recuperacionResultado !== 'ninguna' &&
    estado.pc === estado.recuperacionPc &&
    estado.epocaInterrupcion === estado.recuperacionEpoca
  );
}

/**
 * Las pistas necesarias para confirmar medios: audio y video presentes y vivos (locales en el emisor, recibidas
 * en el espectador) y, para la confirmación final, sin silenciar.
 * @param {boolean} final
 */
function pistasAptas(final) {
  const pistas = estado.rol === 'emisor' ? pistasDe(estado.streamLocal) : pistasDe(estado.streamRemoto);
  const tipos = new Set(pistas.map((p) => p.kind));
  if (!tipos.has('audio') || !tipos.has('video')) return false;
  return pistas.every((p) => p.readyState === 'live' && (!final || !p.muted));
}

/** Señalización vigente y confirmada por la bienvenida. */
function canalConfirmado() {
  return estado.canal !== null && estado.canalDetalle === 'conectada' && estado.canalConfirmado;
}

/** Componentes observados en este instante, cada uno por separado. */
function componentes() {
  const pistas = estado.rol === 'emisor' ? pistasDe(estado.streamLocal) : estado.rol === 'espectador' ? pistasDe(estado.streamRemoto) : [];
  /** @type {import('./continuidad.js').Componentes} */
  const c = {
    rol: estado.rol,
    sesion: estado.terminado ? 'finalizada' : estado.sesionEstado,
    // E03-R01-05: HTTP 200 sin bienvenida sigue siendo una apertura en curso.
    canal: estado.canalDetalle === 'conectada' && !estado.canalConfirmado ? 'conectando' : estado.canalDetalle,
    canalMotivo: estado.canalMotivo,
    par: !canalConfirmado() ? 'desconocido' : estado.parPresente ? 'presente' : 'ausente',
    parMotivo: estado.parMotivo,
    pistas: estado.rol === null ? 'no-aplica' : estadoPistas(pistas),
    transporte: estado.pc ? estado.pc.connectionState : 'sin-conexion',
    reproduccion: /** @type {any} */ (estadoReproduccion()),
    recuperacion: estado.recuperacion ? 'en-curso' : resultadoVinculado() ? estado.recuperacionResultado : 'ninguna',
  };
  return c;
}

/** Actualiza los estados visibles por componente y el estado de continuidad derivado. */
function actualizarContinuidad() {
  const c = componentes();
  const { estado: e, motivo } = derivarContinuidad(c);
  const t = /** @type {Record<string, string>} */ (TEXTOS_MOTIVO)[motivo] ?? '';
  ui.continuidad.continuidad.textContent = `${/** @type {Record<string, string>} */ (TEXTOS_ESTADO)[e] ?? e}${t ? ` (${t})` : ''}`;
  ui.continuidad.sesion.textContent =
    c.sesion === 'vigente' ? 'vigente según esta página' : c.sesion === 'sin-sesion' ? '—' : c.sesion;
  ui.continuidad.par.textContent =
    c.par === 'presente' ? 'presente' : c.par === 'ausente' ? `ausente${c.parMotivo ? ` (${c.parMotivo})` : ''}` : 'desconocido (sin señalización)';
  ui.continuidad.pistas.textContent = c.pistas === 'no-aplica' ? '—' : c.pistas;
  ui.continuidad.reproduccion.textContent = c.reproduccion === 'no-aplica' ? '—' : c.reproduccion;
  // E03-R01-06: un resultado que ya no describe la conexión actual se conserva como antecedente, señalado.
  if (!estado.recuperacion && estado.recuperacionTexto) {
    ui.estadoRecuperacion.textContent = resultadoVinculado()
      ? estado.recuperacionTexto
      : `Último reintento (ya no describe el estado actual: hubo después una interrupción o una conexión distinta): ${estado.recuperacionTexto}`;
  }
  const activa = estado.rol !== null && !estado.terminado && estado.credenciales !== null;
  ui.vistaContinuidad.hidden = !activa;
  ui.btnReintentar.disabled = !activa || estado.recuperacion !== null;
}

// ---------- Oyentes de pistas ----------

/**
 * Registra mute, unmute y ended de unas pistas. Devuelve funciones que retiran los oyentes.
 * @param {MediaStreamTrack[]} pistas
 * @param {'local' | 'remota'} origen
 */
function escucharPistas(pistas, origen) {
  /** @type {(() => void)[]} */
  const quitar = [];
  for (const pista of pistas) {
    if (typeof pista.addEventListener !== 'function') continue;
    for (const tipo of /** @type {const} */ (['mute', 'unmute', 'ended'])) {
      const oyente = () => {
        registrar(origen === 'local' ? 'captura' : 'webrtc', origen === 'local' ? tipo : `pista-remota-${tipo}`, { pista: pista.kind });
        if (tipo !== 'unmute') marcarInterrupcion();
        if (origen === 'local' && tipo === 'ended' && !estado.terminado && estado.rol === 'emisor') {
          // La captura terminó de forma definitiva: solo una acción explícita la vuelve a activar.
          ui.btnActivar.disabled = false;
          fijar('medios', 'la captura terminó: activa de nuevo cámara y micrófono');
          return;
        }
        actualizarContinuidad();
      };
      pista.addEventListener(tipo, oyente);
      quitar.push(() => pista.removeEventListener(tipo, oyente));
    }
  }
  return quitar;
}

/** @param {(() => void)[]} lista */
function retirar(lista) {
  for (const quitar of lista.splice(0)) quitar();
}

// ---------- Señalización ----------

/**
 * Abre el canal de esta sesión. Si había otro, lo cierra antes (cierre intencional): un canal anterior no
 * entrega eventos ni estados, y como máximo hay un canal vigente por página.
 * @param {string} sesion
 * @param {string} token
 * @param {boolean} [reapertura]
 */
function abrirCanal(sesion, token, reapertura = false) {
  const anterior = estado.canal;
  estado.canal = null;
  anterior?.cerrar();
  // Cola propia de este canal: procesa sus eventos y sus cambios de estado de uno en uno y en orden. Un evento
  // cuyo canal ya no es el de la sesión en curso se descarta, y una tarea que espera a la red no retiene los
  // eventos de otra sesión.
  /** @type {Promise<void>} */
  let cola = Promise.resolve();
  /** @param {() => unknown} tarea */
  const encolar = (tarea) => {
    cola = cola
      .then(() => (estado.canal === canal ? tarea() : undefined))
      .then(() => undefined)
      .catch((error) => {
        if (estado.canal !== canal) return;
        mostrarError(
          `Error al procesar la señalización: ${error instanceof Error ? error.message : String(error)}`,
          'senal-procesamiento',
        );
      });
  };
  const canal = new CanalSenalizacion({
    sesion,
    token,
    alEvento: (e) => {
      // E03-R02-01: un fin del servidor en el canal vigente tiene prioridad sobre la cola: no espera a que
      // termine una negociación pendiente. Termina la sesión en el acto (y con ello invalida y cancela todo lo
      // pendiente). Los eventos de un canal que ya no es el vigente no llegan aquí o se descartan.
      if (e.evento === 'fin') {
        if (estado.canal === canal) manejarFin(/** @type {Record<string, any>} */ (e.datos ?? {}));
        return;
      }
      encolar(() => manejarEvento(e));
    },
    // E03-R03-01: los cambios de estado del canal (conectada, interrumpida, error, cerrada) se aplican en el
    // orden en que el canal los observa, sin esperar a la cola de señales: una operación WebRTC pendiente no
    // puede retrasar la invalidación de la señalización. `manejarEstadoCanal` es síncrono, no espera a la red y
    // descarta los estados de un canal que ya no es el vigente. Las señales siguen serializadas en la cola.
    alEstado: (e, detalle) => manejarEstadoCanal(canal, e, detalle),
  });
  estado.canal = canal;
  estado.canalEstado = 'conectando';
  estado.canalDetalle = 'conectando';
  estado.canalConfirmado = false;
  estado.canalMotivo = null;
  // Un rechazo de credenciales de una apertura anterior no describe esta: la respuesta nueva decide.
  if (estado.sesionEstado === 'no-autorizada') estado.sesionEstado = 'vigente';
  registrar('senalizacion', reapertura ? 'reapertura' : 'apertura');
  actualizarContinuidad();
  void canal.abrir();
  return canal;
}

/**
 * @param {CanalSenalizacion} canal
 * @param {EstadoCanal} e
 * @param {{ estadoHttp?: number, error?: string }} [detalle]
 */
function manejarEstadoCanal(canal, e, detalle) {
  if (estado.canal !== canal) return;
  // E03-R03-01: un canal que se interrumpió, falló o se cerró ya no se puede confirmar después (por ejemplo,
  // con una bienvenida que quedó encolada detrás de una negociación).
  if (e === 'interrumpida' || e === 'error' || e === 'cerrada') canalesTerminados.add(canal);
  estado.canalDetalle = e;
  estado.canalEstado = e === 'interrumpida' ? 'error' : e;
  if (e === 'conectada') {
    estado.canalMotivo = null;
    estado.canalConectadoAlgunaVez = true;
    registrar('senalizacion', 'conectada');
  }
  fijar('senal', e);
  if ((e === 'error' || e === 'interrumpida') && !estado.terminado) {
    const categoria = categoriaCanal(detalle);
    estado.canalMotivo = categoria;
    estado.canalConfirmado = false;
    marcarInterrupcion();
    registrar('senalizacion', e, { detalle: categoria });
    if (categoria === 'sesion-inexistente') estado.sesionEstado = 'inexistente';
    else if (categoria === 'no-autorizado') estado.sesionEstado = 'no-autorizada';
    const error = errorCanal(detalle);
    mostrarError(
      estado.credenciales && categoria !== 'sesion-inexistente' && categoria !== 'no-autorizado'
        ? `${error.texto} La sesión puede seguir vigente: pulsa «Reintentar conexión».`
        : error.texto,
      error.categoria,
    );
    notificar(estado.esperasBienvenida, { ok: false, detalle: categoria }, canal);
    // E03: perder la señalización no cierra la conexión WebRTC de esta página: los medios pueden seguir.
    // Si el servidor confirma que la sesión ya no existe, la sesión no se puede recuperar: se liberan la
    // captura y las conexiones (condición terminal documentada).
    if (categoria === 'sesion-inexistente' && estado.canalConectadoAlgunaVez) {
      registrar('finalizacion', 'terminacion-remota', { detalle: 'sesion-inexistente' });
      terminar('La sesión ya no existe en el servidor (finalizada, caducada o inexistente). Se liberaron la captura y las conexiones de esta página.', 'sesion-terminada');
    }
  }
  actualizarContinuidad();
}

/** @param {EventoSse} e */
async function manejarEvento({ evento, datos }) {
  const d = /** @type {Record<string, any>} */ (datos ?? {});
  const canal = estado.canal;
  if (evento === 'bienvenida') {
    // E03-R03-01: una bienvenida procesada después de que su canal se interrumpiera no confirma nada.
    if (canal && canalesTerminados.has(canal)) {
      registrar('senalizacion', 'senal-ignorada', { detalle: 'bienvenida-tardia' });
      return;
    }
    estado.parPresente = Boolean(d.parPresente);
    estado.parMotivo = null;
    estado.canalConfirmado = true;
    registrar('senalizacion', 'bienvenida', { estado: estado.parPresente ? 'presente' : 'ausente' });
    // E03-R01-05: la bienvenida se reconoce antes de lanzar la negociación, que puede tardar. La parte síncrona
    // de `iniciarOferta` (nueva negociación) corre antes de que la recuperación reanude.
    notificar(estado.esperasBienvenida, { ok: true, parPresente: estado.parPresente }, canal);
    if (estado.rol === 'emisor') {
      fijar('conexion', estado.parPresente ? 'espectador presente' : 'esperando espectador');
      if (estado.parPresente && estado.streamLocal) await iniciarOferta();
    } else {
      fijar('conexion', estado.parPresente ? 'esperando oferta del emisor' : 'esperando al emisor');
    }
  } else if (evento === 'par') {
    estado.parPresente = Boolean(d.presente);
    estado.parMotivo = estado.parPresente ? null : d.motivo === 'salida' || d.motivo === 'desconexion' ? d.motivo : null;
    registrar('senalizacion', estado.parPresente ? 'par-presente' : 'par-ausente', { detalle: estado.parMotivo ?? undefined });
    if (estado.parPresente) {
      if (estado.rol === 'emisor') {
        fijar('conexion', 'espectador presente');
        if (estado.streamLocal) await iniciarOferta();
      } else {
        fijar('conexion', 'esperando oferta del emisor');
      }
    } else {
      // Comportamiento de E01/E02, conservado: sin el otro participante en la señalización, la conexión WebRTC
      // local se libera (el otro puede haber salido o finalizado sin que su aviso llegara).
      cerrarPeer();
      fijar('conexion', estado.rol === 'emisor' ? 'esperando espectador' : 'el emisor se desconectó');
    }
  } else if (evento === 'senal') {
    await manejarSenal(d);
  }
}

/**
 * Fin explícito, caducidad, abandono o detención del servidor: siempre terminal. Una salida voluntaria del
 * espectador llega al espectador como fin de su propia participación. Una interrupción ordinaria del canal no
 * pasa por aquí (es un estado `interrumpida`, no un evento `fin`).
 * @param {Record<string, any>} d
 */
function manejarFin(d) {
  {
    const motivo = String(d.motivo);
    const conocido = Object.hasOwn(MOTIVOS_FIN, motivo);
    registrar('senalizacion', 'fin-recibido', { detalle: conocido ? motivo : 'motivo-desconocido' });
    if (motivo === 'expirada') registrar('finalizacion', 'caducidad', { detalle: 'expirada' });
    else if (!(estado.rol === 'emisor' && motivo === 'finalizada-por-el-emisor') && motivo !== 'salida-del-espectador') {
      registrar('finalizacion', 'terminacion-remota', { detalle: conocido ? motivo : 'motivo-desconocido' });
    }
    terminar(
      estado.rol === 'emisor' && motivo === 'finalizada-por-el-emisor'
        ? 'Emisión finalizada.'
        : (MOTIVOS_FIN[motivo] ?? 'La sesión terminó.'),
      'sesion-terminada',
    );
  }
}

/** @param {number | null} neg */
function crearPeer(neg) {
  const pc = new RTCPeerConnection(CONFIG_RTC);
  const canal = estado.canal;
  estado.pc = pc;
  estado.candidatosPendientes = [];
  registrar('webrtc', 'creada');
  // Los candidatos propios se retienen hasta que la descripción local (oferta o respuesta) llegó al servidor:
  // así el otro participante nunca recibe candidatos de una negociación antes que su descripción.
  /** @type {{ listo: boolean, cola: Record<string, unknown>[] }} */
  const salientes = { listo: false, cola: [] };
  salientesPorPc.set(pc, salientes);
  pc.onicecandidate = (e) => {
    if (!e.candidate || estado.pc !== pc || !estado.canal || estado.canal !== canal) return;
    const c = e.candidate.toJSON();
    const senal = {
      tipo: 'candidato',
      ...(neg === null ? {} : { neg }),
      candidato: {
        candidate: c.candidate ?? '',
        sdpMid: c.sdpMid ?? null,
        sdpMLineIndex: c.sdpMLineIndex ?? null,
        usernameFragment: c.usernameFragment ?? null,
      },
    };
    if (salientes.listo) void canal.enviar(senal);
    else if (salientes.cola.length < LIMITES_RECUPERACION.maxCandidatosEnCola) salientes.cola.push(senal);
    else {
      estado.senalesDescartadas += 1;
      registrar('webrtc', 'candidatos-descartados', { detalle: 'cola-llena' });
    }
  };
  pc.onconnectionstatechange = () => {
    if (estado.pc !== pc) return;
    registrar('webrtc', 'conexion', { estado: pc.connectionState });
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') marcarInterrupcion();
    fijar('conexion', pc.connectionState);
    if (pc.connectionState === 'connected' || pc.connectionState === 'failed') notificar(estado.esperasConexion, pc.connectionState, pc);
    if (pc.connectionState === 'failed') {
      mostrarError(
        'La conexión WebRTC falló. Sin STUN/TURN solo funciona en el mismo equipo o en una red local sin aislamiento.',
        'webrtc-conexion-fallida',
      );
    }
  };
  pc.oniceconnectionstatechange = () => {
    if (estado.pc !== pc) return;
    registrar('webrtc', 'ice', { estado: pc.iceConnectionState });
    fijar('ice', pc.iceConnectionState);
  };
  pc.onsignalingstatechange = () => {
    if (estado.pc === pc) registrar('webrtc', 'senalizacion', { estado: pc.signalingState });
  };
  if (estado.rol === 'espectador') pc.ontrack = recibirPista;
  fijar('conexion', pc.connectionState);
  fijar('ice', pc.iceConnectionState);
  return pc;
}

/** Candidatos salientes retenidos de cada conexión. */
/** @type {WeakMap<RTCPeerConnection, { listo: boolean, cola: Record<string, unknown>[] }>} */
const salientesPorPc = new WeakMap();

/**
 * La descripción local ya llegó al servidor: se envían los candidatos retenidos y los siguientes, en el acto.
 * @param {RTCPeerConnection} pc
 * @param {CanalSenalizacion} canal
 */
function liberarCandidatosSalientes(pc, canal) {
  const salientes = salientesPorPc.get(pc);
  if (!salientes || estado.pc !== pc || estado.canal !== canal) return;
  salientes.listo = true;
  for (const senal of salientes.cola.splice(0)) void canal.enviar(senal);
}

function cerrarPeer() {
  const pc = estado.pc;
  estado.pc = null;
  estado.candidatosPendientes = [];
  estado.negPendiente = false;
  if (pc) {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    pc.onsignalingstatechange = null;
    salientesPorPc.delete(pc);
    pc.close();
    marcarInterrupcion();
    registrar('webrtc', 'cerrada');
    notificar(estado.esperasConexion, 'sustituida', pc);
    fijar('conexion', 'cerrada');
    fijar('ice', '—');
  }
  retirar(estado.quitarOyentesRemotos);
  if (estado.streamRemoto) {
    for (const pista of estado.streamRemoto.getTracks()) pista.stop();
    estado.streamRemoto = null;
  }
  ui.videoRemoto.srcObject = null;
  actualizarContinuidad();
}

/** @param {RTCPeerConnection} pc */
async function aplicarCandidatosPendientes(pc) {
  const pendientes = estado.candidatosPendientes;
  estado.candidatosPendientes = [];
  // E03-R02-02: cada candidato acotado; un fallo o un agotamiento de un candidato no detiene la negociación.
  for (const candidato of pendientes) {
    if (estado.pc !== pc) return;
    await acotar(pc.addIceCandidate(candidato));
  }
}

/** @param {string} detalle */
function descartarSenal(detalle) {
  estado.senalesDescartadas += 1;
  registrar('senalizacion', 'senal-obsoleta', { detalle });
}

/** @param {unknown} valor */
function negDe(valor) {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= MAX_NEGOCIACION ? valor : null;
}

/** @param {Record<string, any>} senal */
async function manejarSenal(senal) {
  const canal = estado.canal;
  if (senal.tipo === 'oferta' && estado.rol === 'espectador' && canal) {
    // E03-R01-01: antes de tocar la conexión vigente se comprueba que la oferta es posterior a la última
    // aceptada. Una oferta atrasada, repetida o sin identificador (tras una correlacionada) se descarta sin
    // cerrar nada ni responder. Solo el emisor crea ofertas.
    if (ofertaAceptable({ ultima: estado.negRemota }, senal.neg) !== 'aceptar') {
      descartarSenal('oferta');
      return;
    }
    const neg = negDe(senal.neg);
    cerrarPeer();
    estado.negRemota = neg;
    const pc = crearPeer(neg);
    // Si la conexión, el canal o la negociación cambian durante una espera, la tarea termina sin tocar nada.
    const vigente = () => estado.pc === pc && estado.canal === canal && estado.negRemota === neg;
    // E03-R02-02: cada operación nativa está acotada; si se agota, la negociación se abandona y la cola sigue.
    if (!continuar(await acotar(pc.setRemoteDescription({ type: 'offer', sdp: senal.sdp })), pc, vigente)) return;
    registrar('webrtc', 'negociacion', { detalle: 'oferta-aplicada' });
    await aplicarCandidatosPendientes(pc);
    if (!vigente()) return;
    const respuesta = await acotar(pc.createAnswer());
    if (!continuar(respuesta, pc, vigente)) return;
    if (!continuar(await acotar(pc.setLocalDescription(/** @type {any} */ (respuesta).valor)), pc, vigente)) return;
    const r = await canal.enviar({ tipo: 'respuesta', sdp: pc.localDescription?.sdp, ...(neg === null ? {} : { neg }) });
    if (!vigente()) return;
    if (!r.ok) {
      registrar('webrtc', 'negociacion', { detalle: 'respuesta-no-enviada' });
      mostrarError(`No se pudo enviar la respuesta (${categoriaCanal(r)}).`, 'senal-respuesta-no-enviada');
      notificar(estado.esperasNegociacion, 'respuesta-no-enviada');
      return;
    }
    registrar('webrtc', 'negociacion', { detalle: 'respuesta-enviada' });
    estado.ofertasRespondidas += 1;
    liberarCandidatosSalientes(pc, canal);
    notificar(estado.esperasNegociacion, 'respondida');
  } else if (senal.tipo === 'respuesta' && estado.rol === 'emisor') {
    const pc = estado.pc;
    // Solo se aplica la respuesta de la negociación vigente y si la conexión la espera.
    if (!pc || negDe(senal.neg) !== estado.neg || pc.signalingState !== 'have-local-offer') {
      descartarSenal('respuesta');
      return;
    }
    const neg = estado.neg;
    const aplicada = await acotar(pc.setRemoteDescription({ type: 'answer', sdp: senal.sdp }));
    if (!continuar(aplicada, pc, () => estado.pc === pc && estado.neg === neg && !estado.terminado)) return;
    estado.negPendiente = false;
    registrar('webrtc', 'negociacion', { detalle: 'respuesta-aplicada' });
    await aplicarCandidatosPendientes(pc);
  } else if (senal.tipo === 'candidato') {
    const pc = estado.pc;
    const esperada = estado.rol === 'emisor' ? estado.neg : estado.negRemota;
    if (!pc || negDe(senal.neg) !== esperada) {
      descartarSenal('candidato');
      return;
    }
    if (pc.remoteDescription) await acotar(pc.addIceCandidate(senal.candidato));
    else if (estado.candidatosPendientes.length < LIMITES_RECUPERACION.maxCandidatosEnCola) estado.candidatosPendientes.push(senal.candidato);
    else descartarSenal('candidato');
  } else if (senal.tipo === 'solicitud-oferta' && estado.rol === 'emisor') {
    await atenderSolicitudOferta();
  }
}

// ---------- Emisor ----------

async function crearSesionEmisor() {
  limpiarError();
  ui.btnCrear.disabled = true;
  const generacion = estado.generacion;
  const r = await crearSesion();
  ui.btnCrear.disabled = false;
  // E03-R02-03: si mientras tanto cambió la sesión de la página, el resultado no se aplica.
  if (estado.generacion !== generacion || estado.rol !== null) return;
  if (!r.ok) {
    mostrarError(
      r.estadoHttp === 503
        ? 'Se alcanzó el máximo de sesiones de prueba. Espera a que caduquen o reinicia el servidor.'
        : 'No se pudo crear la sesión en el servidor local.',
      r.estadoHttp === 503 ? 'sesion-limite-alcanzado' : 'sesion-no-creada',
    );
    return;
  }
  estado.rol = 'emisor';
  estado.terminado = false;
  estado.captura = 'sin-activar';
  estado.codigoCaptura = null;
  estado.sesionEstado = 'vigente';
  estado.credenciales = { sesion: r.sesion, token: r.tokenEmisor };
  cronologia.fijarRol('emisor');
  cronologia.nuevaSesionLocal();
  ui.enlace.value = `${location.origin}/?s=${encodeURIComponent(r.sesion)}#${r.tokenEspectador}`;
  ui.btnActivar.disabled = false;
  fijar('rol', 'emisor');
  fijar('medios', 'cámara y micrófono sin activar');
  mostrar('emisor');
  abrirCanal(r.sesion, r.tokenEmisor);
}

async function activarMedios() {
  // La captura queda ligada a la sesión y al intento en que se pidió. Si al resolverse ya no son los
  // vigentes (la sesión terminó o empezó otra), el flujo se detiene y la interfaz no cambia.
  const generacion = estado.generacion;
  const intento = ++estado.intentoCaptura;
  const vigente = () => estado.generacion === generacion && estado.intentoCaptura === intento;
  limpiarError();
  ui.btnActivar.disabled = true;
  // E03-R01-07: una captura anterior (por ejemplo, con una pista terminada por el sistema y otra aún viva) se
  // libera ANTES de pedir la nueva: nunca hay pistas locales de dos capturas activas a la vez.
  const anterior = estado.streamLocal;
  if (anterior) {
    retirar(estado.quitarOyentesLocales);
    liberarMedios(anterior);
    estado.streamLocal = null;
    ui.videoLocal.srcObject = null;
    registrar('captura', 'liberada');
  }
  estado.captura = 'solicitando';
  registrar('captura', 'solicitud');
  fijar('medios', 'solicitando permiso…');
  const r = await solicitarMedios({ isSecureContext: window.isSecureContext, mediaDevices: navigator.mediaDevices });
  if (!vigente()) {
    if (r.ok) {
      estado.historialLocal.push(r.stream);
      liberarMedios(r.stream);
      estado.capturasDescartadas += 1;
      registrar('captura', 'tardia-descartada');
    }
    return;
  }
  if (!r.ok) {
    ui.btnActivar.disabled = false;
    estado.captura = 'sin-captura';
    estado.codigoCaptura = r.codigo;
    registrar('captura', 'rechazada', { detalle: r.codigo });
    fijar('medios', `sin captura (${r.codigo})`);
    mostrarError(r.mensaje, `captura-${r.codigo}`);
    return;
  }
  estado.captura = 'activa';
  estado.codigoCaptura = null;
  estado.streamLocal = r.stream;
  estado.historialLocal.push(r.stream);
  estado.quitarOyentesLocales = escucharPistas(pistasDe(r.stream), 'local');
  registrar('captura', 'concedida');
  ui.videoLocal.muted = true;
  ui.videoLocal.srcObject = r.stream;
  void ui.videoLocal.play().catch(() => {});
  fijar('medios', 'cámara y micrófono activos (vista previa silenciada)');
  if (estado.parPresente) await iniciarOferta();
}

/** Pistas locales vivas: la renegociación las reutiliza; si alguna terminó, hay que volver a capturar. */
function capturaUtilizable() {
  const pistas = pistasDe(estado.streamLocal);
  return pistas.length > 0 && pistas.every((p) => p.readyState === 'live');
}

/**
 * Crea una negociación nueva con las pistas locales existentes (sin volver a capturar) y envía la oferta.
 * Sustituye la conexión anterior: como máximo hay una conexión vigente.
 * @returns {Promise<'enviada' | 'no-enviada' | 'agotada' | 'obsoleta' | 'sin-negociar'>}
 */
async function iniciarOferta() {
  const stream = estado.streamLocal;
  const canal = estado.canal;
  if (!stream || !canal || estado.terminado || estado.rol !== 'emisor') return 'sin-negociar';
  if (!capturaUtilizable()) {
    registrar('senalizacion', 'senal-ignorada', { detalle: 'sin-captura' });
    return 'sin-negociar';
  }
  // E03-R01-01: los identificadores crecen y no dan la vuelta; al llegar al máximo no se negocia más.
  const neg = siguienteNegociacion(estado.neg);
  if (neg === null) {
    registrar('senalizacion', 'senal-ignorada', { detalle: 'limite-negociaciones' });
    mostrarError('Se alcanzó el máximo de negociaciones de esta página: crea una sesión nueva.', 'senal-oferta-no-enviada');
    return 'sin-negociar';
  }
  cerrarPeer();
  estado.neg = neg;
  estado.negPendiente = true;
  estado.ultimaOfertaEn = reloj();
  const pc = crearPeer(neg);
  const vigente = () => estado.pc === pc && estado.canal === canal && estado.neg === neg && !estado.terminado;
  for (const pista of stream.getTracks()) pc.addTrack(pista, stream);
  // E03-R02-02: createOffer y setLocalDescription acotadas; una conexión sustituida o cerrada durante la espera
  // no es un error de la sesión vigente.
  const oferta = await acotar(pc.createOffer());
  if (!vigente()) return 'obsoleta';
  if (oferta.estado === 'tiempo-agotado') return (abandonarNegociacion(pc), 'agotada');
  if (!continuar(oferta, pc, vigente)) return 'obsoleta';
  const local = await acotar(pc.setLocalDescription(/** @type {any} */ (oferta).valor));
  if (!vigente()) return 'obsoleta';
  if (local.estado === 'tiempo-agotado') return (abandonarNegociacion(pc), 'agotada');
  if (!continuar(local, pc, vigente)) return 'obsoleta';
  const r = await canal.enviar({ tipo: 'oferta', sdp: pc.localDescription?.sdp, neg });
  if (!vigente()) return 'obsoleta';
  if (!r.ok) {
    estado.negPendiente = false;
    registrar('webrtc', 'negociacion', { detalle: 'oferta-no-enviada' });
    mostrarError(`No se pudo enviar la oferta (${categoriaCanal(r)}).`, 'senal-oferta-no-enviada');
    return 'no-enviada';
  }
  registrar('webrtc', 'negociacion', { detalle: 'oferta-enviada' });
  liberarCandidatosSalientes(pc, canal);
  return 'enviada';
}

/** El espectador pidió una negociación nueva: el emisor la crea si procede (es el único que ofrece). */
async function atenderSolicitudOferta() {
  registrar('recuperacion', 'solicitud-oferta-recibida');
  if (estado.terminado) return;
  if (!estado.streamLocal || !capturaUtilizable()) {
    registrar('senalizacion', 'senal-ignorada', { detalle: 'sin-captura' });
    return;
  }
  if (!estado.parPresente) {
    registrar('senalizacion', 'senal-ignorada', { detalle: 'sin-participante' });
    return;
  }
  const transcurrido = reloj() - estado.ultimaOfertaEn;
  if (transcurrido < LIMITES_RECUPERACION.intervaloMinOfertasMs) {
    registrar('senalizacion', 'senal-ignorada', { detalle: 'demasiado-pronto' });
    return;
  }
  if (estado.negPendiente && transcurrido < LIMITES_RECUPERACION.negociacionMs) {
    registrar('senalizacion', 'senal-ignorada', { detalle: 'negociacion-en-curso' });
    return;
  }
  await iniciarOferta();
}

/**
 * Envía el aviso de fin o de salida. E03-R01-08: si no hay canal vigente (por ejemplo, tras una reapertura
 * agotada) pero la sesión conserva sus credenciales en memoria, el aviso se envía con esa autorización, por
 * POST, sin reabrir el flujo de eventos. Sin credenciales, no hay aviso posible.
 * @param {{ tipo: 'fin' | 'salir' }} senal
 */
function enviarAvisoCierre(senal) {
  if (estado.canal) return estado.canal.enviar(senal);
  const c = estado.credenciales;
  if (!c) return undefined;
  return new CanalSenalizacion({ sesion: c.sesion, token: c.token, alEvento: () => {}, alEstado: () => {} }).enviar(senal);
}

function finalizarEmision() {
  if (estado.rol !== 'emisor' || estado.terminado) return;
  ui.btnFinalizar.disabled = true;
  registrar('finalizacion', 'finalizacion-voluntaria');
  // El cierre local no espera a la red: se lanza el aviso y se liberan los medios en el acto.
  const aviso = enviarAvisoCierre({ tipo: 'fin' });
  terminar('Emisión finalizada.', 'finalizacion');
  if (aviso) void seguirAvisoCierre(aviso, 'fin');
}

function nuevaSesion() {
  estado.generacion += 1;
  limpiarError();
  estado.rol = null;
  estado.terminado = false;
  estado.parPresente = false;
  estado.parMotivo = null;
  estado.avisoCierre = 'sin-aviso';
  estado.canalEstado = 'sin-canal';
  estado.canalDetalle = 'sin-canal';
  estado.canalMotivo = null;
  estado.canalConectadoAlgunaVez = false;
  estado.sesionEstado = 'sin-sesion';
  estado.credenciales = null;
  estado.captura = 'sin-sesion';
  estado.codigoCaptura = null;
  estado.recuperacionResultado = 'ninguna';
  estado.recuperacionDetalle = null;
  estado.recuperacionPc = null;
  estado.recuperacionEpoca = -1;
  estado.recuperacionTexto = '';
  estado.canalConfirmado = false;
  ui.estadoRecuperacion.textContent = '';
  ui.enlace.value = '';
  ui.btnFinalizar.disabled = false;
  ui.btnActivar.disabled = false;
  for (const campo of /** @type {(keyof typeof ui.estado)[]} */ (Object.keys(ui.estado))) fijar(campo, '—');
  history.replaceState(null, '', '/');
  mostrar('inicio');
}

// ---------- Espectador ----------

/**
 * @param {string} sesion
 * @param {string} token
 */
function iniciarEspectador(sesion, token) {
  estado.rol = 'espectador';
  estado.captura = 'no-aplica';
  cronologia.fijarRol('espectador');
  cronologia.nuevaSesionLocal();
  fijar('rol', 'espectador');
  mostrar('espectador');
  if (!PATRON_SESION.test(sesion) || !PATRON_TOKEN.test(token)) {
    estado.canalEstado = 'no-iniciada';
    fijar('senal', 'no iniciada');
    mostrarError('El enlace del espectador está incompleto o no es válido.', 'enlace-incompleto');
    return;
  }
  estado.sesionEstado = 'vigente';
  estado.credenciales = { sesion, token };
  fijar('medios', 'esperando medios del emisor');
  abrirCanal(sesion, token);
}

/** @param {RTCTrackEvent} e */
function recibirPista(e) {
  const stream = e.streams[0] ?? estado.streamRemoto ?? new MediaStream();
  if (!e.streams[0]) stream.addTrack(e.track);
  estado.streamRemoto = stream;
  registrar('webrtc', 'pista-remota', { pista: e.track?.kind });
  if (e.track) estado.quitarOyentesRemotos.push(...escucharPistas([e.track], 'remota'));
  if (ui.videoRemoto.srcObject !== stream) ui.videoRemoto.srcObject = stream;
  fijar('medios', `recibiendo: ${stream.getTracks().map((p) => p.kind).join(' + ')}`);
  void intentarReproducir();
}

async function intentarReproducir() {
  const generacion = estado.generacion;
  try {
    await ui.videoRemoto.play();
    // E03-R02-03: una reproducción que se resuelve tras terminar la sesión no toca la interfaz.
    if (estado.generacion !== generacion || estado.terminado) return;
    ui.btnReproducir.hidden = true;
    fijar('medios', 'reproduciendo audio y video del emisor');
  } catch (error) {
    if (estado.generacion !== generacion || estado.terminado) return;
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      ui.btnReproducir.hidden = false;
      if (!estado.errores.includes('reproduccion-requiere-gesto')) estado.errores.push('reproduccion-requiere-gesto');
      fijar('medios', 'el navegador requiere una acción para reproducir');
    }
  }
}

function salirEspectador() {
  if (estado.rol !== 'espectador' || estado.terminado) return;
  ui.btnSalir.disabled = true;
  registrar('finalizacion', 'salida-voluntaria');
  const aviso = enviarAvisoCierre({ tipo: 'salir' });
  terminar('Has salido de la sesión.', 'salida', aviso);
  if (aviso) void seguirAvisoCierre(aviso, 'salir');
}

// ---------- Recuperación manual controlada (E03) ----------

/**
 * @param {() => boolean} vigente
 * @param {number} ms
 */
async function pausaCancelable(vigente, ms) {
  if (!vigente()) return false;
  const r = await esperarEn(estado.esperasPausa, ms, 'cumplida');
  return r === 'cumplida' && vigente();
}

/**
 * Reabre la señalización de la sesión vigente con las credenciales en memoria y espera la bienvenida. Un 409
 * (rol ocupado: el servidor aún conserva el canal anterior) se reintenta un número acotado de veces dentro de
 * este mismo reintento manual. Nunca expulsa ni sustituye al canal registrado en el servidor.
 * @param {() => boolean} vigente
 * @returns {Promise<{ ok: true, parPresente: boolean } | { ok: false, detalle: string }>}
 */
async function reabrirCanal(vigente) {
  const credenciales = estado.credenciales;
  if (!credenciales) return { ok: false, detalle: 'sesion-terminada' };
  /** @type {{ ok: true, parPresente: boolean } | { ok: false, detalle: string }} */
  let resultado = { ok: false, detalle: 'red' };
  /** @type {CanalSenalizacion | null} */
  let ultimo = null;
  for (let intento = 1; intento <= LIMITES_RECUPERACION.intentosRolOcupado; intento += 1) {
    if (!vigente()) return { ok: false, detalle: 'sustituida' };
    const canal = abrirCanal(credenciales.sesion, credenciales.token, true);
    ultimo = canal;
    resultado = await esperarEn(estado.esperasBienvenida, LIMITES_RECUPERACION.bienvenidaMs, { ok: false, detalle: 'tiempo-agotado' }, canal);
    if (!vigente()) return { ok: false, detalle: 'sustituida' };
    if (resultado.ok || resultado.detalle !== 'rol-ocupado') break;
    if (intento < LIMITES_RECUPERACION.intentosRolOcupado && !(await pausaCancelable(vigente, LIMITES_RECUPERACION.pausaRolOcupadoMs))) {
      return { ok: false, detalle: 'sustituida' };
    }
  }
  if (!resultado.ok && resultado.detalle === 'tiempo-agotado' && ultimo !== null && estado.canal === ultimo && !estado.canalConfirmado) {
    // E03-R01-05: la bienvenida no llegó a tiempo, aunque el servidor hubiera respondido HTTP 200. La apertura
    // no confirmada se cancela y no queda como canal utilizable.
    const canal = estado.canal;
    estado.canal = null;
    canal.cerrar();
    marcarInterrupcion();
    estado.canalDetalle = 'error';
    estado.canalEstado = 'error';
    estado.canalMotivo = 'tiempo-agotado';
    registrar('senalizacion', 'error', { detalle: 'tiempo-agotado' });
    fijar('senal', 'error');
  }
  return resultado;
}

/**
 * Lee las estadísticas agregadas de la conexión indicada, acotadas en el tiempo. `null` si no están
 * disponibles o si la conexión o la sesión cambiaron mientras se esperaban.
 * @param {RTCPeerConnection} pc
 */
async function leerAgregadas(pc) {
  const r = await estadisticasDelInforme(pc, estado.generacion);
  return r.estado === 'ok' ? agregarEstadisticas(r.registros) : null;
}

/**
 * Comprueba con lecturas sucesivas de la MISMA conexión vigente que los medios avanzan. Compara cada lectura
 * con la anterior y se detiene al confirmar o al agotar `LIMITES_RECUPERACION.lecturasProgreso`.
 *
 * E03-R01-02: el crecimiento de los contadores no basta. Antes y después de cada lectura se exige que siga el
 * mismo intento, la misma conexión en `connected`, la señalización confirmada, las pistas de audio y video
 * vivas y ninguna interrupción observada desde el inicio de la comprobación (época). Si algo de eso falla, las
 * lecturas no se aprovechan: el resultado es `interrumpida` (o `descartada` si el intento ya no es vigente).
 * @param {RTCPeerConnection} pc
 * @param {() => boolean} vigente
 * @returns {Promise<'descartada' | 'interrumpida' | { progreso: ReturnType<typeof evaluarProgreso>, pc: RTCPeerConnection, epoca: number }>}
 */
async function verificarProgreso(pc, vigente) {
  const rol = /** @type {'emisor' | 'espectador'} */ (estado.rol);
  const epoca = estado.epocaInterrupcion;
  /** @param {boolean} final */
  const apto = (final) =>
    vigente() && estado.pc === pc && pc.connectionState === 'connected' && estado.epocaInterrupcion === epoca && canalConfirmado() && pistasAptas(final);
  const fallo = () => (vigente() ? 'interrumpida' : 'descartada');
  if (!apto(false)) return fallo();
  let antes = await leerAgregadas(pc);
  if (!apto(false)) return fallo();
  /** @type {ReturnType<typeof evaluarProgreso>} */
  let progreso = 'no-verificable';
  for (let lectura = 2; lectura <= LIMITES_RECUPERACION.lecturasProgreso; lectura += 1) {
    if (!(await pausaCancelable(vigente, LIMITES_RECUPERACION.intervaloProgresoMs)) || !apto(false)) return fallo();
    const despues = await leerAgregadas(pc);
    if (!apto(false)) return fallo();
    progreso = evaluarProgreso(rol, antes, despues);
    if (progreso === 'envio-confirmado' || progreso === 'recepcion-confirmada') {
      return apto(true) ? { progreso, pc, epoca } : fallo();
    }
    antes = despues;
  }
  return { progreso, pc, epoca };
}

/**
 * Espera a que la conexión vigente quede `connected` (o falle), con límite.
 * @param {RTCPeerConnection | null} pc
 */
async function esperarConexion(pc) {
  if (!pc) return 'sin-conexion';
  if (pc.connectionState === 'connected') return 'connected';
  if (pc.connectionState === 'failed' || pc.connectionState === 'closed') return pc.connectionState;
  return esperarEn(estado.esperasConexion, LIMITES_RECUPERACION.conexionMs, 'tiempo-agotado', pc);
}

/**
 * Tras renegociar: espera la conexión y comprueba el progreso de los medios.
 * @param {() => boolean} vigente
 * @returns {Promise<ResultadoRecuperacion | null>} `null` si quedó obsoleta.
 */
async function confirmarTransporteYMedios(vigente) {
  const pc = estado.pc;
  const conexion = await esperarConexion(pc);
  if (!vigente()) return null;
  if (conexion !== 'connected' || !pc || estado.pc !== pc) {
    // E03-R02-02: la conexión se liberó porque una operación de su negociación agotó su límite.
    if (pc && conexionesAgotadas.has(pc)) return { ...NEGOCIACION_AGOTADA };
    return conexion === 'tiempo-agotado'
      ? { tipo: 'agotada', detalle: 'transporte-no-conectado', texto: 'La conexión WebRTC no se estableció a tiempo.' }
      : { tipo: 'fallo', detalle: 'transporte-no-conectado', texto: 'La conexión WebRTC no se estableció.' };
  }
  return resultadoDeProgreso(await verificarProgreso(pc, vigente));
}

/** @type {ResultadoRecuperacion} */
const NEGOCIACION_AGOTADA = {
  tipo: 'agotada',
  detalle: 'negociacion-agotada',
  texto: 'La negociación WebRTC no terminó a tiempo (una operación del navegador no respondió): se liberó la conexión de este intento. Puedes volver a intentarlo.',
};

/** @type {ResultadoRecuperacion} */
const INTERRUMPIDA_DURANTE_COMPROBACION = {
  tipo: 'fallo',
  detalle: 'interrupcion-durante-comprobacion',
  texto: 'Hubo una interrupción mientras se comprobaba (conexión, señalización o pistas): la recuperación no se confirma.',
};

/**
 * @param {Awaited<ReturnType<typeof verificarProgreso>>} verificacion
 * @returns {ResultadoRecuperacion | null}
 */
function resultadoDeProgreso(verificacion) {
  if (verificacion === 'descartada') return null;
  if (verificacion === 'interrumpida') return { ...INTERRUMPIDA_DURANTE_COMPROBACION };
  const { progreso, pc, epoca } = verificacion;
  switch (progreso) {
    case 'envio-confirmado':
      return {
        tipo: 'exito',
        detalle: progreso,
        pc,
        epoca,
        texto: 'Recuperación técnica confirmada: la conexión está establecida y el envío de audio y video avanza. Este dispositivo no puede confirmar que el espectador vea y oiga bien.',
      };
    case 'recepcion-confirmada':
      return {
        tipo: 'exito',
        detalle: progreso,
        pc,
        epoca,
        texto: 'Recuperación técnica confirmada: la conexión está establecida, llegan audio y video y se decodifican fotogramas de video. Confirma tú que se ve y se oye.',
      };
    case 'no-verificable':
      return {
        tipo: 'sin-verificar',
        detalle: 'conectada-sin-verificar',
        texto: 'Conexión establecida, pero sin estadísticas para comprobar los medios: recuperación no verificada.',
      };
    case 'parcial':
      return { tipo: 'fallo', detalle: 'parcial', texto: 'Conexión establecida, pero solo avanza una parte de los medios.' };
    default:
      return { tipo: 'fallo', detalle: 'sin-progreso', texto: 'Conexión establecida, pero los medios no avanzan.' };
  }
}

/**
 * @param {() => boolean} vigente
 * @returns {Promise<ResultadoRecuperacion | null>}
 */
async function recuperarEmisor(vigente) {
  if (!estado.streamLocal) {
    return { tipo: 'fallo', detalle: 'sin-captura', texto: 'Activa primero la cámara y el micrófono.' };
  }
  if (!capturaUtilizable()) {
    ui.btnActivar.disabled = false;
    return { tipo: 'fallo', detalle: 'captura-terminada', texto: 'La captura terminó: actívala de nuevo con «Activar cámara y micrófono».' };
  }
  const negAntes = estado.neg;
  if (!canalConfirmado()) {
    const r = await reabrirCanal(vigente);
    if (!vigente()) return null;
    if (!r.ok) return resultadoCanal(r.detalle);
    if (!r.parPresente) {
      return {
        tipo: 'fallo',
        detalle: 'esperando-participante',
        texto: 'Señalización recuperada en la misma sesión; no hay espectador conectado. La emisión se negociará cuando vuelva.',
      };
    }
    // La bienvenida con el espectador presente ya creó una negociación nueva; si no, se crea aquí.
    if (estado.neg === negAntes && (await iniciarOferta()) === 'agotada' && vigente()) return { ...NEGOCIACION_AGOTADA };
  } else {
    if (!estado.parPresente) {
      return { tipo: 'fallo', detalle: 'esperando-participante', texto: 'No hay espectador conectado: la sesión sigue vigente.' };
    }
    const pc = estado.pc;
    if (pc && pc.connectionState === 'connected') {
      const previo = resultadoDeProgreso(await verificarProgreso(pc, vigente));
      if (!vigente()) return null;
      if (previo && previo.tipo === 'exito') return previo;
    }
    if (!vigente()) return null;
    // E03-R03-01: si la señalización se perdió durante la comprobación, no se renegocia sobre un canal
    // interrumpido; el resultado lo dice y un reintento nuevo reabrirá el canal con evidencia nueva.
    if (!canalConfirmado()) return { ...INTERRUMPIDA_DURANTE_COMPROBACION };
    const negociacion = await iniciarOferta();
    if (!vigente()) return null;
    if (negociacion === 'agotada') return { ...NEGOCIACION_AGOTADA };
  }
  if (!vigente()) return null;
  if (estado.neg === negAntes) {
    return { tipo: 'fallo', detalle: 'error-negociacion', texto: 'No se pudo crear una negociación nueva.' };
  }
  return confirmarTransporteYMedios(vigente);
}

/**
 * @param {() => boolean} vigente
 * @returns {Promise<ResultadoRecuperacion | null>}
 */
async function recuperarEspectador(vigente) {
  const respondidasAntes = estado.ofertasRespondidas;
  /**
   * Espera una oferta nueva aplicada y respondida en esta página (`respondida`), o su abandono por agotamiento
   * (`negociacion-agotada`, E03-R02-02), con límite.
   * @returns {Promise<string>}
   */
  const esperarNegociacionNueva = async () => {
    if (estado.ofertasRespondidas > respondidasAntes) return 'respondida';
    return esperarEn(estado.esperasNegociacion, LIMITES_RECUPERACION.negociacionMs, 'tiempo-agotado');
  };
  if (!canalConfirmado()) {
    const r = await reabrirCanal(vigente);
    if (!vigente()) return null;
    if (!r.ok) return resultadoCanal(r.detalle);
    if (!r.parPresente) {
      return {
        tipo: 'fallo',
        detalle: 'esperando-participante',
        texto: 'Señalización recuperada en la misma sesión; el emisor no está conectado.',
      };
    }
    // Al volver, el servidor avisa al emisor, que crea una negociación nueva (es el único que ofrece).
  } else {
    if (!estado.parPresente) {
      return { tipo: 'fallo', detalle: 'esperando-participante', texto: 'El emisor no está conectado a la señalización.' };
    }
    const pc = estado.pc;
    if (pc && pc.connectionState === 'connected') {
      const previo = resultadoDeProgreso(await verificarProgreso(pc, vigente));
      if (!vigente()) return null;
      if (previo && previo.tipo === 'exito') {
        void intentarReproducir();
        return previo;
      }
    }
    if (!vigente() || !estado.canal) return null;
    // E03-R03-01: sin señalización confirmada no se pide una oferta nueva (ver recuperarEmisor).
    if (!canalConfirmado()) return { ...INTERRUMPIDA_DURANTE_COMPROBACION };
    const envio = await estado.canal.enviar({ tipo: 'solicitud-oferta' });
    if (!vigente()) return null;
    if (!envio.ok) return resultadoCanal(categoriaCanal(envio));
    registrar('recuperacion', 'solicitud-oferta-enviada');
  }
  const negociacion = await esperarNegociacionNueva();
  if (!vigente()) return null;
  if (negociacion === 'negociacion-agotada') return { ...NEGOCIACION_AGOTADA };
  if (negociacion !== 'respondida') {
    return negociacion === 'tiempo-agotado'
      ? { tipo: 'agotada', detalle: 'tiempo-agotado', texto: 'El emisor no inició una negociación nueva a tiempo.' }
      : { tipo: 'fallo', detalle: 'respuesta-no-enviada', texto: 'No se pudo completar la negociación nueva.' };
  }
  const resultado = await confirmarTransporteYMedios(vigente);
  if (resultado && resultado.tipo === 'exito') void intentarReproducir();
  return resultado;
}

/**
 * @param {string} detalle
 * @returns {ResultadoRecuperacion}
 */
function resultadoCanal(detalle) {
  /** @type {Record<string, string>} */
  const textos = {
    'sesion-inexistente': 'El servidor ya no tiene esta sesión: no se puede recuperar. Una sesión nueva no es una recuperación de esta.',
    'no-autorizado': 'El servidor no acepta las credenciales de esta página para esta sesión.',
    'rol-ocupado': 'El servidor aún conserva el canal anterior de este rol (puede tardar en detectar su cierre). Vuelve a intentarlo en unos segundos.',
    'limite-senales': 'El servidor limitó las señales de esta sesión. Espera un momento antes de reintentar.',
    'tiempo-agotado': 'El servidor no respondió a tiempo.',
    'sesion-terminada': 'La sesión ya terminó en esta página.',
    'par-ausente': 'El otro participante no está conectado a la señalización: no hay con quién renegociar.',
    conflicto: 'El servidor rechazó la operación por un conflicto (409) sin más detalle.',
  };
  return {
    tipo: detalle === 'tiempo-agotado' ? 'agotada' : 'fallo',
    detalle,
    texto: textos[detalle] ?? 'No se pudo reabrir la señalización con el servidor local.',
  };
}

/** Acción del botón «Reintentar conexión». Nunca se lanza sola: solo por una acción del usuario. */
async function reintentarConexion() {
  registrar('recuperacion', 'solicitada');
  if (!estado.rol || estado.terminado || !estado.credenciales) {
    registrar('recuperacion', 'ignorada', { detalle: 'sesion-terminada' });
    return;
  }
  if (estado.recuperacion) {
    registrar('recuperacion', 'ignorada', { detalle: 'en-curso' });
    return;
  }
  const recuperacion = { id: ++estado.recuperaciones, generacion: estado.generacion };
  estado.recuperacion = recuperacion;
  const vigente = () => estado.recuperacion === recuperacion && estado.generacion === recuperacion.generacion && !estado.terminado;
  registrar('recuperacion', 'inicio');
  limpiarError();
  ui.estadoRecuperacion.textContent = 'Reintento en curso: comprobando señalización, conexión y medios…';
  actualizarContinuidad();
  /** @type {ResultadoRecuperacion | null} */
  let resultado;
  try {
    resultado = await (estado.rol === 'emisor' ? recuperarEmisor(vigente) : recuperarEspectador(vigente));
  } catch {
    resultado = { tipo: 'fallo', detalle: 'error-negociacion', texto: 'Error al renegociar la conexión.' };
  }
  // E03-R02-03: la continuación de una generación anterior (sesión terminada o sustituida) no toca la sesión
  // vigente: ni mensajes, ni resultados, ni cronología. La cancelación ya se registró al terminar.
  if (estado.generacion !== recuperacion.generacion) {
    if (estado.recuperacion === recuperacion) estado.recuperacion = null;
    return;
  }
  if (!vigente() || resultado === null) {
    // Cancelada (la sesión terminó: ya consta) o sustituida por un cambio de sesión.
    if (estado.recuperacion === recuperacion) estado.recuperacion = null;
    if (!estado.terminado) registrar('recuperacion', 'descartada');
    ui.estadoRecuperacion.textContent = estado.terminado
      ? 'Reintento cancelado: la sesión terminó en esta página.'
      : 'Reintento descartado: cambió la sesión o la conexión mientras se comprobaba. No se declara ninguna recuperación.';
    actualizarContinuidad();
    return;
  }
  // E03-R01-02: justo antes de publicar un éxito se comprueba que la conexión y la época de la comprobación
  // siguen siendo las actuales, con la señalización confirmada y las pistas aptas.
  if (resultado.tipo === 'exito') {
    const pc = resultado.pc;
    const sigue =
      pc !== undefined &&
      estado.pc === pc &&
      pc.connectionState === 'connected' &&
      estado.epocaInterrupcion === resultado.epoca &&
      canalConfirmado() &&
      pistasAptas(true);
    if (!sigue) resultado = { ...INTERRUMPIDA_DURANTE_COMPROBACION };
  }
  estado.recuperacion = null;
  estado.recuperacionResultado = resultado.tipo === 'exito' ? 'confirmada' : 'no-confirmada';
  estado.recuperacionDetalle = resultado.detalle;
  estado.recuperacionPc = estado.pc;
  estado.recuperacionEpoca = estado.epocaInterrupcion;
  estado.recuperacionTexto = resultado.texto;
  registrar('recuperacion', resultado.tipo, { detalle: resultado.detalle });
  ui.estadoRecuperacion.textContent = resultado.texto;
  actualizarContinuidad();
}

// ---------- Fin y limpieza ----------

/**
 * Muestra el resultado del aviso de fin o de salida, enviado con el límite de `CanalSenalizacion.enviar`.
 * Una respuesta que llega cuando ya empezó otra sesión se ignora.
 * @param {Promise<{ ok: boolean, estadoHttp: number, error?: string }>} aviso
 * @param {'fin' | 'salir'} tipo
 */
async function seguirAvisoCierre(aviso, tipo) {
  const generacion = estado.generacion;
  estado.avisoCierre = 'pendiente';
  fijar('senal', 'cerrada; avisando al servidor…');
  const r = await aviso;
  if (estado.generacion !== generacion) return;
  if (r.ok) {
    estado.avisoCierre = 'confirmado';
    registrar('finalizacion', 'aviso-confirmado');
    fijar('senal', tipo === 'fin' ? 'cerrada; el servidor eliminó la sesión' : 'cerrada; el servidor registró la salida');
    return;
  }
  const motivo = r.error ?? `HTTP ${r.estadoHttp}`;
  estado.avisoCierre = 'sin-confirmar';
  registrar('finalizacion', 'aviso-sin-confirmar', { detalle: categoriaCanal(r) });
  fijar('senal', `cerrada; aviso sin confirmar (${motivo})`);
  mostrarError(
    tipo === 'fin'
      ? `La captura ya está detenida en este dispositivo, pero el servidor no confirmó el fin de la sesión (${motivo}). ` +
          'Puede que el espectador no reciba el aviso; el servidor elimina la sesión cuando queda sin participantes o cuando caduca.'
      : `Has salido en este dispositivo, pero el servidor no confirmó la salida (${motivo}).`,
    'aviso-cierre-sin-confirmar',
  );
}

/**
 * Termina la sesión en esta página. Irreversible: invalida las operaciones pendientes (capturas, negociaciones,
 * avisos, estadísticas y recuperaciones), detiene las pistas, cierra la conexión y la señalización sin esperar
 * a la red, cancela las esperas y sus temporizadores, y borra las credenciales en memoria.
 * @param {string} texto
 * @param {string} causa Detalle para la cronología.
 * @param {Promise<unknown>} [avisoPrevio] Aviso de salida en curso: el canal (ya sin efecto en la página) se
 *   cierra cuando se resuelve o tras `ESPERA_CIERRE_TRAS_AVISO_MS`, lo que ocurra antes.
 */
function terminar(texto, causa, avisoPrevio) {
  if (estado.terminado) return;
  estado.terminado = true;
  // Invalida las capturas, negociaciones, avisos y recuperaciones pendientes de esta sesión.
  estado.generacion += 1;
  if (estado.recuperacion) {
    registrar('recuperacion', 'cancelada', { detalle: causa });
    estado.recuperacion = null;
  }
  estado.credenciales = null;
  cerrarPeer();
  retirar(estado.quitarOyentesLocales);
  const detenidas = liberarMedios(estado.streamLocal);
  if (estado.streamLocal) registrar('captura', 'liberada');
  estado.streamLocal = null;
  ui.videoLocal.srcObject = null;
  const canal = estado.canal;
  estado.canal = null;
  if (canal && avisoPrevio) cerrarTrasAviso(canal, avisoPrevio);
  else canal?.cerrar();
  estado.canalEstado = 'cerrada';
  estado.canalDetalle = 'cerrada';
  estado.sesionEstado = 'finalizada';
  if (estado.rol === 'emisor') estado.captura = 'liberada';
  estado.parPresente = false;
  for (const conjunto of [estado.esperasBienvenida, estado.esperasConexion, estado.esperasNegociacion, estado.esperasPausa, estado.esperasOperacion]) {
    notificar(/** @type {Set<Espera<any>>} */ (conjunto), 'cancelada');
  }
  ui.btnReproducir.hidden = true;
  registrar('finalizacion', 'limpieza', { detalle: causa });
  fijar('senal', 'cerrada');
  fijar('conexion', 'cerrada');
  if (estado.rol === 'emisor') {
    fijar('medios', `captura liberada (pistas detenidas: ${detenidas})`);
  } else {
    fijar('medios', 'sin medios');
  }
  ui.textoFinal.textContent = texto;
  ui.btnNueva.hidden = estado.rol !== 'emisor';
  mostrar('final');
}

/**
 * Cierra un canal que ya no es el vigente (sus eventos se descartan) cuando termina el aviso o pasado el límite.
 * @param {CanalSenalizacion} canal
 * @param {Promise<unknown>} aviso
 */
function cerrarTrasAviso(canal, aviso) {
  let cerrado = false;
  const cerrar = () => {
    if (cerrado) return;
    cerrado = true;
    clearTimeout(temporizador);
    canal.cerrar();
  };
  const temporizador = setTimeout(cerrar, ESPERA_CIERRE_TRAS_AVISO_MS);
  void aviso.finally(cerrar).catch(() => {});
}

// ---------- Ciclo de vida de la página ----------

registrar('pagina', 'inicio', { estado: document.visibilityState });
if (/** @type {any} */ (document).wasDiscarded === true) registrar('pagina', 'descartada-previamente');
if (typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    registrar('pagina', 'visibilidad', { estado: document.visibilityState });
    actualizarContinuidad();
  });
  // No se finaliza nada por ocultar o congelar la página: solo se registra.
  document.addEventListener('freeze', () => registrar('pagina', 'freeze'));
  document.addEventListener('resume', () => registrar('pagina', 'resume'));
}
window.addEventListener('online', () => registrar('red', 'online'));
window.addEventListener('offline', () => registrar('red', 'offline'));
window.addEventListener('pageshow', (e) => {
  registrar('pagina', 'pageshow', { detalle: /** @type {any} */ (e)?.persisted ? 'persistida' : 'no-persistida' });
});
window.addEventListener('pagehide', (e) => {
  registrar('pagina', 'pagehide', { detalle: /** @type {any} */ (e)?.persisted ? 'persistida' : 'no-persistida' });
  // Se conserva la limpieza de E01/E02 y se completa: la página se descarga o entra en la caché de navegación,
  // así que la sesión no continúa aquí. Se liberan captura y conexiones y se invalidan las tareas pendientes.
  if (estado.rol !== null && !estado.terminado) {
    terminar('La página se ocultó definitivamente o se descargó: se liberaron la captura y las conexiones. La sesión no continúa en esta página.', 'pagina-ocultada');
    return;
  }
  cerrarPeer();
  liberarMedios(estado.streamLocal);
  estado.canal?.cerrar();
});

/**
 * Registros de `getStats()` como lista.
 * @param {RTCPeerConnection} pc
 * @returns {Promise<unknown[]>}
 */
async function registrosEstadisticas(pc) {
  /** @type {unknown[]} */
  const registros = [];
  (await pc.getStats()).forEach((/** @type {unknown} */ registro) => registros.push(registro));
  return registros;
}

// ---------- Informe de diagnóstico ----------

/**
 * Lee, sin modificar nada y de una sola vez (sin esperas intermedias), el estado de la página para el informe.
 * Son datos brutos: `construirInforme` solo admite de ellos los campos de su lista permitida. Cada lectura es
 * independiente: si una falla, ese dato queda no disponible.
 * @param {RTCPeerConnection | null} pc
 */
function leerEstadoInforme(pc) {
  /**
   * @template T
   * @param {() => T} lectura
   * @returns {T | null}
   */
  const leer = (lectura) => {
    try {
      return lectura();
    } catch {
      return null;
    }
  };
  /** @param {MediaStream | null} flujo */
  const pistasInforme = (flujo) =>
    leer(() => (flujo ? flujo.getTracks() : []))?.map((pista) => ({
      tipo: pista.kind,
      estado: pista.readyState,
      silenciada: pista.muted,
      ajustes: typeof pista.getSettings === 'function' ? leer(() => pista.getSettings()) : null,
    })) ?? [];
  const pistasRemotas = pistasInforme(estado.streamRemoto);
  const video = ui.videoRemoto;
  const sinFlujo = video.srcObject === null;
  return {
    rol: estado.rol,
    terminado: estado.terminado,
    canal: estado.canalEstado,
    avisoCierre: estado.avisoCierre,
    captura: estado.captura,
    codigoCaptura: estado.codigoCaptura,
    errores: [...estado.errores],
    vistaPreviaSilenciada: ui.videoLocal.muted,
    flujosLocalesCreados: estado.historialLocal.length,
    pistasLocalesActivas: contarPistasActivas(estado.historialLocal),
    pistasRemotasActivas: pistasRemotas.filter((p) => p.estado === 'live').length,
    capturasDescartadas: estado.capturasDescartadas,
    pistasLocales: pistasInforme(estado.streamLocal),
    pistasRemotas,
    conexionAbierta: pc !== null,
    conexion: pc ? pc.connectionState : 'sin-conexion',
    ice: pc ? pc.iceConnectionState : null,
    senalizacionRtc: pc ? pc.signalingState : null,
    reproduccion: {
      estado: sinFlujo ? 'sin-flujo' : !ui.btnReproducir.hidden ? 'requiere-gesto' : video.paused ? 'pausada' : 'reproduciendo',
      ancho: video.videoWidth,
      alto: video.videoHeight,
      silenciado: video.muted,
    },
    // Se pasan cadenas del navegador solo para que `construirInforme` reconozca familia, versión y plataforma;
    // no llegan al informe. No se piden valores de alta entropía de `userAgentData`.
    navegador: {
      agente: leer(() => navigator.userAgent),
      plataforma: leer(() => navigator.platform),
      plataformaDatos: leer(() => /** @type {any} */ (navigator).userAgentData?.platform),
      visibilidad: leer(() => document.visibilityState),
      contextoSeguro: leer(() => window.isSecureContext),
      apis: {
        getUserMedia: leer(() => typeof navigator.mediaDevices?.getUserMedia === 'function'),
        rtcPeerConnection: leer(() => typeof RTCPeerConnection === 'function'),
        getStats: leer(() => typeof RTCPeerConnection.prototype.getStats === 'function'),
        portapapeles: leer(() => typeof navigator.clipboard?.writeText === 'function'),
      },
    },
  };
}

/**
 * Estadísticas de una conexión, acotadas en el tiempo y válidas solo si ni la sesión ni la conexión cambiaron
 * mientras se esperaban: las de una conexión o una sesión anteriores no se mezclan con el estado actual.
 * @param {RTCPeerConnection} pc
 * @param {number} generacion
 * @returns {Promise<{ estado: string, registros?: unknown[] }>}
 */
async function estadisticasDelInforme(pc, generacion) {
  if (typeof pc.getStats !== 'function') return { estado: 'api-ausente' };
  const cambio = () => estado.pc !== pc || estado.generacion !== generacion;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let temporizador;
  const agotado = new Promise((resolver) => {
    temporizador = setTimeout(() => resolver(null), LIMITE_ESTADISTICAS_INFORME_MS);
  });
  try {
    const registros = await Promise.race([registrosEstadisticas(pc), agotado]);
    if (registros === null) return { estado: 'tiempo-agotado' };
    return cambio() ? { estado: 'descartadas' } : { estado: 'ok', registros };
  } catch {
    return { estado: cambio() ? 'descartadas' : 'error' };
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Reúne los datos del informe como una instantánea: todo el estado se lee en un único instante, antes de
 * esperar a las estadísticas, y estas solo se añaden si siguen siendo de la conexión y la sesión de ese instante.
 */
async function reunirDatosInforme() {
  const pc = estado.pc;
  const generacion = estado.generacion;
  const datos = leerEstadoInforme(pc);
  const estadisticas = pc ? await estadisticasDelInforme(pc, generacion) : { estado: 'sin-conexion' };
  return { ...datos, estadisticas };
}

/**
 * Genera el informe y lo muestra en el cuadro de texto. No cambia ninguna sesión, captura ni conexión.
 * Si mientras tanto se pidió otro informe, este queda obsoleto: no se muestra y devuelve `null`.
 * @returns {Promise<string | null>}
 */
async function mostrarInforme() {
  const solicitud = ++estado.solicitudInforme;
  const instante = new Date();
  const datos = await reunirDatosInforme();
  if (solicitud !== estado.solicitudInforme) return null;
  const texto = serializarInforme(construirInforme(datos, instante));
  ui.informeTexto.value = texto;
  ui.informeTexto.hidden = false;
  return texto;
}

async function generarInforme() {
  if ((await mostrarInforme()) === null) return;
  ui.estadoInforme.textContent =
    'Informe generado en esta página; no se envió a ningún servidor. Selecciónalo para copiarlo o usa «Copiar informe».';
}

/** Mientras hay una copia en curso (de cualquiera de los dos documentos), ambos botones de copia se deshabilitan. */
/** @param {boolean} copiando */
function fijarCopiando(copiando) {
  estado.copiando = copiando;
  ui.btnCopiarInforme.disabled = copiando;
  ui.btnCopiarCronologia.disabled = copiando;
}

/**
 * Copia un documento al portapapeles, solo por una acción explícita del usuario.
 * - Solo una copia a la vez, del informe o de la cronología: mientras una escritura está pendiente, los botones
 *   de copia quedan deshabilitados y no se inicia otra. No se abandona ni se simula la cancelación de una
 *   escritura que el navegador ya inició; si no se resuelve nunca, los botones siguen deshabilitados y la
 *   generación y la copia manual del cuadro de texto siguen disponibles.
 * - Tras la escritura se comprueba que el documento copiado sigue siendo el último solicitado. Si no, la copia
 *   quedó superada: no se cambia el mensaje, la selección ni el foco del más reciente, ni se afirma que este se
 *   copió (el portapapeles contiene el documento de cuando se pulsó).
 * @param {object} d
 * @param {() => Promise<string | null>} d.generar
 * @param {() => number} d.solicitudActual
 * @param {HTMLTextAreaElement} d.texto
 * @param {HTMLElement} d.aviso
 * @param {string} d.nombre «El informe» o «La cronología».
 * @param {string} d.copiado Mensaje de copia correcta.
 */
async function copiarDocumento({ generar, solicitudActual, texto: area, aviso, nombre, copiado }) {
  if (estado.copiando) return;
  fijarCopiando(true);
  try {
    const texto = await generar();
    if (texto === null) return;
    const solicitud = solicitudActual();
    aviso.textContent = `Copiando ${nombre.toLowerCase()}…`;
    const r = await copiarTexto(texto, navigator.clipboard);
    if (solicitud !== solicitudActual()) return;
    if (r.ok) {
      aviso.textContent = copiado;
      return;
    }
    // Alternativa manual: el documento queda seleccionado en el cuadro de texto.
    area.focus();
    area.select();
    aviso.textContent =
      r.motivo === 'no-disponible'
        ? `Este navegador no permite copiar automáticamente. ${nombre} está seleccionad${nombre.startsWith('La') ? 'a' : 'o'}: cópial${nombre.startsWith('La') ? 'a' : 'o'} con Ctrl+C o con el menú del móvil.`
        : `El navegador rechazó la copia automática. ${nombre} está seleccionad${nombre.startsWith('La') ? 'a' : 'o'}: cópial${nombre.startsWith('La') ? 'a' : 'o'} con Ctrl+C o con el menú del móvil.`;
  } finally {
    fijarCopiando(false);
  }
}

function copiarInforme() {
  return copiarDocumento({
    generar: mostrarInforme,
    solicitudActual: () => estado.solicitudInforme,
    texto: ui.informeTexto,
    aviso: ui.estadoInforme,
    nombre: 'El informe',
    copiado: 'Informe copiado al portapapeles.',
  });
}

// ---------- Cronología de continuidad ----------

/**
 * Genera la cronología y la muestra. No cambia ninguna sesión, captura ni conexión, y no se envía a ningún sitio.
 * @returns {Promise<string>}
 */
async function mostrarCronologia() {
  ++estado.solicitudCronologia;
  const texto = serializarCronologia(exportarCronologia(cronologia, new Date()));
  ui.cronologiaTexto.value = texto;
  ui.cronologiaTexto.hidden = false;
  return texto;
}

async function generarCronologia() {
  await mostrarCronologia();
  ui.estadoCronologia.textContent =
    'Cronología generada en esta página; no se envió a ningún servidor. Se pierde si el navegador recarga o descarta la página.';
}

function copiarCronologia() {
  return copiarDocumento({
    generar: mostrarCronologia,
    solicitudActual: () => estado.solicitudCronologia,
    texto: ui.cronologiaTexto,
    aviso: ui.estadoCronologia,
    nombre: 'La cronología',
    copiado: 'Cronología copiada al portapapeles.',
  });
}

// Diagnóstico para pruebas automatizadas y manuales: no expone tokens ni modifica nada.
/** @type {any} */ (window).directoDiagnostico = async () => {
  const pc = estado.pc;
  // Si getStats falla, las medidas constan como 0 en lugar de romper el diagnóstico.
  const agregadas = agregarEstadisticas(pc ? await registrosEstadisticas(pc).catch(() => []) : []);
  const medidas = {
    video: {
      bytesRecibidos: agregadas.video.bytesRecibidos ?? 0,
      framesDecodificados: agregadas.video.fotogramasDecodificados ?? 0,
      bytesEnviados: agregadas.video.bytesEnviados ?? 0,
    },
    audio: {
      bytesRecibidos: agregadas.audio.bytesRecibidos ?? 0,
      paquetesRecibidos: agregadas.audio.paquetesRecibidos ?? 0,
      bytesEnviados: agregadas.audio.bytesEnviados ?? 0,
    },
  };
  const continuidad = derivarContinuidad(componentes());
  return {
    rol: estado.rol,
    terminado: estado.terminado,
    senal: ui.estado.senal.textContent,
    conexion: pc ? pc.connectionState : 'sin-conexion',
    flujosLocalesCreados: estado.historialLocal.length,
    pistasLocalesActivas: contarPistasActivas(estado.historialLocal),
    capturasDescartadas: estado.capturasDescartadas,
    avisoCierre: estado.avisoCierre,
    pistasRemotas: estado.streamRemoto ? estado.streamRemoto.getTracks().length : 0,
    videoRemoto: {
      ancho: ui.videoRemoto.videoWidth,
      alto: ui.videoRemoto.videoHeight,
      pausado: ui.videoRemoto.paused,
      tiempo: ui.videoRemoto.currentTime,
      silenciado: ui.videoRemoto.muted,
    },
    vistaPreviaSilenciada: ui.videoLocal.muted,
    medidas,
    continuidad: { estado: continuidad.estado, motivo: continuidad.motivo },
    canalDetalle: estado.canalDetalle,
    recuperacion: { enCurso: estado.recuperacion !== null, resultado: estado.recuperacionResultado, detalle: estado.recuperacionDetalle },
    negociaciones: estado.neg,
    ofertasRespondidas: estado.ofertasRespondidas,
    senalesDescartadas: estado.senalesDescartadas,
    // Esperas lógicas pendientes (con su temporizador): tras terminar deben ser 0 (E03-R02).
    esperasPendientes:
      estado.esperasBienvenida.size +
      estado.esperasConexion.size +
      estado.esperasNegociacion.size +
      estado.esperasPausa.size +
      estado.esperasOperacion.size,
  };
};

ui.btnCrear.addEventListener('click', () => void crearSesionEmisor());
ui.btnActivar.addEventListener('click', () => void activarMedios());
ui.btnFinalizar.addEventListener('click', () => void finalizarEmision());
ui.btnNueva.addEventListener('click', nuevaSesion);
ui.btnSalir.addEventListener('click', () => void salirEspectador());
ui.btnReproducir.addEventListener('click', () => void intentarReproducir());
ui.btnReintentar.addEventListener('click', () => void reintentarConexion());
ui.btnInforme.addEventListener('click', () => void generarInforme());
ui.btnCopiarInforme.addEventListener('click', () => void copiarInforme());
ui.btnCronologia.addEventListener('click', () => void generarCronologia());
ui.btnCopiarCronologia.addEventListener('click', () => void copiarCronologia());
ui.btnCopiar.addEventListener('click', () => {
  ui.enlace.select();
  void navigator.clipboard?.writeText(ui.enlace.value).catch(() => {});
});

const sesionUrl = new URLSearchParams(location.search).get('s');
if (sesionUrl !== null) {
  iniciarEspectador(sesionUrl, location.hash.slice(1));
} else {
  mostrar('inicio');
}
