// @ts-check
// Almacén en memoria de sesiones temporales de prueba: un emisor y un espectador por sesión.
import { randomBytes, timingSafeEqual } from 'node:crypto';

/** @typedef {import('./validacion.js').Rol} Rol */

/**
 * Canal de eventos hacia un participante conectado (en el servidor, un flujo SSE).
 * @typedef {{ enviar: (evento: string, datos: unknown) => void, cerrar: () => void }} Canal
 */

/**
 * @typedef {object} Sesion
 * @property {string} id
 * @property {Record<Rol, Buffer>} tokens
 * @property {number} creadaEn
 * @property {number} expiraEn
 * @property {number} ultimaActividad
 * @property {Record<Rol, Canal | null>} canales
 * @property {{ inicio: number, cuenta: number }} ventanaSenales
 */

/**
 * @typedef {object} OpcionesAlmacen
 * @property {number} [maxSesiones]
 * @property {number} [duracionMaxMs] Vida máxima de una sesión.
 * @property {number} [inactividadMs] Tiempo sin participantes conectados antes de limpiarla.
 * @property {number} [maxSenalesPorMinuto]
 * @property {() => number} [ahora]
 */

export const OPCIONES_POR_DEFECTO = Object.freeze({
  maxSesiones: 16,
  duracionMaxMs: 30 * 60 * 1000,
  inactividadMs: 60 * 1000,
  maxSenalesPorMinuto: 300,
});

/** @param {number} bytes */
function aleatorio(bytes) {
  return randomBytes(bytes).toString('base64url');
}

/** @param {Rol} rol */
export function rolContrario(rol) {
  return rol === 'emisor' ? 'espectador' : 'emisor';
}

export class AlmacenSesiones {
  /** @param {OpcionesAlmacen} [opciones] */
  constructor(opciones = {}) {
    this.maxSesiones = opciones.maxSesiones ?? OPCIONES_POR_DEFECTO.maxSesiones;
    this.duracionMaxMs = opciones.duracionMaxMs ?? OPCIONES_POR_DEFECTO.duracionMaxMs;
    this.inactividadMs = opciones.inactividadMs ?? OPCIONES_POR_DEFECTO.inactividadMs;
    this.maxSenalesPorMinuto = opciones.maxSenalesPorMinuto ?? OPCIONES_POR_DEFECTO.maxSenalesPorMinuto;
    this.ahora = opciones.ahora ?? Date.now;
    /** @type {Map<string, Sesion>} */
    this.sesiones = new Map();
  }

  get tamano() {
    return this.sesiones.size;
  }

  /**
   * Crea una sesión con identificador y tokens impredecibles.
   * @returns {{ sesion: string, tokenEmisor: string, tokenEspectador: string, expiraEn: number } | null}
   *   `null` si se alcanzó el máximo de sesiones.
   */
  crear() {
    this.barrer();
    if (this.sesiones.size >= this.maxSesiones) return null;
    let id = aleatorio(16);
    while (this.sesiones.has(id)) id = aleatorio(16);
    const tokenEmisor = aleatorio(32);
    const tokenEspectador = aleatorio(32);
    const ahora = this.ahora();
    /** @type {Sesion} */
    const sesion = {
      id,
      tokens: { emisor: Buffer.from(tokenEmisor), espectador: Buffer.from(tokenEspectador) },
      creadaEn: ahora,
      expiraEn: ahora + this.duracionMaxMs,
      ultimaActividad: ahora,
      canales: { emisor: null, espectador: null },
      ventanaSenales: { inicio: ahora, cuenta: 0 },
    };
    this.sesiones.set(id, sesion);
    return { sesion: id, tokenEmisor, tokenEspectador, expiraEn: sesion.expiraEn };
  }

  /**
   * Devuelve la sesión si existe y no ha caducado.
   * @param {string} id
   */
  obtener(id) {
    const sesion = this.sesiones.get(id);
    if (!sesion) return undefined;
    if (this.ahora() >= sesion.expiraEn) {
      this.eliminar(id, 'expirada');
      return undefined;
    }
    return sesion;
  }

  /**
   * Resuelve el rol de un token dentro de una sesión. Compara en tiempo constante.
   * @param {Sesion} sesion
   * @param {string} token
   * @returns {Rol | null}
   */
  rolPorToken(sesion, token) {
    const recibido = Buffer.from(token);
    for (const rol of /** @type {Rol[]} */ (['emisor', 'espectador'])) {
      const esperado = sesion.tokens[rol];
      if (recibido.length === esperado.length && timingSafeEqual(recibido, esperado)) return rol;
    }
    return null;
  }

  /**
   * Registra la conexión de un participante. Rechaza un segundo canal para el mismo rol.
   * @param {Sesion} sesion
   * @param {Rol} rol
   * @param {Canal} canal
   * @returns {boolean}
   */
  conectar(sesion, rol, canal) {
    if (sesion.canales[rol]) return false;
    sesion.canales[rol] = canal;
    sesion.ultimaActividad = this.ahora();
    return true;
  }

  /**
   * Quita el canal de un participante si sigue siendo el registrado.
   * @param {Sesion} sesion
   * @param {Rol} rol
   * @param {Canal} canal
   */
  desconectar(sesion, rol, canal) {
    if (sesion.canales[rol] !== canal) return false;
    sesion.canales[rol] = null;
    sesion.ultimaActividad = this.ahora();
    return true;
  }

  /**
   * Cuenta una señal y aplica el límite por minuto de la sesión.
   * @param {Sesion} sesion
   * @returns {boolean} `false` si se superó el límite.
   */
  registrarSenal(sesion) {
    const ahora = this.ahora();
    if (ahora - sesion.ventanaSenales.inicio >= 60_000) {
      sesion.ventanaSenales = { inicio: ahora, cuenta: 0 };
    }
    sesion.ventanaSenales.cuenta += 1;
    sesion.ultimaActividad = ahora;
    return sesion.ventanaSenales.cuenta <= this.maxSenalesPorMinuto;
  }

  /**
   * Elimina una sesión, avisa a los participantes conectados y cierra sus canales.
   * @param {string} id
   * @param {string} motivo
   */
  eliminar(id, motivo) {
    const sesion = this.sesiones.get(id);
    if (!sesion) return false;
    this.sesiones.delete(id);
    for (const rol of /** @type {Rol[]} */ (['emisor', 'espectador'])) {
      const canal = sesion.canales[rol];
      sesion.canales[rol] = null;
      if (canal) {
        canal.enviar('fin', { motivo });
        canal.cerrar();
      }
    }
    return true;
  }

  /**
   * Limpia las sesiones caducadas y las que llevan demasiado tiempo sin participantes.
   * @returns {string[]} Identificadores eliminados.
   */
  barrer() {
    const ahora = this.ahora();
    /** @type {string[]} */
    const eliminadas = [];
    for (const sesion of [...this.sesiones.values()]) {
      const sinParticipantes = !sesion.canales.emisor && !sesion.canales.espectador;
      if (ahora >= sesion.expiraEn) {
        this.eliminar(sesion.id, 'expirada');
        eliminadas.push(sesion.id);
      } else if (sinParticipantes && ahora - sesion.ultimaActividad >= this.inactividadMs) {
        this.eliminar(sesion.id, 'abandonada');
        eliminadas.push(sesion.id);
      }
    }
    return eliminadas;
  }

  /** Cierra todas las sesiones (al apagar el servidor). */
  cerrarTodas() {
    for (const id of [...this.sesiones.keys()]) this.eliminar(id, 'servidor-detenido');
  }
}
