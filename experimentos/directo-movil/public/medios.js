// @ts-check
// Captura y liberación de cámara y micrófono. Sin dependencias del DOM: se prueba con dobles en Node.

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
