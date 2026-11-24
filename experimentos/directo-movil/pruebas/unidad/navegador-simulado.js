// @ts-check
// Dobles controlados para ejecutar public/app.js en Node: un DOM mínimo generado desde public/index.html,
// una captura que la prueba resuelve cuando quiere, una RTCPeerConnection simulada y un fetch que llega al
// servidor real del experimento salvo las peticiones que la prueba decide retener.
// No es un navegador: no hay WebRTC, códecs, permisos ni dispositivos reales. Eso lo cubre pruebas/e2e/.
import { readFileSync } from 'node:fs';

const HTML = readFileSync(new URL('../../public/index.html', import.meta.url), 'utf8');
const SDP = 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n';

/** Estadísticas de ejemplo: números permitidos y registros con datos de red que el informe no debe copiar. */
function estadisticasPorDefecto() {
  return [
    { type: 'inbound-rtp', kind: 'video', bytesReceived: 5000, packetsReceived: 40, packetsLost: 1, framesDecoded: 30, framesDropped: 2, ssrc: 111 },
    { type: 'inbound-rtp', kind: 'audio', bytesReceived: 2000, packetsReceived: 50, packetsLost: 0, jitter: 0.004 },
    { type: 'outbound-rtp', kind: 'video', bytesSent: 6000, packetsSent: 45, framesEncoded: 31 },
    { type: 'outbound-rtp', kind: 'audio', bytesSent: 2500, packetsSent: 55 },
    { type: 'candidate-pair', state: 'succeeded', nominated: true, currentRoundTripTime: 0.0125, localCandidateId: 'L1', remoteCandidateId: 'R1' },
    { type: 'remote-candidate', id: 'R1', ip: SENUELOS.ip, address: SENUELOS.ip, port: 54321, candidate: SENUELOS.candidato, networkType: SENUELOS.red },
    { type: 'certificate', fingerprint: SENUELOS.huella },
  ];
}

/** Copia del fetch de Node, para que la propia prueba hable con el servidor sin pasar por los dobles. */
export const fetchReal = globalThis.fetch.bind(globalThis);

class ElementoSimulado {
  /**
   * @param {string} id
   * @param {string} etiqueta
   * @param {string} atributos
   * @param {string | null} seccion
   */
  constructor(id, etiqueta, atributos, seccion) {
    this.id = id;
    this.tagName = etiqueta.toUpperCase();
    this.hidden = /\shidden(\s|\/|$)/.test(atributos);
    this.textContent = '';
    this.seccion = seccion;
    /** @type {Map<string, ((e: unknown) => void)[]>} */
    this.oyentes = new Map();
  }

  /**
   * @param {string} tipo
   * @param {(e: unknown) => void} oyente
   */
  addEventListener(tipo, oyente) {
    const lista = this.oyentes.get(tipo) ?? [];
    lista.push(oyente);
    this.oyentes.set(tipo, lista);
  }
}

class BotonSimulado extends ElementoSimulado {
  disabled = false;
}

class EntradaSimulada extends ElementoSimulado {
  value = '';
  seleccionado = false;
  select() {
    this.seleccionado = true;
  }
}

class AreaTextoSimulada extends EntradaSimulada {
  enfocado = false;
  focus() {
    this.enfocado = true;
  }
}

class VideoSimulado extends ElementoSimulado {
  /**
   * @param {string} id
   * @param {string} etiqueta
   * @param {string} atributos
   * @param {string | null} seccion
   */
  constructor(id, etiqueta, atributos, seccion) {
    super(id, etiqueta, atributos, seccion);
    this.muted = /\smuted(\s|\/|$)/.test(atributos);
    /** @type {unknown} */
    this.srcObject = null;
    this.videoWidth = 0;
    this.videoHeight = 0;
    this.paused = true;
    this.currentTime = 0;
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }
}

/** Valores señuelo: ningún informe de diagnóstico puede contenerlos. */
export const SENUELOS = Object.freeze({
  dispositivo: 'SENUELO-DISPOSITIVO-ID',
  grupo: 'SENUELO-GRUPO-ID',
  etiqueta: 'SENUELO-ETIQUETA-CAMARA',
  ip: '203.0.113.77',
  candidato: 'candidate:1 1 udp 2122260223 203.0.113.77 54321 typ host',
  huella: 'SENUELO-HUELLA-DTLS',
  red: 'SENUELO-NOMBRE-RED',
  error: 'SENUELO-MENSAJE-DE-ERROR',
});

/** Ajustes que devuelve `getSettings()`: los permitidos y, mezclados, datos de dispositivo que no deben salir. */
const AJUSTES_POR_DEFECTO = Object.freeze({
  video: {
    width: 1280,
    height: 720,
    frameRate: 29.97,
    aspectRatio: 1.7777,
    facingMode: 'environment',
    deviceId: SENUELOS.dispositivo,
    groupId: SENUELOS.grupo,
    label: SENUELOS.etiqueta,
  },
  audio: {
    sampleRate: 48000,
    channelCount: 2,
    echoCancellation: true,
    deviceId: SENUELOS.dispositivo,
    groupId: SENUELOS.grupo,
    label: SENUELOS.etiqueta,
  },
});

/** Pista simulada: `stop()` la deja en `ended`, como en un navegador. */
class PistaSimulada {
  /**
   * @param {string} kind
   * @param {Record<string, unknown>} [ajustes]
   */
  constructor(kind, ajustes = /** @type {Record<string, Record<string, unknown>>} */ (AJUSTES_POR_DEFECTO)[kind] ?? {}) {
    this.kind = kind;
    this.readyState = 'live';
    this.muted = false;
    this.ajustes = ajustes;
  }

  getSettings() {
    return { ...this.ajustes };
  }

  stop() {
    this.readyState = 'ended';
  }
}

class FlujoSimulado {
  /** @param {PistaSimulada[]} [pistas] */
  constructor(pistas = []) {
    this.pistas = [...pistas];
  }

  getTracks() {
    return [...this.pistas];
  }

  /** @param {PistaSimulada} pista */
  addTrack(pista) {
    this.pistas.push(pista);
  }
}

/** Construye los elementos con id de public/index.html, con su sección y sus atributos iniciales. */
function construirDocumento() {
  /** @type {Map<string, ElementoSimulado>} */
  const elementos = new Map();
  /** @type {(string | null)[]} */
  const secciones = [];
  for (const [, cierre, etiqueta, atributos] of HTML.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi)) {
    const nombre = etiqueta.toLowerCase();
    if (nombre === 'section') {
      if (cierre) {
        secciones.pop();
        continue;
      }
    }
    if (cierre) continue;
    const id = /\sid="([^"]+)"/.exec(atributos)?.[1] ?? null;
    if (nombre === 'section') secciones.push(id);
    if (!id) continue;
    const seccion = nombre === 'section' ? null : (secciones.at(-1) ?? null);
    const Clase =
      nombre === 'button'
        ? BotonSimulado
        : nombre === 'input'
          ? EntradaSimulada
          : nombre === 'textarea'
            ? AreaTextoSimulada
            : nombre === 'video'
              ? VideoSimulado
              : ElementoSimulado;
    elementos.set(id, new Clase(id, nombre, atributos, seccion));
  }
  return elementos;
}

/**
 * @typedef {object} PeticionRetenida
 * @property {Record<string, any>} senal
 * @property {boolean} abortada `true` si el cliente canceló la petición (por ejemplo, al agotarse su límite).
 * @property {() => Promise<void>} liberar Entrega la petición al servidor real y devuelve su respuesta al cliente.
 */

/**
 * @typedef {object} CapturaPendiente
 * @property {(flujo?: FlujoSimulado) => FlujoSimulado} resolver
 * @property {(nombre: string) => void} rechazar
 */

/**
 * Instala los dobles como globales y devuelve los controles de la prueba. Llama a `restaurar` al terminar.
 * @param {{ base: string, url?: string }} opciones `url`: ruta y búsqueda de la página, con el fragmento.
 */
export function instalarNavegador({ base, url = '/' }) {
  const elementos = construirDocumento();
  const direccion = new URL(url, base);
  /** @type {Map<string, ((e: unknown) => void)[]>} */
  const oyentesVentana = new Map();
  /** @type {CapturaPendiente[]} */
  const capturas = [];
  /** Flujos entregados por la captura simulada, para contar pistas vivas sin depender de app.js. */
  /** @type {FlujoSimulado[]} */
  const flujos = [];
  /** @type {ConexionSimulada[]} */
  const conexiones = [];
  /** @type {PeticionRetenida[]} */
  const retenidas = [];
  /** @type {(senal: Record<string, any>) => boolean} */
  let retener = () => false;
  let capturaAutomatica = false;

  class ConexionSimulada {
    /** @param {unknown} configuracion */
    constructor(configuracion) {
      this.configuracion = configuracion;
      this.connectionState = 'new';
      this.iceConnectionState = 'new';
      this.signalingState = 'stable';
      /** Registros que devuelve `getStats()`, con datos que el informe no debe copiar. */
      this.estadisticas = estadisticasPorDefecto();
      /** Si es `true`, `getStats()` rechaza. */
      this.fallaEstadisticas = false;
      /** Si es `true`, `getStats()` queda pendiente hasta que la prueba la resuelva o la rechace. */
      this.retenerEstadisticas = false;
      /** @type {{ resolver: (registros?: unknown[]) => void, rechazar: () => void }[]} */
      this.estadisticasPendientes = [];
      /** @type {{ type: string, sdp?: string } | null} */
      this.localDescription = null;
      /** @type {{ type: string, sdp?: string } | null} */
      this.remoteDescription = null;
      /** @type {PistaSimulada[]} */
      this.pistas = [];
      this.cerrada = false;
      /** @type {((e: unknown) => void) | null} */
      this.onicecandidate = null;
      /** @type {((e: unknown) => void) | null} */
      this.ontrack = null;
      /** @type {(() => void) | null} */
      this.onconnectionstatechange = null;
      /** @type {(() => void) | null} */
      this.oniceconnectionstatechange = null;
      conexiones.push(this);
    }

    comprobarAbierta() {
      if (this.cerrada) throw new DOMException('La conexión está cerrada.', 'InvalidStateError');
    }

    /** @param {PistaSimulada} pista */
    addTrack(pista) {
      this.comprobarAbierta();
      this.pistas.push(pista);
    }

    async createOffer() {
      this.comprobarAbierta();
      return { type: 'offer', sdp: SDP };
    }

    async createAnswer() {
      this.comprobarAbierta();
      return { type: 'answer', sdp: SDP };
    }

    /** @param {{ type: string, sdp?: string }} descripcion */
    async setLocalDescription(descripcion) {
      this.comprobarAbierta();
      this.localDescription = descripcion;
    }

    /** @param {{ type: string, sdp?: string }} descripcion */
    async setRemoteDescription(descripcion) {
      this.comprobarAbierta();
      this.remoteDescription = descripcion;
    }

    async addIceCandidate() {
      this.comprobarAbierta();
    }

    async getStats() {
      if (this.fallaEstadisticas) throw new Error(SENUELOS.error);
      /** @param {unknown[]} registros */
      const informe = (registros) => new Map(registros.map((registro, i) => [String(i), registro]));
      if (this.retenerEstadisticas) {
        return new Promise((resolve, reject) => {
          this.estadisticasPendientes.push({
            resolver: (registros = this.estadisticas) => resolve(informe(registros)),
            rechazar: () => reject(new Error(SENUELOS.error)),
          });
        });
      }
      return informe(this.estadisticas);
    }

    /** Simula que la conexión se estableció. */
    conectar() {
      this.connectionState = 'connected';
      this.iceConnectionState = 'connected';
      this.onconnectionstatechange?.();
      this.oniceconnectionstatechange?.();
    }

    /** Simula la llegada de audio y video del emisor. Devuelve el flujo remoto. */
    recibirMedios() {
      const flujo = new FlujoSimulado([new PistaSimulada('video'), new PistaSimulada('audio')]);
      for (const track of flujo.getTracks()) this.ontrack?.({ streams: [flujo], track });
      return flujo;
    }

    close() {
      this.cerrada = true;
      this.connectionState = 'closed';
      this.iceConnectionState = 'closed';
    }
  }

  /** @type {string[]} */
  const copiados = [];
  /** Escrituras pendientes del modo `retiene`: la prueba decide cuándo y cómo terminan. */
  /** @type {{ texto: string, resolver: () => void, rechazar: () => void }[]} */
  const escrituras = [];
  /** Veces que la página llamó a `writeText`, terminen o no. */
  let intentosEscritura = 0;
  /** @type {'ok' | 'rechaza' | 'ausente' | 'retiene'} */
  let modoPortapapeles = 'ok';
  const navegador = {
    mediaDevices: /** @type {unknown} */ (null),
    userAgent: 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 Chrome/158.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv81',
    /** @type {{ platform?: string, brands?: { brand: string, version: string }[] } | undefined} */
    userAgentData: undefined,
    clipboard: /** @type {{ writeText: (t: string) => Promise<void> } | undefined} */ (undefined),
  };
  /** @param {'ok' | 'rechaza' | 'ausente' | 'retiene'} modo */
  function configurarPortapapeles(modo) {
    modoPortapapeles = modo;
    navegador.clipboard =
      modo === 'ausente'
        ? undefined
        : {
            async writeText(texto) {
              intentosEscritura += 1;
              if (modoPortapapeles === 'retiene') {
                return new Promise((resolve, reject) => {
                  escrituras.push({
                    texto,
                    resolver: () => {
                      copiados.push(texto);
                      resolve();
                    },
                    rechazar: () => reject(new DOMException(SENUELOS.error, 'NotAllowedError')),
                  });
                });
              }
              if (modoPortapapeles === 'rechaza') throw new DOMException(SENUELOS.error, 'NotAllowedError');
              copiados.push(texto);
            },
          };
  }
  configurarPortapapeles('ok');

  const mediaDevices = {
    /** @param {unknown} _restricciones */
    getUserMedia(_restricciones) {
      return new Promise((resolve, reject) => {
        /** @type {CapturaPendiente} */
        const pendiente = {
          resolver(flujo = new FlujoSimulado([new PistaSimulada('video'), new PistaSimulada('audio')])) {
            flujos.push(flujo);
            resolve(flujo);
            return flujo;
          },
          rechazar(nombre) {
            reject(new DOMException('Captura rechazada por la prueba.', nombre));
          },
        };
        if (capturaAutomatica) pendiente.resolver();
        else capturas.push(pendiente);
      });
    },
  };

  /**
   * @param {string | URL | Request} entrada
   * @param {RequestInit} [opciones]
   */
  function fetchSimulado(entrada, opciones = {}) {
    const destino = new URL(String(entrada), base);
    if (opciones.method === 'POST' && destino.pathname.endsWith('/senales')) {
      const senal = JSON.parse(String(opciones.body));
      if (retener(senal)) {
        return new Promise((resolve, reject) => {
          /** @type {PeticionRetenida} */
          const retenida = {
            senal,
            abortada: false,
            async liberar() {
              const { signal: _senal, ...resto } = opciones;
              const respuesta = await fetchReal(destino, resto);
              resolve(respuesta);
            },
          };
          retenidas.push(retenida);
          opciones.signal?.addEventListener('abort', () => {
            retenida.abortada = true;
            reject(new DOMException('Petición cancelada.', 'AbortError'));
          });
        });
      }
    }
    return fetchReal(destino, opciones);
  }

  navegador.mediaDevices = mediaDevices;

  const ventana = {
    isSecureContext: true,
    /**
     * @param {string} tipo
     * @param {(e: unknown) => void} oyente
     */
    addEventListener(tipo, oyente) {
      const lista = oyentesVentana.get(tipo) ?? [];
      lista.push(oyente);
      oyentesVentana.set(tipo, lista);
    },
  };

  const globales = {
    window: ventana,
    document: { getElementById: (/** @type {string} */ id) => elementos.get(id) ?? null, visibilityState: 'visible' },
    navigator: navegador,
    location: { origin: direccion.origin, search: direccion.search, hash: direccion.hash },
    history: { replaceState() {} },
    fetch: fetchSimulado,
    HTMLElement: ElementoSimulado,
    HTMLButtonElement: BotonSimulado,
    HTMLInputElement: EntradaSimulada,
    HTMLTextAreaElement: AreaTextoSimulada,
    HTMLVideoElement: VideoSimulado,
    RTCPeerConnection: ConexionSimulada,
    MediaStream: FlujoSimulado,
  };
  /** @type {Map<string, PropertyDescriptor | undefined>} */
  const originales = new Map();
  for (const [nombre, valor] of Object.entries(globales)) {
    originales.set(nombre, Object.getOwnPropertyDescriptor(globalThis, nombre));
    Object.defineProperty(globalThis, nombre, { value: valor, configurable: true, writable: true });
  }

  /** @param {string} id */
  function elemento(id) {
    const e = elementos.get(id);
    if (!e) throw new Error(`No existe #${id} en index.html`);
    return e;
  }

  /** @param {string} id */
  function visible(id) {
    const e = elemento(id);
    return !e.hidden && (e.seccion === null || !elemento(e.seccion).hidden);
  }

  return {
    elemento,
    visible,
    /** @param {string} id */
    texto: (id) => elemento(id).textContent,
    /** @param {string} id */
    valor: (id) => String(/** @type {any} */ (elemento(id)).value ?? ''),
    /**
     * Pulsa un botón como lo haría una persona: solo si se ve y está habilitado.
     * @param {string} id
     */
    pulsar(id) {
      const boton = elemento(id);
      if (!(boton instanceof BotonSimulado)) throw new Error(`#${id} no es un botón`);
      if (!visible(id)) throw new Error(`#${id} no está visible`);
      if (boton.disabled) throw new Error(`#${id} está deshabilitado`);
      for (const oyente of boton.oyentes.get('click') ?? []) oyente({ type: 'click' });
    },
    /** @param {string} id */
    habilitado(id) {
      const boton = elemento(id);
      return boton instanceof BotonSimulado && !boton.disabled;
    },
    capturas,
    copiados,
    escrituras,
    intentosEscritura: () => intentosEscritura,
    configurarPortapapeles,
    navegador,
    flujos,
    conexiones,
    retenidas,
    /** @param {(senal: Record<string, any>) => boolean} predicado Señales cuyo POST queda retenido. */
    retenerSenales(predicado) {
      retener = predicado;
    },
    /** @param {boolean} valor Si es `true`, las capturas nuevas se conceden en el acto. */
    capturaAutomatica(valor) {
      capturaAutomatica = valor;
    },
    /** Pistas que siguen vivas en todos los flujos entregados por la captura simulada. */
    pistasVivas() {
      return flujos.reduce((n, f) => n + f.getTracks().filter((p) => p.readyState === 'live').length, 0);
    },
    /** @returns {Promise<any>} */
    diagnostico: () => /** @type {any} */ (ventana).directoDiagnostico(),
    restaurar() {
      for (const [nombre, descriptor] of originales) {
        if (descriptor) Object.defineProperty(globalThis, nombre, descriptor);
        else delete (/** @type {any} */ (globalThis))[nombre];
      }
    },
  };
}

let instancias = 0;

/** Evalúa una instancia nueva de public/app.js con los dobles instalados en ese momento. */
export async function cargarApp() {
  instancias += 1;
  await import(new URL(`../../public/app.js?instancia=${instancias}`, import.meta.url).href);
}
