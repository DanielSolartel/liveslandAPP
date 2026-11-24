// @ts-check
// Captura y liberación de cámara y micrófono, e informe de diagnóstico exportable (al final del archivo).
// Sin dependencias del DOM: se prueba con dobles en Node.

/**
 * @typedef {{ isSecureContext: boolean, mediaDevices?: { getUserMedia?: (r: MediaStreamConstraints) => Promise<MediaStream> } }} EntornoMedios
 * @typedef {'contexto-inseguro' | 'api-ausente' | 'permiso-denegado' | 'bloqueado-por-seguridad' | 'sin-dispositivo'
 *   | 'dispositivo-ocupado' | 'restricciones-invalidas' | 'no-soportado' | 'error-desconocido'} CodigoErrorMedios
 * @typedef {{ ok: true, stream: MediaStream } | { ok: false, codigo: CodigoErrorMedios, mensaje: string }} ResultadoMedios
 * @typedef {{ readyState: string, stop: () => void }} PistaLiberable
 * @typedef {{ getTracks: () => PistaLiberable[] }} FlujoLiberable
 */

/** @type {Readonly<Record<CodigoErrorMedios, string>>} */
export const MENSAJES_MEDIOS = Object.freeze({
  'contexto-inseguro':
    'El navegador solo permite cámara y micrófono en un contexto seguro: https:// o http://localhost.',
  'api-ausente': 'Este navegador no ofrece la API de captura (navigator.mediaDevices.getUserMedia).',
  'permiso-denegado': 'Permiso de cámara o micrófono denegado. Revísalo en la configuración del sitio.',
  'bloqueado-por-seguridad': 'La captura está bloqueada por la política de seguridad de la página o del navegador.',
  'sin-dispositivo': 'No se encontró una cámara o un micrófono compatibles.',
  'dispositivo-ocupado': 'La cámara o el micrófono están en uso o no responden.',
  'restricciones-invalidas': 'La solicitud de captura no es válida.',
  'no-soportado': 'Este navegador no admite la captura solicitada en este modo (por ejemplo, sin interfaz de permisos).',
  'error-desconocido': 'No se pudo iniciar la captura.',
});

/**
 * @param {EntornoMedios} entorno
 * @returns {{ disponible: true } | { disponible: false, codigo: 'contexto-inseguro' | 'api-ausente' }}
 */
export function capturaDisponible(entorno) {
  if (!entorno.isSecureContext) return { disponible: false, codigo: 'contexto-inseguro' };
  if (!entorno.mediaDevices || typeof entorno.mediaDevices.getUserMedia !== 'function') {
    return { disponible: false, codigo: 'api-ausente' };
  }
  return { disponible: true };
}

/**
 * @param {unknown} error
 * @returns {CodigoErrorMedios}
 */
export function codigoDeError(error) {
  const nombre = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  switch (nombre) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'permiso-denegado';
    case 'SecurityError':
      return 'bloqueado-por-seguridad';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'sin-dispositivo';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'dispositivo-ocupado';
    case 'TypeError':
      return 'restricciones-invalidas';
    case 'NotSupportedError':
      return 'no-soportado';
    default:
      return 'error-desconocido';
  }
}

/**
 * Solicita cámara y micrófono. Debe llamarse desde una acción explícita del usuario.
 * @param {EntornoMedios} entorno
 * @param {MediaStreamConstraints} [restricciones]
 * @returns {Promise<ResultadoMedios>}
 */
export async function solicitarMedios(entorno, restricciones = { video: true, audio: true }) {
  const disponible = capturaDisponible(entorno);
  if (!disponible.disponible) {
    return { ok: false, codigo: disponible.codigo, mensaje: MENSAJES_MEDIOS[disponible.codigo] };
  }
  const getUserMedia = /** @type {(r: MediaStreamConstraints) => Promise<MediaStream>} */ (
    entorno.mediaDevices?.getUserMedia
  );
  try {
    const stream = await getUserMedia.call(entorno.mediaDevices, restricciones);
    return { ok: true, stream };
  } catch (error) {
    const codigo = codigoDeError(error);
    return { ok: false, codigo, mensaje: MENSAJES_MEDIOS[codigo] };
  }
}

/**
 * Detiene todas las pistas de un flujo. Devuelve cuántas se detuvieron.
 * @param {FlujoLiberable | null | undefined} stream
 */
export function liberarMedios(stream) {
  if (!stream) return 0;
  let detenidas = 0;
  for (const pista of stream.getTracks()) {
    if (pista.readyState !== 'ended') {
      pista.stop();
      detenidas += 1;
    }
  }
  return detenidas;
}

/**
 * Cuenta las pistas que siguen activas en una lista de flujos.
 * @param {Iterable<FlujoLiberable>} flujos
 */
export function contarPistasActivas(flujos) {
  let activas = 0;
  for (const flujo of flujos) {
    for (const pista of flujo.getTracks()) if (pista.readyState === 'live') activas += 1;
  }
  return activas;
}

// ---------- Informe de diagnóstico ----------
// El informe se construye con una lista explícita de campos permitidos: de los datos que reúne la página
// (ajustes de pistas, estadísticas WebRTC, estados) solo se copian los campos y valores de esta lista, ya
// saneados. Nunca se serializa un objeto del navegador completo. Quedan fuera tokens, identificadores de
// sesión, enlaces, SDP, candidatos ICE, direcciones IP, datos de dispositivos y mensajes de error sin sanear.
// Ninguna cadena del navegador se copia al informe: del agente de usuario solo salen la familia (lista
// cerrada) y una versión numérica, y la plataforma sale de una lista cerrada.

// Esquema 2: `navegador.agente` (cadena) se sustituye por `navegador.familia` y `navegador.version`, y
// `navegador.plataforma` pasa a ser un valor de lista cerrada.
export const ESQUEMA_INFORME = 'live-directo-movil/informe-diagnostico/2';

/** Espera máxima de las estadísticas WebRTC al generar el informe. Pasado este tiempo, constan como no disponibles. */
export const LIMITE_ESTADISTICAS_INFORME_MS = 2000;

/** Categorías de error conocidas. Cualquier otro valor se informa como `desconocida`. */
export const CATEGORIAS_ERROR = Object.freeze([
  ...Object.keys(MENSAJES_MEDIOS).map((codigo) => `captura-${codigo}`),
  'sesion-no-creada',
  'sesion-limite-alcanzado',
  'enlace-incompleto',
  'canal-no-autorizado',
  'canal-inexistente',
  'canal-rol-ocupado',
  'canal-perdido',
  'senal-procesamiento',
  'senal-oferta-no-enviada',
  'senal-respuesta-no-enviada',
  'webrtc-conexion-fallida',
  'reproduccion-requiere-gesto',
  'aviso-cierre-sin-confirmar',
]);

const ENUMS = Object.freeze({
  rol: ['emisor', 'espectador'],
  canal: ['sin-canal', 'conectando', 'conectada', 'cerrada', 'error', 'no-iniciada'],
  aviso: ['sin-aviso', 'pendiente', 'confirmado', 'sin-confirmar'],
  captura: ['sin-sesion', 'no-aplica', 'sin-activar', 'solicitando', 'activa', 'sin-captura', 'liberada'],
  conexion: ['sin-conexion', 'new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'],
  ice: ['new', 'checking', 'connected', 'completed', 'failed', 'disconnected', 'closed'],
  senalizacion: ['stable', 'have-local-offer', 'have-remote-offer', 'have-local-pranswer', 'have-remote-pranswer', 'closed'],
  visibilidad: ['visible', 'hidden'],
  pista: ['video', 'audio'],
  estadoPista: ['live', 'ended'],
  reproduccion: ['sin-flujo', 'reproduciendo', 'pausada', 'requiere-gesto'],
  orientacion: ['user', 'environment', 'left', 'right'],
  motivoMetricas: ['sin-conexion', 'api-ausente', 'error', 'tiempo-agotado', 'descartadas'],
});

const MAX_PISTAS_INFORME = 8;
const MAX_CATEGORIAS_INFORME = 20;

/**
 * @param {unknown} v
 * @returns {Record<string, any>}
 */
function objeto(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? /** @type {Record<string, any>} */ (v) : {};
}

/**
 * @param {unknown} v
 * @param {readonly string[]} permitidos
 * @returns {string | null}
 */
function enumDe(v, permitidos) {
  return typeof v === 'string' && permitidos.includes(v) ? v : null;
}

/** @param {unknown} v */
function booleano(v) {
  return typeof v === 'boolean' ? v : null;
}

/**
 * Número finito y no negativo, redondeado a `decimales`.
 * @param {unknown} v
 * @param {number} [decimales]
 */
function numeroNoNegativo(v, decimales = 0) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null;
  const f = 10 ** decimales;
  return Math.round(v * f) / f;
}

/** Longitud máxima de un agente de usuario o de una plataforma que se analiza. Un valor más largo no se reconoce. */
const MAX_CADENA_NAVEGADOR = 1000;

/**
 * Familias de navegador que se reconocen, en orden de prioridad (Edge, Opera y Samsung Internet también
 * incluyen «Chrome/» en su agente). Cada una tiene el prefijo que precede a su versión.
 * @type {readonly (readonly [string, RegExp])[]}
 */
const FAMILIAS_NAVEGADOR = Object.freeze([
  ['edge', /\bEdg(?:e|A|iOS)?\//],
  ['opera', /\bOPR\//],
  ['samsung', /\bSamsungBrowser\//],
  ['firefox', /\b(?:Firefox|FxiOS)\//],
  ['chrome-sin-interfaz', /\bHeadlessChrome\//],
  ['chrome', /\b(?:Chrome|CriOS)\//],
  ['safari', /\bVersion\/(?=\d[\d.]* (?:Mobile\/\S+ )?Safari\/)/],
]);

/**
 * Plataformas que se reconocen, en orden de prioridad (Android incluye «Linux» y iOS incluye «Mac OS X»).
 * @type {readonly (readonly [string, RegExp])[]}
 */
const PLATAFORMAS = Object.freeze([
  ['android', /\bandroid\b/i],
  ['ios', /\b(?:iphone|ipad|ipod)\b/i],
  ['chromeos', /\bcros\b|\bchrome ?os\b/i],
  ['windows', /\bwin(?:dows|32|64)\b/i],
  ['macos', /\bmac(?:intel|os|intosh)?\b/i],
  ['linux', /\blinux\b|\bx11\b/i],
]);

/**
 * Reconoce la familia de navegador y su versión mayor a partir del agente de usuario. Devuelve solo valores
 * de la lista cerrada y un entero de hasta tres cifras; la cadena original nunca se conserva.
 * @param {unknown} agente
 * @returns {{ familia: string | null, version: number | null }}
 */
export function reconocerNavegador(agente) {
  if (typeof agente !== 'string' || agente.length > MAX_CADENA_NAVEGADOR) return { familia: null, version: null };
  for (const [familia, prefijo] of FAMILIAS_NAVEGADOR) {
    if (!prefijo.test(agente)) continue;
    const m = new RegExp(`${prefijo.source}(\\d{1,3})(?!\\d)`).exec(agente);
    return { familia, version: m ? Number(m[1]) : null };
  }
  return { familia: null, version: null };
}

/**
 * Reconoce la plataforma entre varias cadenas del navegador (agente, `userAgentData.platform`,
 * `navigator.platform`). Devuelve solo un valor de la lista cerrada, el de mayor prioridad que aparezca.
 * @param {unknown[]} candidatos
 * @returns {string | null}
 */
export function reconocerPlataforma(candidatos) {
  const cadenas = candidatos.filter((c) => typeof c === 'string' && c.length <= MAX_CADENA_NAVEGADOR);
  for (const [plataforma, patron] of PLATAFORMAS) {
    if (cadenas.some((c) => patron.test(/** @type {string} */ (c)))) return plataforma;
  }
  return null;
}

/**
 * Suma las estadísticas WebRTC por tipo de medio. Un campo que ningún registro aporta queda en `null`
 * (no disponible), no en 0.
 * @param {Iterable<unknown> | null | undefined} registros Registros de `RTCStatsReport`, ya como lista.
 */
export function agregarEstadisticas(registros) {
  /** @type {{ video: Record<string, number | null>, audio: Record<string, number | null>, rttMs: number | null }} */
  const m = {
    video: {
      bytesRecibidos: null,
      paquetesRecibidos: null,
      paquetesPerdidos: null,
      fotogramasDecodificados: null,
      fotogramasDescartados: null,
      bytesEnviados: null,
      paquetesEnviados: null,
      fotogramasCodificados: null,
    },
    audio: {
      bytesRecibidos: null,
      paquetesRecibidos: null,
      paquetesPerdidos: null,
      jitterMs: null,
      bytesEnviados: null,
      paquetesEnviados: null,
    },
    rttMs: null,
  };
  /**
   * @param {Record<string, number | null>} grupo
   * @param {string} campo
   * @param {unknown} valor
   */
  const sumar = (grupo, campo, valor) => {
    const n = numeroNoNegativo(valor);
    if (n !== null) grupo[campo] = (grupo[campo] ?? 0) + n;
  };
  if (!registros || typeof (/** @type {any} */ (registros)[Symbol.iterator]) !== 'function') return m;
  for (const registro of registros) {
    const r = objeto(registro);
    if (r.type === 'candidate-pair' && r.state === 'succeeded' && (r.nominated === true || r.selected === true)) {
      const rtt = numeroNoNegativo(r.currentRoundTripTime, 6);
      if (rtt !== null) m.rttMs = Math.round(rtt * 10_000) / 10;
      continue;
    }
    const medio = r.kind === 'video' ? m.video : r.kind === 'audio' ? m.audio : null;
    if (!medio) continue;
    if (r.type === 'inbound-rtp') {
      sumar(medio, 'bytesRecibidos', r.bytesReceived);
      sumar(medio, 'paquetesRecibidos', r.packetsReceived);
      // Los paquetes perdidos pueden ser negativos en el estándar (duplicados): se ignoran esos valores.
      sumar(medio, 'paquetesPerdidos', r.packetsLost);
      if (r.kind === 'video') {
        sumar(medio, 'fotogramasDecodificados', r.framesDecoded);
        sumar(medio, 'fotogramasDescartados', r.framesDropped);
      } else {
        const jitter = numeroNoNegativo(r.jitter, 6);
        if (jitter !== null) medio.jitterMs = Math.max(medio.jitterMs ?? 0, Math.round(jitter * 10_000) / 10);
      }
    } else if (r.type === 'outbound-rtp') {
      sumar(medio, 'bytesEnviados', r.bytesSent);
      sumar(medio, 'paquetesEnviados', r.packetsSent);
      if (r.kind === 'video') sumar(medio, 'fotogramasCodificados', r.framesEncoded);
    }
  }
  return m;
}

/**
 * Ajustes audiovisuales permitidos de una pista. Se descartan los demás campos de `getSettings()`
 * (identificadores de dispositivo y de grupo, por ejemplo).
 * @param {string | null} tipo
 * @param {unknown} ajustes
 */
function ajustesPermitidos(tipo, ajustes) {
  const a = objeto(ajustes);
  if (tipo === 'video') {
    return {
      ancho: numeroNoNegativo(a.width),
      alto: numeroNoNegativo(a.height),
      fotogramasPorSegundo: numeroNoNegativo(a.frameRate, 1),
      orientacionCamara: enumDe(a.facingMode, ENUMS.orientacion),
    };
  }
  if (tipo === 'audio') {
    return { frecuenciaMuestreo: numeroNoNegativo(a.sampleRate), canales: numeroNoNegativo(a.channelCount) };
  }
  return null;
}

/**
 * Rutas de los valores `null` del informe, para declarar explícitamente lo que no está disponible.
 * @param {unknown} valor
 * @param {string} [ruta]
 * @param {string[]} [salida]
 * @returns {string[]}
 */
function rutasNoDisponibles(valor, ruta = '', salida = []) {
  if (valor === null) salida.push(ruta);
  else if (Array.isArray(valor)) valor.forEach((v, i) => rutasNoDisponibles(v, `${ruta}[${i}]`, salida));
  else if (typeof valor === 'object') {
    for (const [clave, v] of Object.entries(/** @type {Record<string, unknown>} */ (valor))) {
      rutasNoDisponibles(v, ruta === '' ? clave : `${ruta}.${clave}`, salida);
    }
  }
  return salida;
}

/**
 * Construye el informe a partir de los datos que reúne la página. Solo lo permitido, saneado.
 * Lo que no se puede saber consta como `null` y en `noDisponible`; nada se inventa.
 * @param {unknown} [datos] Datos brutos de la página. Puede traer campos que el informe no admite.
 * @param {Date} [ahora]
 */
export function construirInforme(datos = {}, ahora = new Date()) {
  const d = objeto(datos);
  const nav = objeto(d.navegador);
  const apis = objeto(nav.apis);
  const est = objeto(d.estadisticas);

  const pistasLocales = (Array.isArray(d.pistasLocales) ? d.pistasLocales : []).slice(0, MAX_PISTAS_INFORME).map((p) => {
    const o = objeto(p);
    const tipo = enumDe(o.tipo, ENUMS.pista);
    return {
      tipo,
      estado: enumDe(o.estado, ENUMS.estadoPista),
      silenciada: booleano(o.silenciada),
      ajustes: ajustesPermitidos(tipo, o.ajustes),
    };
  });
  const pistasRemotas = (Array.isArray(d.pistasRemotas) ? d.pistasRemotas : []).slice(0, MAX_PISTAS_INFORME).map((p) => {
    const o = objeto(p);
    return {
      tipo: enumDe(o.tipo, ENUMS.pista),
      estado: enumDe(o.estado, ENUMS.estadoPista),
      silenciada: booleano(o.silenciada),
    };
  });

  const categorias = [
    ...new Set(
      (Array.isArray(d.errores) ? d.errores : [])
        .slice(0, MAX_CATEGORIAS_INFORME)
        .map((c) => (typeof c === 'string' && CATEGORIAS_ERROR.includes(c) ? c : 'desconocida')),
    ),
  ];

  const terminada = booleano(d.terminado);
  const localesActivas = numeroNoNegativo(d.pistasLocalesActivas);
  const remotasActivas = numeroNoNegativo(d.pistasRemotasActivas);
  const conexionAbierta = booleano(d.conexionAbierta);
  /** @type {'si' | 'no' | 'no-aplica'} */
  let recursosLiberados = 'no-aplica';
  if (terminada === true) {
    recursosLiberados = localesActivas === 0 && remotasActivas === 0 && conexionAbierta === false ? 'si' : 'no';
  }

  const metricasDisponibles = est.estado === 'ok';
  const agregadas = metricasDisponibles ? agregarEstadisticas(est.registros) : null;

  const { familia, version } = reconocerNavegador(nav.agente);

  const informe = {
    esquema: ESQUEMA_INFORME,
    generadoEn: ahora instanceof Date && !Number.isNaN(ahora.getTime()) ? ahora.toISOString() : null,
    rol: enumDe(d.rol, ENUMS.rol),
    navegador: {
      familia,
      version,
      plataforma: reconocerPlataforma([nav.plataformaDatos, nav.agente, nav.plataforma]),
      visibilidad: enumDe(nav.visibilidad, ENUMS.visibilidad),
      contextoSeguro: booleano(nav.contextoSeguro),
      apis: {
        getUserMedia: booleano(apis.getUserMedia),
        rtcPeerConnection: booleano(apis.rtcPeerConnection),
        getStats: booleano(apis.getStats),
        portapapeles: booleano(apis.portapapeles),
      },
    },
    sesion: {
      canal: enumDe(d.canal, ENUMS.canal),
      terminada,
    },
    captura: {
      estado: enumDe(d.captura, ENUMS.captura),
      ultimoError: d.codigoCaptura === null || d.codigoCaptura === undefined ? 'ninguno' : (enumDe(d.codigoCaptura, Object.keys(MENSAJES_MEDIOS)) ?? 'desconocido'),
      vistaPreviaSilenciada: booleano(d.vistaPreviaSilenciada),
    },
    pistas: {
      localesActivas,
      remotasActivas,
      flujosLocalesCreados: numeroNoNegativo(d.flujosLocalesCreados),
      locales: pistasLocales,
      remotas: pistasRemotas,
    },
    reproduccion: (() => {
      const v = objeto(d.reproduccion);
      return {
        estado: enumDe(v.estado, ENUMS.reproduccion),
        ancho: numeroNoNegativo(v.ancho),
        alto: numeroNoNegativo(v.alto),
        silenciado: booleano(v.silenciado),
      };
    })(),
    webrtc: {
      conexion: enumDe(d.conexion, ENUMS.conexion),
      ice: enumDe(d.ice, ENUMS.ice),
      senalizacion: enumDe(d.senalizacionRtc, ENUMS.senalizacion),
    },
    metricas: {
      disponible: metricasDisponibles,
      motivo: metricasDisponibles ? 'ninguno' : (enumDe(est.estado, ENUMS.motivoMetricas) ?? 'desconocido'),
      video: agregadas ? agregadas.video : null,
      audio: agregadas ? agregadas.audio : null,
      rttMs: agregadas ? agregadas.rttMs : null,
    },
    finalizacion: {
      terminada,
      avisoCierre: enumDe(d.avisoCierre, ENUMS.aviso),
      conexionAbierta,
      recursosLiberados,
      capturasDescartadas: numeroNoNegativo(d.capturasDescartadas),
    },
    errores: { total: categorias.length, categorias },
  };
  return { ...informe, noDisponible: rutasNoDisponibles(informe) };
}

/** @param {ReturnType<typeof construirInforme>} informe */
export function serializarInforme(informe) {
  return JSON.stringify(informe, null, 2);
}

/**
 * Copia un texto al portapapeles solo si el navegador lo permite. No afirma una copia que no ocurrió.
 * @param {string} texto
 * @param {{ writeText?: (t: string) => Promise<void> } | null | undefined} portapapeles
 * @returns {Promise<{ ok: true } | { ok: false, motivo: 'no-disponible' | 'rechazado' }>}
 */
export async function copiarTexto(texto, portapapeles) {
  if (!portapapeles || typeof portapapeles.writeText !== 'function') return { ok: false, motivo: 'no-disponible' };
  try {
    await portapapeles.writeText(texto);
    return { ok: true };
  } catch {
    return { ok: false, motivo: 'rechazado' };
  }
}
