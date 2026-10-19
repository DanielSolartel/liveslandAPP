// @ts-check
// Validación de las señales WebRTC que intercambian emisor y espectador.
// El servidor solo reenvía campos conocidos: nunca el objeto recibido tal cual.

/** @typedef {'emisor' | 'espectador'} Rol */

/**
 * @typedef {{ candidate: string, sdpMid: string | null, sdpMLineIndex: number | null, usernameFragment: string | null }} Candidato
 * @typedef {{ tipo: 'oferta' | 'respuesta', sdp: string }
 *   | { tipo: 'candidato', candidato: Candidato }
 *   | { tipo: 'fin' }
 *   | { tipo: 'salir' }} Senal
 * @typedef {{ ok: true, senal: Senal } | { ok: false, estado: 400 | 403, error: string }} ResultadoValidacion
 */

export const LIMITES = Object.freeze({
  cuerpoMaxBytes: 64 * 1024,
  sdpMaxCaracteres: 32 * 1024,
  candidatoMaxCaracteres: 2048,
  sdpMidMaxCaracteres: 64,
  fragmentoUsuarioMaxCaracteres: 256,
  indiceLineaMax: 1024,
});

/** @type {Readonly<Record<Rol, readonly string[]>>} */
export const TIPOS_POR_ROL = Object.freeze({
  emisor: Object.freeze(['oferta', 'candidato', 'fin']),
  espectador: Object.freeze(['respuesta', 'candidato', 'salir']),
});

const TIPOS_CONOCIDOS = new Set(['oferta', 'respuesta', 'candidato', 'fin', 'salir']);

/** Identificador de sesión: 16 bytes aleatorios en base64url. */
export const PATRON_ID_SESION = /^[A-Za-z0-9_-]{22}$/;
/** Token de rol: 32 bytes aleatorios en base64url. */
export const PATRON_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * @param {unknown} valor
 * @returns {valor is Record<string, unknown>}
 */
function esObjetoPlano(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * @param {unknown} valor
 * @param {number} max
 * @returns {valor is string | null}
 */
function esTextoOpcional(valor, max) {
  return valor === null || (typeof valor === 'string' && valor.length <= max);
}

/**
 * Comprueba una señal recibida de un rol concreto y devuelve una copia saneada.
 * @param {Rol} rol
 * @param {unknown} valor
 * @returns {ResultadoValidacion}
 */
export function validarSenal(rol, valor) {
  if (!esObjetoPlano(valor) || typeof valor.tipo !== 'string') {
    return { ok: false, estado: 400, error: 'senal-invalida' };
  }
  const tipo = valor.tipo;
  if (!TIPOS_CONOCIDOS.has(tipo)) {
    return { ok: false, estado: 400, error: 'tipo-desconocido' };
  }
  if (!TIPOS_POR_ROL[rol].includes(tipo)) {
    return { ok: false, estado: 403, error: 'tipo-no-permitido-para-el-rol' };
  }

  if (tipo === 'oferta' || tipo === 'respuesta') {
    const sdp = valor.sdp;
    if (typeof sdp !== 'string' || sdp.length === 0 || sdp.length > LIMITES.sdpMaxCaracteres || !sdp.startsWith('v=0')) {
      return { ok: false, estado: 400, error: 'sdp-invalido' };
    }
    return { ok: true, senal: { tipo, sdp } };
  }

  if (tipo === 'candidato') {
    const c = valor.candidato;
    if (!esObjetoPlano(c)) {
      return { ok: false, estado: 400, error: 'candidato-invalido' };
    }
    const { candidate, sdpMid, sdpMLineIndex } = c;
    const usernameFragment = c.usernameFragment === undefined ? null : c.usernameFragment;
    const indiceValido =
      sdpMLineIndex === null ||
      (typeof sdpMLineIndex === 'number' &&
        Number.isInteger(sdpMLineIndex) &&
        sdpMLineIndex >= 0 &&
        sdpMLineIndex <= LIMITES.indiceLineaMax);
    if (
      typeof candidate !== 'string' ||
      candidate.length > LIMITES.candidatoMaxCaracteres ||
      !esTextoOpcional(sdpMid ?? null, LIMITES.sdpMidMaxCaracteres) ||
      !indiceValido ||
      !esTextoOpcional(usernameFragment, LIMITES.fragmentoUsuarioMaxCaracteres)
    ) {
      return { ok: false, estado: 400, error: 'candidato-invalido' };
    }
    return {
      ok: true,
      senal: {
        tipo: 'candidato',
        candidato: {
          candidate,
          sdpMid: /** @type {string | null} */ (sdpMid ?? null),
          sdpMLineIndex: /** @type {number | null} */ (sdpMLineIndex),
          usernameFragment,
        },
      },
    };
  }

  // 'fin' (emisor) y 'salir' (espectador) no llevan datos.
  return { ok: true, senal: /** @type {Senal} */ ({ tipo }) };
}
