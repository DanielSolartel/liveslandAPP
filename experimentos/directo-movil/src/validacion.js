// @ts-check
// Validación de las señales WebRTC que intercambian emisor y espectador.
// El servidor solo reenvía campos conocidos: nunca el objeto recibido tal cual.

/** @typedef {'emisor' | 'espectador'} Rol */

/**
 * @typedef {{ candidate: string, sdpMid: string | null, sdpMLineIndex: number | null, usernameFragment: string | null }} Candidato
 * @typedef {{ tipo: 'oferta' | 'respuesta', sdp: string, neg?: number }
 *   | { tipo: 'candidato', candidato: Candidato, neg?: number }
 *   | { tipo: 'fin' }
 *   | { tipo: 'salir' }
 *   | { tipo: 'solicitud-oferta' }} Senal
 * @typedef {{ ok: true, senal: Senal } | { ok: false, estado: 400 | 403, error: string }} ResultadoValidacion
 */

export const LIMITES = Object.freeze({
  cuerpoMaxBytes: 64 * 1024,
  sdpMaxCaracteres: 32 * 1024,
  candidatoMaxCaracteres: 2048,
  sdpMidMaxCaracteres: 64,
  fragmentoUsuarioMaxCaracteres: 256,
  indiceLineaMax: 1024,
  /** Mayor identificador de negociación admitido (LIVE-FASE03-E03): un entero positivo de 31 bits. */
  negociacionMax: 2 ** 31 - 1,
});

/** @type {Readonly<Record<Rol, readonly string[]>>} */
export const TIPOS_POR_ROL = Object.freeze({
  emisor: Object.freeze(['oferta', 'candidato', 'fin']),
  // `solicitud-oferta` (E03): el espectador pide al emisor una negociación nueva. No lleva datos y no es una
  // oferta: el emisor sigue siendo el único que crea ofertas.
  espectador: Object.freeze(['respuesta', 'candidato', 'salir', 'solicitud-oferta']),
});

const TIPOS_CONOCIDOS = new Set(['oferta', 'respuesta', 'candidato', 'fin', 'salir', 'solicitud-oferta']);

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
 * Identificador de negociación opcional (E03). Sirve solo para correlacionar oferta, respuesta y candidatos de
 * una misma negociación y descartar los de otra: no autentica ni autoriza nada (eso lo hace el token del rol).
 * @param {unknown} valor
 * @returns {{ ok: true, neg: number | undefined } | { ok: false }}
 */
function negociacionDe(valor) {
  if (valor === undefined) return { ok: true, neg: undefined };
  if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= LIMITES.negociacionMax) {
    return { ok: true, neg: valor };
  }
  return { ok: false };
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
  const negociacion = tipo === 'oferta' || tipo === 'respuesta' || tipo === 'candidato' ? negociacionDe(valor.neg) : null;
  if (negociacion && !negociacion.ok) {
    return { ok: false, estado: 400, error: 'negociacion-invalida' };
  }
  const neg = negociacion?.ok ? negociacion.neg : undefined;

  if (tipo === 'oferta' || tipo === 'respuesta') {
    const sdp = valor.sdp;
    if (typeof sdp !== 'string' || sdp.length === 0 || sdp.length > LIMITES.sdpMaxCaracteres || !sdp.startsWith('v=0')) {
      return { ok: false, estado: 400, error: 'sdp-invalido' };
    }
    return { ok: true, senal: neg === undefined ? { tipo, sdp } : { tipo, sdp, neg } };
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
    /** @type {Candidato} */
    const saneado = {
      candidate,
      sdpMid: /** @type {string | null} */ (sdpMid ?? null),
      sdpMLineIndex: /** @type {number | null} */ (sdpMLineIndex),
      usernameFragment,
    };
    return {
      ok: true,
      senal: neg === undefined ? { tipo: 'candidato', candidato: saneado } : { tipo: 'candidato', candidato: saneado, neg },
    };
  }

  // 'fin' (emisor), 'salir' y 'solicitud-oferta' (espectador) no llevan datos.
  return { ok: true, senal: /** @type {Senal} */ ({ tipo }) };
}
