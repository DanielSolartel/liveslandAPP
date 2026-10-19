// @ts-check
// Cliente de señalización: recibe eventos por SSE leído con fetch (el token va en una cabecera,
// nunca en la URL) y envía señales por POST. Funciona en el navegador y en Node.

/**
 * @typedef {{ evento: string, datos: unknown }} EventoSse
 * @typedef {'conectando' | 'conectada' | 'cerrada' | 'error'} EstadoCanal
 */

/**
 * Límite técnico de cada envío por POST. Contra el servidor local o de la LAN, un envío tarda milisegundos;
 * pasado este tiempo se cancela y se informa como `tiempo-agotado`, para que ninguna tarea quede esperando
 * a la red. No es la regla de reconexión del producto (1 minuto), que este experimento no implementa.
 */
export const LIMITE_ENVIO_MS = 3000;

/**
 * Crea un lector incremental de text/event-stream.
 * @param {(e: EventoSse) => void} alEvento
 * @returns {(fragmento: string) => void}
 */
export function crearLectorSse(alEvento) {
  let pendiente = '';
  return (fragmento) => {
    pendiente += fragmento.replace(/\r\n?/g, '\n');
    let fin = pendiente.indexOf('\n\n');
    while (fin !== -1) {
      const bloque = pendiente.slice(0, fin);
      pendiente = pendiente.slice(fin + 2);
      let evento = 'message';
      /** @type {string[]} */
      const datos = [];
      for (const linea of bloque.split('\n')) {
        if (linea === '' || linea.startsWith(':')) continue;
        const separador = linea.indexOf(':');
        const campo = separador === -1 ? linea : linea.slice(0, separador);
        let valor = separador === -1 ? '' : linea.slice(separador + 1);
        if (valor.startsWith(' ')) valor = valor.slice(1);
        if (campo === 'event') evento = valor;
        else if (campo === 'data') datos.push(valor);
      }
      if (datos.length > 0) {
        try {
          alEvento({ evento, datos: JSON.parse(datos.join('\n')) });
        } catch {
          // Un evento que no es JSON no procede de este servidor: se ignora.
        }
      }
      fin = pendiente.indexOf('\n\n');
    }
  };
}

export class CanalSenalizacion {
  /**
   * @param {object} opciones
   * @param {string} opciones.sesion
   * @param {string} opciones.token
   * @param {(e: EventoSse) => void} opciones.alEvento
   * @param {(estado: EstadoCanal, detalle?: { estadoHttp?: number, error?: string }) => void} [opciones.alEstado]
   * @param {string} [opciones.base] Origen del servidor; vacío en el navegador.
   * @param {typeof fetch} [opciones.fetch]
   * @param {number} [opciones.limiteEnvioMs] Límite de cada envío; por defecto, `LIMITE_ENVIO_MS`.
   */
  constructor({ sesion, token, alEvento, alEstado, base = '', fetch: fetchPropio, limiteEnvioMs = LIMITE_ENVIO_MS }) {
    this.sesion = sesion;
    this.token = token;
    this.alEvento = alEvento;
    this.alEstado = alEstado ?? (() => {});
    this.base = base;
    this.fetch = fetchPropio ?? globalThis.fetch.bind(globalThis);
    this.limiteEnvioMs = limiteEnvioMs;
    /** @type {AbortController | null} */
    this.control = null;
  }

  get rutaSesion() {
    return `${this.base}/api/sesiones/${encodeURIComponent(this.sesion)}`;
  }

  /** Abre el flujo de eventos. Resuelve cuando el flujo termina. */
  async abrir() {
    this.control = new AbortController();
    this.alEstado('conectando');
    let respuesta;
    try {
      respuesta = await this.fetch(`${this.rutaSesion}/eventos`, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'text/event-stream' },
        signal: this.control.signal,
        cache: 'no-store',
      });
    } catch {
      this.alEstado(this.control?.signal.aborted ? 'cerrada' : 'error', { error: 'red' });
      return;
    }
    if (!respuesta.ok || !respuesta.body) {
      const cuerpo = await respuesta.json().catch(() => ({}));
      this.alEstado('error', { estadoHttp: respuesta.status, error: cuerpo?.error });
      return;
    }
    this.alEstado('conectada');
    const lector = respuesta.body.getReader();
    const decodificador = new TextDecoder();
    const procesar = crearLectorSse(this.alEvento);
    try {
      for (;;) {
        const { value, done } = await lector.read();
        if (done) break;
        procesar(decodificador.decode(value, { stream: true }));
      }
      this.alEstado('cerrada');
    } catch {
      this.alEstado(this.control?.signal.aborted ? 'cerrada' : 'error', { error: 'flujo-interrumpido' });
    }
  }

  /**
   * Envía una señal al otro participante, o al servidor (`fin`, `salir`). Nunca espera más que el límite
   * de envío: si se agota, cancela la petición y devuelve `tiempo-agotado`.
   * @param {object} senal
   * @returns {Promise<{ ok: boolean, estadoHttp: number, error?: string }>}
   */
  async enviar(senal) {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), this.limiteEnvioMs);
    try {
      const respuesta = await this.fetch(`${this.rutaSesion}/senales`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(senal),
        cache: 'no-store',
        signal: control.signal,
      });
      const cuerpo = await respuesta.json().catch(() => ({}));
      return { ok: respuesta.ok, estadoHttp: respuesta.status, error: cuerpo?.error };
    } catch {
      return { ok: false, estadoHttp: 0, error: control.signal.aborted ? 'tiempo-agotado' : 'red' };
    } finally {
      clearTimeout(temporizador);
    }
  }

  cerrar() {
    this.control?.abort();
    this.control = null;
  }
}

/**
 * Crea una sesión de prueba en el servidor.
 * @param {{ base?: string, fetch?: typeof fetch }} [opciones]
 * @returns {Promise<{ ok: true, sesion: string, tokenEmisor: string, tokenEspectador: string, expiraEn: number }
 *   | { ok: false, estadoHttp: number, error?: string }>}
 */
export async function crearSesion({ base = '', fetch: fetchPropio } = {}) {
  const f = fetchPropio ?? globalThis.fetch.bind(globalThis);
  try {
    const respuesta = await f(`${base}/api/sesiones`, { method: 'POST', cache: 'no-store' });
    const cuerpo = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) return { ok: false, estadoHttp: respuesta.status, error: cuerpo?.error };
    return { ok: true, ...cuerpo };
  } catch {
    return { ok: false, estadoHttp: 0, error: 'red' };
  }
}
