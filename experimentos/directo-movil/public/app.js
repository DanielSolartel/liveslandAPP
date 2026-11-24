// @ts-check
// Interfaz del experimento: emitir, mirar y finalizar. WebRTC sin STUN/TURN (solo candidatos locales).
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
import { CanalSenalizacion, crearSesion } from './senalizacion.js';

/** @typedef {import('./senalizacion.js').EventoSse} EventoSse */
/** @typedef {import('./senalizacion.js').EstadoCanal} EstadoCanal */

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
  btnCrear: el('btn-crear', HTMLButtonElement),
  btnCopiar: el('btn-copiar', HTMLButtonElement),
  btnActivar: el('btn-activar', HTMLButtonElement),
  btnFinalizar: el('btn-finalizar', HTMLButtonElement),
  btnReproducir: el('btn-reproducir', HTMLButtonElement),
  btnSalir: el('btn-salir', HTMLButtonElement),
  btnNueva: el('btn-nueva', HTMLButtonElement),
  btnInforme: el('btn-informe', HTMLButtonElement),
  btnCopiarInforme: el('btn-copiar-informe', HTMLButtonElement),
  informeTexto: el('informe-texto', HTMLTextAreaElement),
  estadoInforme: el('estado-informe', HTMLElement),
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
};

/** Sin servidores STUN/TURN: el experimento no depende de servicios externos. */
const CONFIG_RTC = /** @type {RTCConfiguration} */ ({ iceServers: [] });

const PATRON_SESION = /^[A-Za-z0-9_-]{22}$/;
const PATRON_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** @type {Record<string, string>} */
const MOTIVOS_FIN = {
  'finalizada-por-el-emisor': 'El emisor finalizó la emisión.',
  'salida-del-espectador': 'Has salido de la sesión.',
  expirada: 'La sesión de prueba caducó.',
  abandonada: 'La sesión se cerró por inactividad.',
  'servidor-detenido': 'El servidor local se detuvo.',
};

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
  /** Estado del canal de señalización, como valor de lista cerrada para el informe de diagnóstico. */
  /** @type {'sin-canal' | 'conectando' | 'conectada' | 'cerrada' | 'error' | 'no-iniciada'} */
  canalEstado: 'sin-canal',
  /** Estado de la captura local, como valor de lista cerrada para el informe de diagnóstico. */
  /** @type {'sin-sesion' | 'no-aplica' | 'sin-activar' | 'solicitando' | 'activa' | 'sin-captura' | 'liberada'} */
  captura: 'sin-sesion',
  /** Código del último fallo de captura, o `null`. */
  /** @type {string | null} */
  codigoCaptura: null,
  /** Último informe solicitado. Un informe solo se muestra o se copia si sigue siendo la última solicitud. */
  solicitudInforme: 0,
  /** Hay una copia en curso. Solo puede haber una: así dos escrituras al portapapeles no terminan en orden inverso. */
  copiando: false,
  /** Categorías de error ocurridas en esta página, sin repetir y de lista cerrada (sin mensajes ni datos). */
  /** @type {string[]} */
  errores: [],
  /** @type {RTCIceCandidateInit[]} */
  candidatosPendientes: [],
  /** Todos los flujos capturados en esta página, también los descartados, para comprobar que no quedan pistas. */
  /** @type {MediaStream[]} */
  historialLocal: [],
};

/** @param {keyof typeof ui.vistas} nombre */
function mostrar(nombre) {
  for (const [clave, vista] of Object.entries(ui.vistas)) vista.hidden = clave !== nombre;
}

/**
 * @param {keyof typeof ui.estado} campo
 * @param {string} texto
 */
function fijar(campo, texto) {
  ui.estado[campo].textContent = texto;
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
      return { texto: 'Ya hay otro participante conectado con este rol.', categoria: 'canal-rol-ocupado' };
    default:
      return { texto: 'Se perdió la conexión con el servidor local de señalización.', categoria: 'canal-perdido' };
  }
}

/**
 * @param {string} sesion
 * @param {string} token
 */
function abrirCanal(sesion, token) {
  // Cola propia de este canal: procesa sus eventos de uno en uno. Un evento cuyo canal ya no es el de la
  // sesión en curso se descarta, y una tarea que espera a la red no retiene los eventos de otra sesión.
  /** @type {Promise<void>} */
  let cola = Promise.resolve();
  const canal = new CanalSenalizacion({
    sesion,
    token,
    alEvento: (e) => {
      cola = cola
        .then(() => (estado.canal === canal ? manejarEvento(e) : undefined))
        .catch((error) => {
          if (estado.canal !== canal) return;
          mostrarError(
            `Error al procesar la señalización: ${error instanceof Error ? error.message : String(error)}`,
            'senal-procesamiento',
          );
        });
    },
    alEstado: (e, detalle) => manejarEstadoCanal(canal, e, detalle),
  });
  estado.canal = canal;
  estado.canalEstado = 'conectando';
  void canal.abrir();
}

/**
 * @param {CanalSenalizacion} canal
 * @param {EstadoCanal} e
 * @param {{ estadoHttp?: number, error?: string }} [detalle]
 */
function manejarEstadoCanal(canal, e, detalle) {
  if (estado.canal !== canal) return;
  estado.canalEstado = e;
  fijar('senal', e);
  if (e === 'error' && !estado.terminado) {
    const { texto, categoria } = errorCanal(detalle);
    mostrarError(texto, categoria);
    cerrarPeer();
  }
}

/** @param {EventoSse} e */
async function manejarEvento({ evento, datos }) {
  const d = /** @type {Record<string, any>} */ (datos ?? {});
  if (evento === 'bienvenida') {
    estado.parPresente = Boolean(d.parPresente);
    if (estado.rol === 'emisor') {
      fijar('conexion', estado.parPresente ? 'espectador presente' : 'esperando espectador');
      if (estado.parPresente && estado.streamLocal) await iniciarOferta();
    } else {
      fijar('conexion', estado.parPresente ? 'esperando oferta del emisor' : 'esperando al emisor');
    }
  } else if (evento === 'par') {
    estado.parPresente = Boolean(d.presente);
    if (estado.parPresente) {
      if (estado.rol === 'emisor') {
        fijar('conexion', 'espectador presente');
        if (estado.streamLocal) await iniciarOferta();
      } else {
        fijar('conexion', 'esperando oferta del emisor');
      }
    } else {
      cerrarPeer();
      fijar('conexion', estado.rol === 'emisor' ? 'esperando espectador' : 'el emisor se desconectó');
    }
  } else if (evento === 'senal') {
    await manejarSenal(d);
  } else if (evento === 'fin') {
    const motivo = String(d.motivo);
    terminar(
      estado.rol === 'emisor' && motivo === 'finalizada-por-el-emisor'
        ? 'Emisión finalizada.'
        : (MOTIVOS_FIN[motivo] ?? 'La sesión terminó.'),
    );
  }
}

function crearPeer() {
  const pc = new RTCPeerConnection(CONFIG_RTC);
  estado.pc = pc;
  estado.candidatosPendientes = [];
  pc.onicecandidate = (e) => {
    if (!e.candidate || estado.pc !== pc || !estado.canal) return;
    const c = e.candidate.toJSON();
    void estado.canal.enviar({
      tipo: 'candidato',
      candidato: {
        candidate: c.candidate ?? '',
        sdpMid: c.sdpMid ?? null,
        sdpMLineIndex: c.sdpMLineIndex ?? null,
        usernameFragment: c.usernameFragment ?? null,
      },
    });
  };
  pc.onconnectionstatechange = () => {
    if (estado.pc !== pc) return;
    fijar('conexion', pc.connectionState);
    if (pc.connectionState === 'failed') {
      mostrarError(
        'La conexión WebRTC falló. Sin STUN/TURN solo funciona en el mismo equipo o en una red local sin aislamiento.',
        'webrtc-conexion-fallida',
      );
    }
  };
  pc.oniceconnectionstatechange = () => {
    if (estado.pc === pc) fijar('ice', pc.iceConnectionState);
  };
  if (estado.rol === 'espectador') pc.ontrack = recibirPista;
  fijar('conexion', pc.connectionState);
  fijar('ice', pc.iceConnectionState);
  return pc;
}

function cerrarPeer() {
  const pc = estado.pc;
  estado.pc = null;
  estado.candidatosPendientes = [];
  if (pc) {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    pc.close();
    fijar('conexion', 'cerrada');
    fijar('ice', '—');
  }
  if (estado.streamRemoto) {
    for (const pista of estado.streamRemoto.getTracks()) pista.stop();
    estado.streamRemoto = null;
  }
  ui.videoRemoto.srcObject = null;
}

/** @param {RTCPeerConnection} pc */
async function aplicarCandidatosPendientes(pc) {
  const pendientes = estado.candidatosPendientes;
  estado.candidatosPendientes = [];
  for (const candidato of pendientes) await pc.addIceCandidate(candidato).catch(() => {});
}

/** @param {Record<string, any>} senal */
async function manejarSenal(senal) {
  const canal = estado.canal;
  if (senal.tipo === 'oferta' && estado.rol === 'espectador' && canal) {
    cerrarPeer();
    const pc = crearPeer();
    // Si la conexión se cierra o se sustituye durante una espera, la tarea termina sin tocar la sesión en curso.
    const vigente = () => estado.pc === pc && estado.canal === canal;
    await pc.setRemoteDescription({ type: 'offer', sdp: senal.sdp });
    if (!vigente()) return;
    await aplicarCandidatosPendientes(pc);
    if (!vigente()) return;
    const respuesta = await pc.createAnswer();
    if (!vigente()) return;
    await pc.setLocalDescription(respuesta);
    if (!vigente()) return;
    const r = await canal.enviar({ tipo: 'respuesta', sdp: pc.localDescription?.sdp });
    if (!r.ok && vigente()) {
      mostrarError(`No se pudo enviar la respuesta (${r.error ?? r.estadoHttp}).`, 'senal-respuesta-no-enviada');
    }
  } else if (senal.tipo === 'respuesta' && estado.rol === 'emisor' && estado.pc) {
    const pc = estado.pc;
    await pc.setRemoteDescription({ type: 'answer', sdp: senal.sdp });
    if (estado.pc === pc) await aplicarCandidatosPendientes(pc);
  } else if (senal.tipo === 'candidato' && estado.pc) {
    if (estado.pc.remoteDescription) await estado.pc.addIceCandidate(senal.candidato).catch(() => {});
    else estado.candidatosPendientes.push(senal.candidato);
  }
}

// ---------- Emisor ----------

async function crearSesionEmisor() {
  limpiarError();
  ui.btnCrear.disabled = true;
  const r = await crearSesion();
  ui.btnCrear.disabled = false;
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
  estado.captura = 'solicitando';
  fijar('medios', 'solicitando permiso…');
  const r = await solicitarMedios({ isSecureContext: window.isSecureContext, mediaDevices: navigator.mediaDevices });
  if (!vigente()) {
    if (r.ok) {
      estado.historialLocal.push(r.stream);
      liberarMedios(r.stream);
      estado.capturasDescartadas += 1;
    }
    return;
  }
  if (!r.ok) {
    ui.btnActivar.disabled = false;
    estado.captura = 'sin-captura';
    estado.codigoCaptura = r.codigo;
    fijar('medios', `sin captura (${r.codigo})`);
    mostrarError(r.mensaje, `captura-${r.codigo}`);
    return;
  }
  estado.captura = 'activa';
  estado.codigoCaptura = null;
  estado.streamLocal = r.stream;
  estado.historialLocal.push(r.stream);
  ui.videoLocal.muted = true;
  ui.videoLocal.srcObject = r.stream;
  void ui.videoLocal.play().catch(() => {});
  fijar('medios', 'cámara y micrófono activos (vista previa silenciada)');
  if (estado.parPresente) await iniciarOferta();
}

async function iniciarOferta() {
  const stream = estado.streamLocal;
  const canal = estado.canal;
  if (!stream || !canal) return;
  cerrarPeer();
  const pc = crearPeer();
  const vigente = () => estado.pc === pc && estado.canal === canal;
  for (const pista of stream.getTracks()) pc.addTrack(pista, stream);
  const oferta = await pc.createOffer();
  if (!vigente()) return;
  await pc.setLocalDescription(oferta);
  if (!vigente()) return;
  const r = await canal.enviar({ tipo: 'oferta', sdp: pc.localDescription?.sdp });
  if (!r.ok && vigente()) mostrarError(`No se pudo enviar la oferta (${r.error ?? r.estadoHttp}).`, 'senal-oferta-no-enviada');
}

function finalizarEmision() {
  if (estado.rol !== 'emisor' || estado.terminado) return;
  ui.btnFinalizar.disabled = true;
  // El cierre local no espera a la red: se lanza el aviso y se liberan los medios en el acto.
  const aviso = estado.canal?.enviar({ tipo: 'fin' });
  terminar('Emisión finalizada.');
  if (aviso) void seguirAvisoCierre(aviso, 'fin');
}

function nuevaSesion() {
  estado.generacion += 1;
  limpiarError();
  estado.rol = null;
  estado.terminado = false;
  estado.parPresente = false;
  estado.avisoCierre = 'sin-aviso';
  estado.canalEstado = 'sin-canal';
  estado.captura = 'sin-sesion';
  estado.codigoCaptura = null;
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
  fijar('rol', 'espectador');
  mostrar('espectador');
  if (!PATRON_SESION.test(sesion) || !PATRON_TOKEN.test(token)) {
    estado.canalEstado = 'no-iniciada';
    fijar('senal', 'no iniciada');
    mostrarError('El enlace del espectador está incompleto o no es válido.', 'enlace-incompleto');
    return;
  }
  fijar('medios', 'esperando medios del emisor');
  abrirCanal(sesion, token);
}

/** @param {RTCTrackEvent} e */
function recibirPista(e) {
  const stream = e.streams[0] ?? estado.streamRemoto ?? new MediaStream();
  if (!e.streams[0]) stream.addTrack(e.track);
  estado.streamRemoto = stream;
  if (ui.videoRemoto.srcObject !== stream) ui.videoRemoto.srcObject = stream;
  fijar('medios', `recibiendo: ${stream.getTracks().map((p) => p.kind).join(' + ')}`);
  void intentarReproducir();
}

async function intentarReproducir() {
  try {
    await ui.videoRemoto.play();
    ui.btnReproducir.hidden = true;
    fijar('medios', 'reproduciendo audio y video del emisor');
  } catch (error) {
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
  const aviso = estado.canal?.enviar({ tipo: 'salir' });
  terminar('Has salido de la sesión.');
  if (aviso) void seguirAvisoCierre(aviso, 'salir');
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
    fijar('senal', tipo === 'fin' ? 'cerrada; el servidor eliminó la sesión' : 'cerrada; el servidor registró la salida');
    return;
  }
  const motivo = r.error ?? `HTTP ${r.estadoHttp}`;
  estado.avisoCierre = 'sin-confirmar';
  fijar('senal', `cerrada; aviso sin confirmar (${motivo})`);
  mostrarError(
    tipo === 'fin'
      ? `La captura ya está detenida en este dispositivo, pero el servidor no confirmó el fin de la sesión (${motivo}). ` +
          'Puede que el espectador no reciba el aviso; el servidor elimina la sesión cuando queda sin participantes o cuando caduca.'
      : `Has salido en este dispositivo, pero el servidor no confirmó la salida (${motivo}).`,
    'aviso-cierre-sin-confirmar',
  );
}

/** @param {string} texto */
function terminar(texto) {
  if (estado.terminado) return;
  estado.terminado = true;
  // Invalida las capturas, negociaciones y avisos pendientes de esta sesión.
  estado.generacion += 1;
  cerrarPeer();
  const detenidas = liberarMedios(estado.streamLocal);
  estado.streamLocal = null;
  ui.videoLocal.srcObject = null;
  const canal = estado.canal;
  estado.canal = null;
  canal?.cerrar();
  estado.canalEstado = 'cerrada';
  if (estado.rol === 'emisor') estado.captura = 'liberada';
  estado.parPresente = false;
  ui.btnReproducir.hidden = true;
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

window.addEventListener('pagehide', () => {
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
  const pistasDe = (flujo) =>
    leer(() => (flujo ? flujo.getTracks() : []))?.map((pista) => ({
      tipo: pista.kind,
      estado: pista.readyState,
      silenciada: pista.muted,
      ajustes: typeof pista.getSettings === 'function' ? leer(() => pista.getSettings()) : null,
    })) ?? [];
  const pistasRemotas = pistasDe(estado.streamRemoto);
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
    pistasLocales: pistasDe(estado.streamLocal),
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

/**
 * Copia el informe al portapapeles, solo por una acción explícita del usuario.
 * - Solo una copia a la vez: mientras una escritura está pendiente, el botón de copia queda deshabilitado y
 *   no se inicia otra. No se abandona ni se simula la cancelación de una escritura que el navegador ya inició,
 *   y si el navegador no la resuelve nunca, el botón sigue deshabilitado; la generación de informes y la
 *   copia manual del cuadro de texto siguen disponibles.
 * - Tras la escritura se comprueba que el informe copiado sigue siendo el último solicitado. Si no, la copia
 *   quedó superada: no se cambia el mensaje, la selección ni el foco del informe más reciente, ni se afirma
 *   que este se copió (el portapapeles contiene el informe de cuando se pulsó).
 */
async function copiarInforme() {
  if (estado.copiando) return;
  estado.copiando = true;
  ui.btnCopiarInforme.disabled = true;
  try {
    const texto = await mostrarInforme();
    if (texto === null) return;
    const solicitud = estado.solicitudInforme;
    ui.estadoInforme.textContent = 'Copiando el informe…';
    const r = await copiarTexto(texto, navigator.clipboard);
    if (solicitud !== estado.solicitudInforme) return;
    if (r.ok) {
      ui.estadoInforme.textContent = 'Informe copiado al portapapeles.';
      return;
    }
    // Alternativa manual: el informe queda seleccionado en el cuadro de texto.
    ui.informeTexto.focus();
    ui.informeTexto.select();
    ui.estadoInforme.textContent =
      r.motivo === 'no-disponible'
        ? 'Este navegador no permite copiar automáticamente. El informe está seleccionado: cópialo con Ctrl+C o con el menú del móvil.'
        : 'El navegador rechazó la copia automática. El informe está seleccionado: cópialo con Ctrl+C o con el menú del móvil.';
  } finally {
    estado.copiando = false;
    ui.btnCopiarInforme.disabled = false;
  }
}

// Diagnóstico para pruebas automatizadas y manuales: no expone tokens.
/** @type {any} */ (window).directoDiagnostico = async () => {
  const pc = estado.pc;
  const agregadas = agregarEstadisticas(pc ? await registrosEstadisticas(pc) : []);
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
  };
};

ui.btnCrear.addEventListener('click', () => void crearSesionEmisor());
ui.btnActivar.addEventListener('click', () => void activarMedios());
ui.btnFinalizar.addEventListener('click', () => void finalizarEmision());
ui.btnNueva.addEventListener('click', nuevaSesion);
ui.btnSalir.addEventListener('click', () => void salirEspectador());
ui.btnReproducir.addEventListener('click', () => void intentarReproducir());
ui.btnInforme.addEventListener('click', () => void generarInforme());
ui.btnCopiarInforme.addEventListener('click', () => void copiarInforme());
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
