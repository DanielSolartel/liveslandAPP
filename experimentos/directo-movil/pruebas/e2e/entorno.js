// @ts-check
// Entorno de las pruebas de navegador de continuidad (E03): servidor real, Chromium con medios SINTÉTICOS y
// ayudas de diagnóstico. Mismo criterio de arranque que recorrido.test.js: Chromium de Playwright (canal
// «chromium»), DIRECTO_CHROMIUM (ruta del ejecutable) o DIRECTO_CANAL. Si el navegador no arranca, la prueba
// falla con el motivo y el proceso termina: no se da por superada.
import { chromium } from 'playwright-core';
import { crearServidor } from '../../src/servidor.js';

export const MEDIOS_SINTETICOS = '--use-fake-device-for-media-stream';
export const PERMISO_AUTOMATICO = '--use-fake-ui-for-media-stream';

/** @param {string[]} args */
async function lanzar(args) {
  const ejecutable = process.env.DIRECTO_CHROMIUM || undefined;
  const canal = process.env.DIRECTO_CANAL || (ejecutable ? undefined : 'chromium');
  try {
    return await chromium.launch({ headless: true, args, executablePath: ejecutable, channel: canal });
  } catch (error) {
    const origen = ejecutable ? `DIRECTO_CHROMIUM=${ejecutable}` : `canal ${canal}`;
    throw new Error(
      `No se pudo arrancar el navegador de la prueba (${origen}). Revisa DIRECTO_CHROMIUM o DIRECTO_CANAL ` +
        `(README, «Comandos»). Causa: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

/**
 * Servidor y navegador propios de una prueba; se cierran aunque falle cualquier paso.
 * @param {(entorno: { app: ReturnType<typeof crearServidor>, base: string, navegador: import('playwright-core').Browser }) => Promise<void>} cuerpo
 */
export async function conEntorno(cuerpo) {
  const app = crearServidor();
  try {
    const direccion = await app.escuchar(0, '127.0.0.1');
    const base = `http://127.0.0.1:${direccion.port}`;
    const navegador = await lanzar([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO]);
    try {
      await cuerpo({ app, base, navegador });
    } finally {
      await navegador.close();
    }
  } finally {
    await app.cerrar();
  }
}

/**
 * INYECCIÓN DE FALLOS SOLO PARA PRUEBAS. Script de inicio que la prueba instala en su propio contexto de
 * navegador con `addInitScript`: registra las RTCPeerConnection que crea la página para que la prueba pueda
 * cerrarlas y provocar una interrupción WebRTC real. No forma parte de la aplicación ni se sirve nunca.
 */
function registrarConexionesDePrueba() {
  const Original = window.RTCPeerConnection;
  /** @type {RTCPeerConnection[]} */
  const conexiones = [];
  class Registrada extends Original {
    /** @param {RTCConfiguration} [configuracion] */
    constructor(configuracion) {
      super(configuracion);
      conexiones.push(this);
    }
  }
  window.RTCPeerConnection = Registrada;
  /** @type {any} */ (window).__conexionesDePrueba = conexiones;
}

/**
 * Página en un contexto aislado (como otro navegador), con el registro de conexiones de prueba.
 * @param {import('playwright-core').Browser} navegador
 */
export async function nuevaPagina(navegador) {
  const contexto = await navegador.newContext();
  await contexto.addInitScript(registrarConexionesDePrueba);
  return contexto.newPage();
}

/**
 * Cierra la última RTCPeerConnection de la página: interrupción WebRTC controlada.
 * @param {import('playwright-core').Page} pagina
 */
export function cerrarUltimaConexion(pagina) {
  return pagina.evaluate(() => {
    const lista = /** @type {RTCPeerConnection[]} */ (/** @type {any} */ (window).__conexionesDePrueba);
    lista.at(-1)?.close();
    return lista.length;
  });
}

/** @param {import('playwright-core').Page} pagina */
export function conexionesCreadas(pagina) {
  return pagina.evaluate(() => /** @type {RTCPeerConnection[]} */ (/** @type {any} */ (window).__conexionesDePrueba).length);
}

/** @param {import('playwright-core').Page} pagina */
export function diagnostico(pagina) {
  return pagina.evaluate(() => /** @type {any} */ (window).directoDiagnostico());
}

/**
 * @param {import('playwright-core').Page} pagina
 * @param {(d: any) => boolean} condicion
 * @param {number} [ms]
 */
export async function esperarDiagnostico(pagina, condicion, ms = 20_000) {
  const limite = Date.now() + ms;
  let ultimo;
  for (;;) {
    ultimo = await diagnostico(pagina);
    if (condicion(ultimo)) return ultimo;
    if (Date.now() > limite) throw new Error(`Diagnóstico sin cumplir la condición: ${JSON.stringify(ultimo)}`);
    await pagina.waitForTimeout(200);
  }
}

/**
 * Emisor y espectador conectados con audio y video recibidos por WebRTC.
 * @param {import('playwright-core').Browser} navegador
 * @param {string} base
 */
export async function emisorYEspectador(navegador, base) {
  const emisor = await nuevaPagina(navegador);
  const espectador = await nuevaPagina(navegador);
  await emisor.goto(`${base}/`);
  await emisor.click('#btn-crear');
  await emisor.waitForFunction(() => /** @type {HTMLInputElement} */ (document.querySelector('#enlace-espectador')).value !== '');
  const enlace = await emisor.inputValue('#enlace-espectador');
  await emisor.click('#btn-activar');
  await emisor.waitForFunction(() => document.querySelector('#estado-medios')?.textContent?.includes('activos'));
  await espectador.goto(enlace);
  await esperarRecepcion(espectador);
  await esperarDiagnostico(emisor, (d) => d.conexion === 'connected');
  const url = new URL(enlace);
  return { emisor, espectador, enlace, sesion: String(url.searchParams.get('s')), tokenEspectador: url.hash.slice(1) };
}

/**
 * Espera a que el espectador reciba y decodifique audio y video (pulsa «Reproducir» si el navegador lo pide).
 * @param {import('playwright-core').Page} espectador
 */
export async function esperarRecepcion(espectador) {
  await espectador.waitForFunction(
    () => /** @type {HTMLVideoElement} */ (document.querySelector('#video-remoto')).srcObject !== null,
    null,
    { timeout: 20_000 },
  );
  if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');
  return esperarDiagnostico(
    espectador,
    (d) => d.conexion === 'connected' && d.medidas.video.framesDecodificados > 10 && d.medidas.audio.paquetesRecibidos > 10,
  );
}

/**
 * Comprueba en el espectador que los medios avanzan entre dos lecturas: fotogramas, bytes, paquetes de audio
 * y tiempo de reproducción. Es la prueba de progreso renovado, no solo de `connected`.
 * @param {import('playwright-core').Page} espectador
 */
export async function progresoRecepcion(espectador) {
  const a = await diagnostico(espectador);
  await espectador.waitForTimeout(1000);
  const b = await diagnostico(espectador);
  return {
    fotogramas: b.medidas.video.framesDecodificados > a.medidas.video.framesDecodificados,
    bytesVideo: b.medidas.video.bytesRecibidos > a.medidas.video.bytesRecibidos,
    paquetesAudio: b.medidas.audio.paquetesRecibidos > a.medidas.audio.paquetesRecibidos,
    reproduccion: b.videoRemoto.tiempo > a.videoRemoto.tiempo && !b.videoRemoto.pausado,
  };
}

/**
 * Lee la cronología exportada por la página (pulsando «Generar cronología»).
 * @param {import('playwright-core').Page} pagina
 */
export async function cronologiaDe(pagina) {
  await pagina.click('#btn-cronologia');
  await pagina.waitForFunction(() => /** @type {HTMLTextAreaElement} */ (document.querySelector('#cronologia-texto')).value !== '');
  const texto = await pagina.inputValue('#cronologia-texto');
  return { texto, datos: JSON.parse(texto) };
}

/**
 * Retiene en la página el primer POST de señalización del tipo indicado (sin respuesta); el resto continúa.
 * @param {import('playwright-core').Page} pagina
 * @param {string} tipo
 */
export async function retenerSenal(pagina, tipo) {
  /** @type {import('playwright-core').Route[]} */
  const retenidas = [];
  await pagina.route('**/api/sesiones/*/senales', async (ruta) => {
    let esDelTipo = false;
    try {
      esDelTipo = ruta.request().postDataJSON()?.tipo === tipo;
    } catch {
      esDelTipo = false;
    }
    if (retenidas.length === 0 && esDelTipo) {
      retenidas.push(ruta);
      return;
    }
    await ruta.continue();
  });
  return retenidas;
}
