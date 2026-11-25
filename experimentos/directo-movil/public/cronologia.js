// @ts-check
// Cronología de continuidad (LIVE-FASE03-E03): registro temporal, en memoria y acotado, de los eventos que
// ayudan a explicar una interrupción (ciclo de vida de la página, red, captura, señalización, WebRTC,
// recuperación y finalización). Es independiente del informe instantáneo de E02 (esquema 2), que no cambia.
//
// Privacidad: solo se registran categorías, eventos y valores de listas cerradas, un tipo de pista y números
// locales. Nada de tokens, identificadores de sesión, SDP, candidatos ICE, IP, nombres de red, identificadores
// de dispositivo, agentes de usuario, mensajes de error, pilas, URL ni contenido audiovisual. La exportación se
// construye de nuevo desde la lista permitida; no se eliminan campos de un objeto recibido.
//
// El registro vive en la memoria del documento: no se guarda en el navegador ni se envía al servidor. Si el
// navegador destruye o recarga el documento, la cronología se pierde.
// Sin dependencias del DOM: se prueba en Node con un reloj inyectado.

export const ESQUEMA_CRONOLOGIA = 'live-directo-movil/cronologia-continuidad/1';

/** Máximo de eventos que se conservan por documento. Al superarlo se descartan los más antiguos y se cuentan. */
export const CAPACIDAD_CRONOLOGIA = 256;

/** Eventos admitidos por categoría. Cualquier otro par categoría-evento se rechaza y solo se cuenta. */
export const EVENTOS_CRONOLOGIA = Object.freeze({
  pagina: Object.freeze(['inicio', 'visibilidad', 'pagehide', 'pageshow', 'freeze', 'resume', 'descartada-previamente']),
  red: Object.freeze(['online', 'offline']),
  captura: Object.freeze(['solicitud', 'concedida', 'rechazada', 'mute', 'unmute', 'ended', 'liberada', 'tardia-descartada']),
  senalizacion: Object.freeze([
    'apertura',
    'reapertura',
    'conectada',
    'bienvenida',
    'interrumpida',
    'error',
    'cerrada',
    'par-presente',
    'par-ausente',
    'senal-obsoleta',
    'senal-ignorada',
    'fin-recibido',
  ]),
  webrtc: Object.freeze([
    'creada',
    'cerrada',
    'conexion',
    'ice',
    'senalizacion',
    'pista-remota',
    'pista-remota-mute',
    'pista-remota-unmute',
    'pista-remota-ended',
    'negociacion',
    'candidatos-descartados',
  ]),
  recuperacion: Object.freeze([
    'solicitada',
    'inicio',
    'exito',
    'fallo',
    'cancelada',
    'agotada',
    'sin-verificar',
    'descartada',
    'ignorada',
    'solicitud-oferta-enviada',
    'solicitud-oferta-recibida',
  ]),
  finalizacion: Object.freeze([
    'finalizacion-voluntaria',
    'salida-voluntaria',
    'caducidad',
    'terminacion-remota',
    'limpieza',
    'aviso-confirmado',
    'aviso-sin-confirmar',
  ]),
});

/** Valores de `estado` admitidos: estados de la página, de la señalización y de WebRTC, todos de lista cerrada. */
export const ESTADOS_CRONOLOGIA = Object.freeze([
  // visibilidad
  'visible',
  'hidden',
  // connectionState e iceConnectionState
  'new',
  'connecting',
  'checking',
  'connected',
  'completed',
  'disconnected',
  'failed',
  'closed',
  // signalingState
  'stable',
  'have-local-offer',
  'have-remote-offer',
  'have-local-pranswer',
  'have-remote-pranswer',
  // presencia
  'presente',
  'ausente',
]);

/** Valores de `detalle` admitidos. */
export const DETALLES_CRONOLOGIA = Object.freeze([
  // categorías de canal (senalizacion.js, `categoriaCanal`)
  'no-autorizado',
  'sesion-inexistente',
  'rol-ocupado',
  'par-ausente',
  'conflicto',
  'limite-senales',
  'tiempo-agotado',
  'red',
  'fin-inesperado',
  'flujo-interrumpido',
  'http-otro',
  // pagehide / pageshow
  'persistida',
  'no-persistida',
  // motivos de fin del servidor
  'finalizada-por-el-emisor',
  'salida-del-espectador',
  'expirada',
  'abandonada',
  'servidor-detenido',
  'motivo-desconocido',
  // ausencia del otro participante
  'salida',
  'desconexion',
  // negociación
  'oferta-enviada',
  'oferta-no-enviada',
  'oferta-aplicada',
  'respuesta-enviada',
  'respuesta-no-enviada',
  'respuesta-aplicada',
  'error-negociacion',
  // señales descartadas o ignoradas
  'oferta',
  'respuesta',
  'candidato',
  'solicitud-oferta',
  'negociacion-en-curso',
  'demasiado-pronto',
  'sin-captura',
  'sin-participante',
  'cola-llena',
  // captura
  'permiso-denegado',
  'bloqueado-por-seguridad',
  'sin-dispositivo',
  'dispositivo-ocupado',
  'restricciones-invalidas',
  'no-soportado',
  'contexto-inseguro',
  'api-ausente',
  'error-desconocido',
  // recuperación
  'en-curso',
  'envio-confirmado',
  'recepcion-confirmada',
  'conectada-sin-verificar',
  'sin-progreso',
  'parcial',
  'esperando-participante',
  'captura-terminada',
  'transporte-no-conectado',
  'sustituida',
  'interrupcion-durante-comprobacion',
  'negociacion-agotada',
  'bienvenida-tardia',
  'limite-negociaciones',
  'finalizacion',
  'sesion-terminada',
  'pagina-ocultada',
]);

const PISTAS = Object.freeze(['audio', 'video']);
const ROLES = Object.freeze(['emisor', 'espectador']);
const CAPACIDADES = Object.freeze(['visibilidad', 'pagehide', 'pageshow', 'freeze', 'resume', 'descarte', 'red', 'getStats', 'relojMonotonico']);
const MAX_SESION_LOCAL = 1_000_000;

/**
 * @typedef {{ n: number, t: number, sesionLocal: number, categoria: string, evento: string,
 *   estado?: string, pista?: string, detalle?: string }} EventoCronologia
 */

/**
 * @param {unknown} v
 * @param {readonly string[]} permitidos
 */
function enLista(v, permitidos) {
  return typeof v === 'string' && permitidos.includes(v);
}

/**
 * @param {unknown} categoria
 * @param {unknown} evento
 */
function parValido(categoria, evento) {
  if (typeof categoria !== 'string' || !Object.hasOwn(EVENTOS_CRONOLOGIA, categoria)) return false;
  return enLista(evento, /** @type {Record<string, readonly string[]>} */ (EVENTOS_CRONOLOGIA)[categoria]);
}

/** @param {unknown} v */
function enteroNoNegativo(v) {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : null;
}

/**
 * Copia saneada de un evento: solo campos permitidos con valores de lista cerrada. Devuelve `null` si el par
 * categoría-evento no está admitido. Los campos opcionales con valores no admitidos se omiten.
 * @param {unknown} entrada
 * @returns {EventoCronologia | null}
 */
export function sanearEvento(entrada) {
  if (entrada === null || typeof entrada !== 'object' || Array.isArray(entrada)) return null;
  // Solo propiedades propias: un valor heredado del prototipo no cuenta como dato del evento.
  /** @type {Record<string, unknown>} */
  const e = {};
  for (const clave of ['n', 't', 'sesionLocal', 'categoria', 'evento', 'estado', 'pista', 'detalle']) {
    if (Object.hasOwn(entrada, clave)) e[clave] = /** @type {Record<string, unknown>} */ (entrada)[clave];
  }
  if (!parValido(e.categoria, e.evento)) return null;
  const n = enteroNoNegativo(e.n);
  const t = enteroNoNegativo(e.t);
  const sesionLocal = enteroNoNegativo(e.sesionLocal);
  if (n === null || t === null || sesionLocal === null || sesionLocal > MAX_SESION_LOCAL) return null;
  /** @type {EventoCronologia} */
  const salida = { n, t, sesionLocal, categoria: /** @type {string} */ (e.categoria), evento: /** @type {string} */ (e.evento) };
  if (enLista(e.estado, ESTADOS_CRONOLOGIA)) salida.estado = /** @type {string} */ (e.estado);
  if (enLista(e.pista, PISTAS)) salida.pista = /** @type {string} */ (e.pista);
  if (enLista(e.detalle, DETALLES_CRONOLOGIA)) salida.detalle = /** @type {string} */ (e.detalle);
  return salida;
}

/** Reloj por defecto: monotónico (`performance.now`) si existe; si no, `Date.now`, declarado como no monotónico. */
function relojPorDefecto() {
  const p = /** @type {any} */ (globalThis).performance;
  if (p && typeof p.now === 'function') return { ahora: () => p.now(), monotonico: true };
  return { ahora: () => Date.now(), monotonico: false };
}

export class Cronologia {
  /**
   * @param {object} [opciones]
   * @param {() => number} [opciones.reloj] Milisegundos de un reloj monotónico. Se inyecta en las pruebas.
   * @param {boolean} [opciones.monotonico] Si el reloj inyectado es monotónico.
   * @param {number} [opciones.capacidad] Solo para pruebas; por defecto `CAPACIDAD_CRONOLOGIA`.
   * @param {Partial<Record<string, unknown>>} [opciones.capacidades] Capacidades de observación detectadas.
   */
  constructor(opciones = {}) {
    const porDefecto = relojPorDefecto();
    this.reloj = opciones.reloj ?? porDefecto.ahora;
    this.monotonico = opciones.reloj ? opciones.monotonico === true : porDefecto.monotonico;
    const capacidad = opciones.capacidad ?? CAPACIDAD_CRONOLOGIA;
    this.capacidad = Number.isInteger(capacidad) && capacidad > 0 && capacidad <= CAPACIDAD_CRONOLOGIA ? capacidad : CAPACIDAD_CRONOLOGIA;
    this.inicio = this.reloj();
    /** Búfer circular de tamaño fijo. */
    /** @type {(EventoCronologia | undefined)[]} */
    this.bufer = new Array(this.capacidad);
    this.primero = 0;
    this.cantidad = 0;
    /** Número de secuencia del último evento aceptado (también cuenta los descartados después). */
    this.secuencia = 0;
    this.descartados = 0;
    this.noValidos = 0;
    this.ultimoT = 0;
    this.sesionLocal = 0;
    /** @type {string | null} */
    this.rol = null;
    /** @type {Record<string, boolean | null>} */
    this.capacidades = {};
    for (const nombre of CAPACIDADES) {
      const v = opciones.capacidades?.[nombre];
      this.capacidades[nombre] = typeof v === 'boolean' ? v : null;
    }
    if (this.capacidades.relojMonotonico === null) this.capacidades.relojMonotonico = this.monotonico;
  }

  /** @param {unknown} rol */
  fijarRol(rol) {
    this.rol = enLista(rol, ROLES) ? /** @type {string} */ (rol) : null;
  }

  /** Abre un número local de sesión (1, 2…), propio de este documento; no es el identificador del servidor. */
  nuevaSesionLocal() {
    if (this.sesionLocal < MAX_SESION_LOCAL) this.sesionLocal += 1;
    return this.sesionLocal;
  }

  /** Milisegundos enteros desde el inicio del registro; nunca retroceden. */
  tiempo() {
    const bruto = this.reloj() - this.inicio;
    const t = Number.isFinite(bruto) ? Math.max(0, Math.round(bruto)) : this.ultimoT;
    this.ultimoT = Math.max(this.ultimoT, t);
    return this.ultimoT;
  }

  /**
   * Registra un evento. Solo admite pares categoría-evento conocidos; los demás campos se sanean.
   * @param {string} categoria
   * @param {string} evento
   * @param {{ estado?: unknown, pista?: unknown, detalle?: unknown }} [extra]
   * @returns {boolean} `false` si el evento no es válido y no se registró.
   */
  registrar(categoria, evento, extra = {}) {
    const candidato = sanearEvento({
      n: this.secuencia + 1,
      t: this.tiempo(),
      sesionLocal: this.sesionLocal,
      categoria,
      evento,
      estado: extra?.estado,
      pista: extra?.pista,
      detalle: extra?.detalle,
    });
    if (!candidato) {
      this.noValidos += 1;
      return false;
    }
    this.secuencia += 1;
    if (this.cantidad < this.capacidad) {
      this.bufer[(this.primero + this.cantidad) % this.capacidad] = candidato;
      this.cantidad += 1;
    } else {
      this.bufer[this.primero] = candidato;
      this.primero = (this.primero + 1) % this.capacidad;
      this.descartados += 1;
    }
    return true;
  }

  /** Eventos conservados, del más antiguo al más reciente. */
  eventos() {
    /** @type {EventoCronologia[]} */
    const lista = [];
    for (let i = 0; i < this.cantidad; i += 1) {
      const e = this.bufer[(this.primero + i) % this.capacidad];
      if (e) lista.push(e);
    }
    return lista;
  }
}

/**
 * Exporta la cronología como un objeto nuevo construido desde la lista permitida.
 * @param {Cronologia} cronologia
 * @param {Date} [ahora] Reloj del dispositivo, solo para la marca de generación. No está sincronizado con el
 *   del otro participante: los tiempos de los eventos son relativos al inicio de cada registro.
 */
export function exportarCronologia(cronologia, ahora = new Date()) {
  const eventos = cronologia.eventos().map((e) => sanearEvento(e)).filter((e) => e !== null);
  /** @type {Record<string, boolean | null>} */
  const capacidades = {};
  for (const nombre of CAPACIDADES) {
    const v = cronologia.capacidades[nombre];
    capacidades[nombre] = typeof v === 'boolean' ? v : null;
  }
  return {
    esquema: ESQUEMA_CRONOLOGIA,
    generadoEn: ahora instanceof Date && !Number.isNaN(ahora.getTime()) ? ahora.toISOString() : null,
    rol: enLista(cronologia.rol, ROLES) ? cronologia.rol : null,
    reloj: cronologia.monotonico ? 'monotonico' : 'no-monotonico',
    duracionMs: cronologia.tiempo(),
    capacidad: cronologia.capacidad,
    eventosRegistrados: cronologia.secuencia,
    eventosConservados: eventos.length,
    eventosDescartados: cronologia.descartados,
    eventosNoValidos: cronologia.noValidos,
    capacidades,
    eventos,
  };
}

/** @param {ReturnType<typeof exportarCronologia>} exportada */
export function serializarCronologia(exportada) {
  return JSON.stringify(exportada, null, 2);
}
