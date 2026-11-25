// @ts-check
// Cliente de señalización: recibe eventos por SSE leído con fetch (el token va en una cabecera,
// nunca en la URL) y envía señales por POST. Funciona en el navegador y en Node.

/**
 * @typedef {{ evento: string, datos: unknown }} EventoSse
 * Estados que comunica un canal. `cerrada`: el servidor terminó el flujo después de enviar `fin` (cierre
 * normal). `interrumpida` (E03): el flujo terminó o falló sin ese `fin` y sin que la página lo cerrara a
 * propósito. Tras `cerrar()` el canal no comunica nada más: un cierre intencional no es una interrupción.
 * @typedef {'conectando' | 'conectada' | 'cerrada' | 'interrumpida' | 'error'} EstadoCanal
 * @typedef {'no-autorizado' | 'sesion-inexistente' | 'rol-ocupado' | 'par-ausente' | 'conflicto' | 'limite-senales'
 *   | 'tiempo-agotado' | 'red' | 'fin-inesperado' | 'flujo-interrumpido' | 'http-otro'} CategoriaCanal
 */

/**
 * Límite técnico de cada envío por POST. Contra el servidor local o de la LAN, un envío tarda milisegundos;
 * pasado este tiempo se cancela y se informa como `tiempo-agotado`, para que ninguna tarea quede esperando
 * a la red. No es la regla de reconexión del producto (1 minuto), que este experimento no implementa.
 */
export const LIMITE_ENVIO_MS = 3000;

/**
 * Límite técnico (E03) para que el servidor responda a la apertura del flujo de eventos (cabeceras). Contra el
 * servidor local responde en milisegundos; pasado este tiempo la apertura se cancela como `tiempo-agotado` en
 * lugar de quedar pendiente. No es una regla del producto.
 */
export const LIMITE_APERTURA_MS = 5000;

/**
 * Traduce el resultado de una apertura o interrupción a una categoría de lista cerrada.
 * @param {{ estadoHttp?: number, error?: string } | undefined} detalle
 * @returns {CategoriaCanal}
 */
export function categoriaCanal(detalle) {
  switch (detalle?.estadoHttp) {
    case 401:
    case 403:
      return 'no-autorizado';
    case 404:
      return 'sesion-inexistente';
    case 409:
      // E03-R01-04: el servidor distingue el rol ya conectado (apertura del flujo) del otro participante
      // ausente (envío de una señal). Cualquier otro 409 es un conflicto sin más detalle; el código recibido
      // no se copia.
      if (detalle?.error === 'rol-ya-conectado') return 'rol-ocupado';
      if (detalle?.error === 'par-ausente') return 'par-ausente';
      return 'conflicto';
    case 429:
      return 'limite-senales';
    case undefined:
    case 0:
      break;
    default:
      return 'http-otro';
  }
  switch (detalle?.error) {
    case 'tiempo-agotado':
    case 'red':
    case 'fin-inesperado':
    case 'flujo-interrumpido':
      return detalle.error;
    default:
      return 'red';
  }
}

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
   * @param {number} [opciones.limiteAperturaMs] Límite de la apertura del flujo; por defecto, `LIMITE_APERTURA_MS`.
   */
  constructor({
    sesion,
    token,
    alEvento,
    alEstado,
    base = '',
    fetch: fetchPropio,
    limiteEnvioMs = LIMITE_ENVIO_MS,
    limiteAperturaMs = LIMITE_APERTURA_MS,
  }) {
    this.sesion = sesion;
    this.token = token;
    this.alEvento = alEvento;
    this.alEstado = alEstado ?? (() => {});
    this.base = base;
    this.fetch = fetchPropio ?? globalThis.fetch.bind(globalThis);
    this.limiteEnvioMs = limiteEnvioMs;
    this.limiteAperturaMs = limiteAperturaMs;
    /** @type {AbortController | null} */
    this.control = null;
    /** Un objeto canal se abre una sola vez: reabrir es crear otro canal, nunca reutilizar este. */
    this.abierto = false;
    /** `true` tras `cerrar()`: desde entonces el canal no entrega eventos ni estados. */
    this.cerradoIntencionalmente = false;
  }

  get rutaSesion() {
    return `${this.base}/api/sesiones/${encodeURIComponent(this.sesion)}`;
  }

  /**
   * Abre el flujo de eventos. Resuelve cuando el flujo termina.
   * - Un error de red o un límite de apertura agotado se comunican como `error` (`red` o `tiempo-agotado`).
   * - Una respuesta HTTP de error, como `error` con su estado.
   * - El fin del flujo tras un evento `fin` del servidor, como `cerrada` (cierre normal).
   * - El fin del flujo sin `fin` ni `cerrar()` (EOF inesperado) o un fallo de lectura, como `interrumpida`.
   * - Tras `cerrar()`, nada: ni estados ni eventos tardíos.
   */
  async abrir() {
    if (this.abierto) return;
    this.abierto = true;
    const control = new AbortController();
    this.control = control;
    let agotado = false;
    const temporizador = setTimeout(() => {
      agotado = true;
      control.abort();
    }, this.limiteAperturaMs);
    /**
     * @param {EstadoCanal} estado
     * @param {{ estadoHttp?: number, error?: string }} [detalle]
     */
    const emitir = (estado, detalle) => {
      if (!this.cerradoIntencionalmente) this.alEstado(estado, detalle);
    };
    emitir('conectando');
    let respuesta;
    try {
      respuesta = await this.fetch(`${this.rutaSesion}/eventos`, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'text/event-stream' },
        signal: control.signal,
        cache: 'no-store',
      });
    } catch {
      clearTimeout(temporizador);
      emitir('error', { error: agotado ? 'tiempo-agotado' : 'red' });
      return;
    }
    clearTimeout(temporizador);
    if (!respuesta.ok || !respuesta.body) {
      const cuerpo = await respuesta.json().catch(() => ({}));
      emitir('error', { estadoHttp: respuesta.status, error: typeof cuerpo?.error === 'string' ? cuerpo.error : undefined });
      return;
    }
    if (this.cerradoIntencionalmente) {
      await respuesta.body.cancel().catch(() => {});
      return;
    }
    emitir('conectada');
    const lector = respuesta.body.getReader();
    const decodificador = new TextDecoder();
    let finRecibido = false;
    const procesar = crearLectorSse((e) => {
      if (e.evento === 'fin') finRecibido = true;
      if (!this.cerradoIntencionalmente) this.alEvento(e);
    });
    try {
      for (;;) {
        const { value, done } = await lector.read();
        if (done) break;
        if (this.cerradoIntencionalmente) break;
        procesar(decodificador.decode(value, { stream: true }));
      }
      if (finRecibido) emitir('cerrada');
      else emitir('interrumpida', { error: 'fin-inesperado' });
    } catch {
      emitir('interrumpida', { error: 'flujo-interrumpido' });
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

  /** Cierre intencional: cancela el flujo y suprime los estados y eventos que llegaran después. */
  cerrar() {
    this.cerradoIntencionalmente = true;
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
