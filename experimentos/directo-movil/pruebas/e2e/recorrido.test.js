// @ts-check
// Recorrido emisor–espectador en Chromium con dispositivos SINTÉTICOS de Chromium
// (--use-fake-device-for-media-stream): no es una cámara ni un micrófono físicos.
// Navegador: Chromium completo de Playwright en modo sin interfaz (canal «chromium», en PLAYWRIGHT_BROWSERS_PATH),
// o DIRECTO_CHROMIUM (ruta del ejecutable) o DIRECTO_CANAL (por ejemplo, chrome o msedge).
// Si el navegador no arranca, cada prueba falla con el motivo y el proceso termina: no se dan por superadas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { crearServidor } from '../../src/servidor.js';
import { LIMITE_ENVIO_MS } from '../../public/senalizacion.js';

const MEDIOS_SINTETICOS = '--use-fake-device-for-media-stream';
const PERMISO_AUTOMATICO = '--use-fake-ui-for-media-stream';

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
 * Ejecuta una prueba con su propio servidor y su propio navegador. Cierra lo que llegó a crearse aunque
 * falle el arranque del navegador o cualquier paso posterior, para que el proceso termine solo.
 * @param {string[]} args
 * @param {(entorno: { app: ReturnType<typeof crearServidor>, base: string, navegador: import('playwright-core').Browser }) => Promise<void>} cuerpo
 */
async function conEntorno(args, cuerpo) {
  const app = crearServidor();
  try {
    const direccion = await app.escuchar(0, '127.0.0.1');
    const base = `http://127.0.0.1:${direccion.port}`;
    const navegador = await lanzar(args);
    try {
      await cuerpo({ app, base, navegador });
    } finally {
      await navegador.close();
    }
  } finally {
    await app.cerrar();
  }
}

/** @param {import('playwright-core').Page} pagina */
function diagnostico(pagina) {
  return pagina.evaluate(() => /** @type {any} */ (window).directoDiagnostico());
}

/**
 * @param {import('playwright-core').Page} pagina
 * @param {(d: any) => boolean} condicion
 * @param {number} [ms]
 */
async function esperarDiagnostico(pagina, condicion, ms = 20_000) {
  const limite = Date.now() + ms;
  let ultimo;
  for (;;) {
    ultimo = await diagnostico(pagina);
    if (condicion(ultimo)) return ultimo;
    if (Date.now() > limite) throw new Error(`Diagnóstico sin cumplir la condición: ${JSON.stringify(ultimo)}`);
    await pagina.waitForTimeout(200);
  }
}

/** @param {import('playwright-core').Page} pagina */
async function crearYLeerEnlace(pagina) {
  await pagina.click('#btn-crear');
  await pagina.waitForFunction(() => /** @type {HTMLInputElement} */ (document.querySelector('#enlace-espectador')).value !== '');
  return pagina.inputValue('#enlace-espectador');
}

test('recorrido emisor–espectador: medios recibidos por WebRTC, fin con liberación y nueva sesión', async () => {
  await conEntorno([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO], async ({ app, base, navegador }) => {
      // Dos contextos aislados, como dos navegadores distintos.
      const emisor = await (await navegador.newContext()).newPage();
      const espectadorCtx = await navegador.newContext();
      const espectador = await espectadorCtx.newPage();

      await emisor.goto(`${base}/`);
      const enlace = await crearYLeerEnlace(emisor);
      assert.match(enlace, /\/\?s=[A-Za-z0-9_-]{22}#[A-Za-z0-9_-]{43}$/);
      await emisor.click('#btn-activar');
      await emisor.waitForFunction(() => document.querySelector('#estado-medios')?.textContent?.includes('activos'));
      const inicial = await diagnostico(emisor);
      assert.equal(inicial.vistaPreviaSilenciada, true, 'la vista previa local está silenciada');
      assert.equal(inicial.pistasLocalesActivas, 2, 'una pista de video y una de audio');

      await espectador.goto(enlace);
      await espectador.waitForFunction(
        () => /** @type {HTMLVideoElement} */ (document.querySelector('#video-remoto')).srcObject !== null,
        null,
        { timeout: 20_000 },
      );
      if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');

      const recibido = await esperarDiagnostico(
        espectador,
        (d) =>
          d.conexion === 'connected' &&
          d.medidas.video.framesDecodificados > 10 &&
          d.medidas.audio.paquetesRecibidos > 10 &&
          d.videoRemoto.ancho > 0 &&
          !d.videoRemoto.pausado,
      );
      assert.equal(recibido.pistasRemotas, 2);
      assert.ok(recibido.medidas.video.bytesRecibidos > 0);
      assert.ok(recibido.medidas.audio.bytesRecibidos > 0);
      const tiempoAntes = recibido.videoRemoto.tiempo;
      await espectador.waitForTimeout(500);
      assert.ok((await diagnostico(espectador)).videoRemoto.tiempo > tiempoAntes, 'la reproducción avanza');
      const enviado = await diagnostico(emisor);
      assert.ok(enviado.medidas.video.bytesEnviados > 0 && enviado.medidas.audio.bytesEnviados > 0);

      // Finalizar: el emisor libera la captura y el espectador recibe el fin.
      await emisor.click('#btn-finalizar');
      await emisor.waitForSelector('#vista-final:not([hidden])');
      const finEmisor = await diagnostico(emisor);
      assert.equal(finEmisor.pistasLocalesActivas, 0, 'no quedan pistas de captura activas');
      assert.equal(finEmisor.conexion, 'sin-conexion');
      await espectador.waitForSelector('#vista-final:not([hidden])');
      assert.match((await espectador.textContent('#texto-final')) ?? '', /finalizó/);
      const finEspectador = await diagnostico(espectador);
      assert.equal(finEspectador.conexion, 'sin-conexion');
      assert.equal(finEspectador.pistasRemotas, 0);
      assert.equal(app.almacen.tamano, 0, 'la sesión se eliminó del servidor');

      // Nueva sesión en la misma página, sin conservar pistas antiguas.
      await emisor.click('#btn-nueva');
      const enlace2 = await crearYLeerEnlace(emisor);
      assert.notEqual(enlace2, enlace);
      await emisor.click('#btn-activar');
      await emisor.waitForFunction(() => document.querySelector('#estado-medios')?.textContent?.includes('activos'));
      const segunda = await diagnostico(emisor);
      assert.equal(segunda.flujosLocalesCreados, 2);
      assert.equal(segunda.pistasLocalesActivas, 2, 'solo están activas las pistas de la nueva captura');

      // El enlace anterior ya no sirve.
      const tardio = await espectadorCtx.newPage();
      await tardio.goto(enlace);
      await tardio.waitForSelector('#mensaje-error:not([hidden])');
      assert.match((await tardio.textContent('#mensaje-error')) ?? '', /no existe o ya terminó/);

      await emisor.click('#btn-finalizar');
      await emisor.waitForSelector('#vista-final:not([hidden])');
      assert.equal((await diagnostico(emisor)).pistasLocalesActivas, 0);
  });
});

test('permiso denegado: se informa y no queda ninguna pista', async () => {
  await conEntorno([MEDIOS_SINTETICOS], async ({ base, navegador }) => {
      const contexto = await navegador.newContext();
      const pagina = await contexto.newPage();
      // Deniega cámara y micrófono para este origen mediante el protocolo de depuración de Chromium.
      const sesionPagina = await contexto.newCDPSession(pagina);
      const { targetInfo } = await sesionPagina.send('Target.getTargetInfo');
      const sesionNavegador = await navegador.newBrowserCDPSession();
      for (const name of ['camera', 'microphone']) {
        await sesionNavegador.send('Browser.setPermission', {
          permission: { name },
          setting: 'denied',
          origin: base,
          browserContextId: targetInfo.browserContextId,
        });
      }
      await pagina.goto(`${base}/`);
      await crearYLeerEnlace(pagina);
      await pagina.click('#btn-activar');
      await pagina.waitForSelector('#mensaje-error:not([hidden])', { timeout: 15_000 });
      assert.match((await pagina.textContent('#mensaje-error')) ?? '', /Permiso de cámara o micrófono denegado/);
      assert.equal(await pagina.isEnabled('#btn-activar'), true, 'se puede volver a intentar');
      assert.equal((await diagnostico(pagina)).pistasLocalesActivas, 0);
  });
});

test('API de captura no disponible (simulada): se informa sin fallar', async () => {
  await conEntorno([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO], async ({ base, navegador }) => {
      const contexto = await navegador.newContext();
      await contexto.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, 'mediaDevices', { get: () => undefined, configurable: true });
      });
      const pagina = await contexto.newPage();
      await pagina.goto(`${base}/`);
      await crearYLeerEnlace(pagina);
      await pagina.click('#btn-activar');
      await pagina.waitForSelector('#mensaje-error:not([hidden])');
      assert.match((await pagina.textContent('#mensaje-error')) ?? '', /no ofrece la API de captura/);
      assert.equal((await diagnostico(pagina)).pistasLocalesActivas, 0);
  });
});

test('un enlace con el token de otra sesión no da acceso', async () => {
  await conEntorno([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO], async ({ base, navegador }) => {
      const crear = async () => (await fetch(`${base}/api/sesiones`, { method: 'POST' })).json();
      const a = await crear();
      const b = await crear();
      const pagina = await (await navegador.newContext()).newPage();
      await pagina.goto(`${base}/?s=${a.sesion}#${b.tokenEspectador}`);
      await pagina.waitForSelector('#mensaje-error:not([hidden])');
      assert.match((await pagina.textContent('#mensaje-error')) ?? '', /no es válido para esta sesión/);
  });
});

/**
 * Emisor y espectador en contextos aislados, con audio y video recibidos por WebRTC.
 * @param {import('playwright-core').Browser} navegador
 * @param {string} base
 */
async function emisorYEspectadorConectados(navegador, base) {
  const emisor = await (await navegador.newContext()).newPage();
  const espectador = await (await navegador.newContext()).newPage();
  await emisor.goto(`${base}/`);
  const enlace = await crearYLeerEnlace(emisor);
  await emisor.click('#btn-activar');
  await emisor.waitForFunction(() => document.querySelector('#estado-medios')?.textContent?.includes('activos'));
  await espectador.goto(enlace);
  await espectador.waitForFunction(
    () => /** @type {HTMLVideoElement} */ (document.querySelector('#video-remoto')).srcObject !== null,
    null,
    { timeout: 20_000 },
  );
  if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');
  await esperarDiagnostico(
    espectador,
    (d) => d.conexion === 'connected' && d.medidas.video.framesDecodificados > 10 && d.medidas.audio.paquetesRecibidos > 10,
  );
  assert.equal((await diagnostico(emisor)).conexion, 'connected');
  return { emisor, espectador };
}

/**
 * Intercepta en la página el primer POST de señalización del tipo indicado y lo deja sin respuesta;
 * el resto llega al servidor. Registra también las peticiones de ese tipo que el navegador canceló.
 * @param {import('playwright-core').Page} pagina
 * @param {string} tipo
 */
async function retenerSenal(pagina, tipo) {
  /** @type {import('playwright-core').Route[]} */
  const retenidas = [];
  /** @type {string[]} */
  const canceladas = [];
  const esDelTipo = (/** @type {import('playwright-core').Request} */ p) => {
    try {
      return p.postDataJSON()?.tipo === tipo;
    } catch {
      return false;
    }
  };
  await pagina.route('**/api/sesiones/*/senales', async (ruta) => {
    if (retenidas.length === 0 && esDelTipo(ruta.request())) {
      retenidas.push(ruta);
      return;
    }
    await ruta.continue();
  });
  pagina.on('requestfailed', (p) => {
    if (p.url().endsWith('/senales') && esDelTipo(p)) canceladas.push(p.failure()?.errorText ?? '');
  });
  return { retenidas, canceladas };
}

test('fin con el aviso al servidor retenido y WebRTC conectado: la captura se libera sin esperar a la red', async () => {
  await conEntorno([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO], async ({ app, base, navegador }) => {
    const { emisor, espectador } = await emisorYEspectadorConectados(navegador, base);
    const { retenidas, canceladas } = await retenerSenal(emisor, 'fin');

    await emisor.click('#btn-finalizar');
    // Muy por debajo del límite de envío: la vista final no depende de la respuesta.
    await emisor.waitForSelector('#vista-final:not([hidden])', { timeout: 1500 });
    const fin = await diagnostico(emisor);
    assert.equal(retenidas.length, 1, 'el aviso de fin está retenido');
    assert.equal(fin.pistasLocalesActivas, 0, 'no quedan pistas de captura activas');
    assert.equal(fin.conexion, 'sin-conexion');
    assert.equal(fin.avisoCierre, 'pendiente');
    assert.equal(await emisor.isEnabled('#btn-nueva'), true);
    // El espectador detecta que el emisor se fue; el aviso de fin no llegó al servidor.
    await espectador.waitForFunction(() => document.querySelector('#estado-conexion')?.textContent === 'el emisor se desconectó');
    const espera = await diagnostico(espectador);
    assert.equal(espera.conexion, 'sin-conexion');
    assert.equal(espera.pistasRemotas, 0);

    // Al agotar el límite, el navegador cancela la petición y el emisor no da el fin por confirmado.
    await esperarDiagnostico(emisor, (d) => d.avisoCierre === 'sin-confirmar', LIMITE_ENVIO_MS + 5000);
    assert.equal(canceladas.length, 1, 'la petición retenida se canceló');
    assert.match((await emisor.textContent('#mensaje-error')) ?? '', /no confirmó el fin de la sesión \(tiempo-agotado\)/);
    assert.equal(app.almacen.tamano, 1, 'la sesión sigue en el servidor y no se finge lo contrario');

    // La interfaz permite continuar: una sesión nueva con su propia captura y un fin normal.
    await emisor.click('#btn-nueva');
    await crearYLeerEnlace(emisor);
    assert.equal((await diagnostico(emisor)).avisoCierre, 'sin-aviso');
    await emisor.click('#btn-activar');
    await emisor.waitForFunction(() => document.querySelector('#estado-medios')?.textContent?.includes('activos'));
    assert.equal((await diagnostico(emisor)).pistasLocalesActivas, 2);
    await emisor.click('#btn-finalizar');
    await emisor.waitForSelector('#vista-final:not([hidden])');
    assert.equal((await diagnostico(emisor)).pistasLocalesActivas, 0);
    await esperarDiagnostico(emisor, (d) => d.avisoCierre === 'confirmado');
    assert.equal(app.almacen.tamano, 1, 'solo queda la sesión cuyo fin no llegó');
  });
});

test('salida del espectador con el aviso retenido y WebRTC conectado: cierra sin esperar a la red', async () => {
  await conEntorno([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO], async ({ app, base, navegador }) => {
    const { emisor, espectador } = await emisorYEspectadorConectados(navegador, base);
    const { retenidas, canceladas } = await retenerSenal(espectador, 'salir');

    await espectador.click('#btn-salir');
    await espectador.waitForSelector('#vista-final:not([hidden])', { timeout: 1500 });
    const salida = await diagnostico(espectador);
    assert.equal(retenidas.length, 1, 'el aviso de salida está retenido');
    assert.equal(salida.conexion, 'sin-conexion');
    assert.equal(salida.pistasRemotas, 0);
    assert.equal(salida.avisoCierre, 'pendiente');
    assert.match((await espectador.textContent('#texto-final')) ?? '', /Has salido/);
    // El emisor detecta la salida por el cierre del flujo de eventos.
    await esperarDiagnostico(emisor, (d) => d.conexion === 'sin-conexion');

    await esperarDiagnostico(espectador, (d) => d.avisoCierre === 'sin-confirmar', LIMITE_ENVIO_MS + 5000);
    assert.equal(canceladas.length, 1, 'la petición retenida se canceló');
    assert.match((await espectador.textContent('#mensaje-error')) ?? '', /no confirmó la salida \(tiempo-agotado\)/);

    // El emisor sigue pudiendo finalizar con normalidad.
    await emisor.click('#btn-finalizar');
    await emisor.waitForSelector('#vista-final:not([hidden])');
    assert.equal((await diagnostico(emisor)).pistasLocalesActivas, 0);
    await esperarDiagnostico(emisor, (d) => d.avisoCierre === 'confirmado');
    assert.equal(app.almacen.tamano, 0);
  });
});

test('una captura pendiente de una sesión anterior se detiene y no se incorpora a la sesión en curso', async () => {
  await conEntorno([MEDIOS_SINTETICOS, PERMISO_AUTOMATICO], async ({ base, navegador }) => {
    const contexto = await navegador.newContext();
    // Retrasa la captura sintética hasta que la prueba la libera, y cuenta las pistas de todos los flujos
    // entregados a la página, sin depender del diagnóstico de app.js.
    await contexto.addInitScript(() => {
      const original = MediaDevices.prototype.getUserMedia;
      /** @type {(() => void)[]} */
      const pendientes = [];
      /** @type {MediaStream[]} */
      const entregados = [];
      const control = {
        retener: true,
        pendientes: () => pendientes.length,
        liberar: () => {
          for (const continuar of pendientes.splice(0)) continuar();
        },
        pistasVivas: () =>
          entregados.reduce((n, s) => n + s.getTracks().filter((p) => p.readyState === 'live').length, 0),
      };
      /** @type {any} */ (window).__captura = control;
      /**
       * @this {MediaDevices}
       * @param {MediaStreamConstraints} [restricciones]
       */
      MediaDevices.prototype.getUserMedia = function (restricciones) {
        const pedir = () =>
          original.call(this, restricciones).then((s) => {
            entregados.push(s);
            return s;
          });
        if (!control.retener) return pedir();
        return new Promise((resolve, reject) => pendientes.push(() => void pedir().then(resolve, reject)));
      };
    });
    const pagina = await contexto.newPage();
    const captura = {
      pendientes: () => pagina.evaluate(() => /** @type {any} */ (window).__captura.pendientes()),
      liberar: () => pagina.evaluate(() => /** @type {any} */ (window).__captura.liberar()),
      retener: (/** @type {boolean} */ valor) => pagina.evaluate((v) => void (/** @type {any} */ (window).__captura.retener = v), valor),
      pistasVivas: () => pagina.evaluate(() => /** @type {any} */ (window).__captura.pistasVivas()),
    };
    await pagina.goto(`${base}/`);

    // Sesión A: la captura queda pendiente y A se finaliza. Después se crea B sin activar su captura.
    await crearYLeerEnlace(pagina);
    await pagina.click('#btn-activar');
    await pagina.waitForFunction(() => /** @type {any} */ (window).__captura.pendientes() === 1);
    await pagina.click('#btn-finalizar');
    await pagina.waitForSelector('#vista-final:not([hidden])', { timeout: 1500 });
    await pagina.click('#btn-nueva');
    await crearYLeerEnlace(pagina);
    await captura.liberar();
    await esperarDiagnostico(pagina, (d) => d.capturasDescartadas === 1);
    assert.equal(await captura.pistasVivas(), 0, 'las pistas de la captura de A se detuvieron');
    assert.equal((await diagnostico(pagina)).pistasLocalesActivas, 0);
    assert.equal(await pagina.textContent('#estado-medios'), 'cámara y micrófono sin activar', 'B sigue sin captura');
    assert.equal(await pagina.isEnabled('#btn-activar'), true);
    assert.equal(await pagina.isVisible('#mensaje-error'), false);

    // B activa y finaliza su propia captura: no queda ninguna pista activa de ninguna sesión.
    await captura.retener(false);
    await pagina.click('#btn-activar');
    await pagina.waitForFunction(() => document.querySelector('#estado-medios')?.textContent?.includes('activos'));
    assert.equal(await captura.pistasVivas(), 2, 'solo las pistas de B');
    await pagina.click('#btn-finalizar');
    await pagina.waitForSelector('#vista-final:not([hidden])');
    assert.equal(await captura.pistasVivas(), 0);
    assert.equal((await diagnostico(pagina)).pistasLocalesActivas, 0);

    // Captura que se resuelve después de finalizar, sin crear una sesión nueva.
    await pagina.click('#btn-nueva');
    await crearYLeerEnlace(pagina);
    await captura.retener(true);
    await pagina.click('#btn-activar');
    await pagina.waitForFunction(() => /** @type {any} */ (window).__captura.pendientes() === 1);
    await pagina.click('#btn-finalizar');
    await pagina.waitForSelector('#vista-final:not([hidden])', { timeout: 1500 });
    const textoFinal = await pagina.textContent('#texto-final');
    await captura.liberar();
    await esperarDiagnostico(pagina, (d) => d.capturasDescartadas === 2);
    assert.equal(await captura.pistasVivas(), 0);
    assert.equal(await pagina.isVisible('#vista-final'), true);
    assert.equal(await pagina.textContent('#texto-final'), textoFinal);
    assert.equal(await pagina.isVisible('#mensaje-error'), false);
    assert.equal(await captura.pendientes(), 0);
  });
});
