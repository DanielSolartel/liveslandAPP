// @ts-check
// Continuidad y recuperación manual (LIVE-FASE03-E03) en Chromium con dispositivos SINTÉTICOS de Chromium
// (--use-fake-device-for-media-stream): no es una cámara ni un micrófono físicos, ni un teléfono Android.
// Las interrupciones se provocan solo desde la prueba: cerrando una RTCPeerConnection registrada por un script
// de inicio de la propia prueba, o cerrando en el servidor el flujo de eventos de un participante.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cerrarUltimaConexion,
  conEntorno,
  conexionesCreadas,
  cronologiaDe,
  diagnostico,
  emisorYEspectador,
  esperarDiagnostico,
  esperarRecepcion,
  progresoRecepcion,
  retenerSenal,
} from './entorno.js';

/**
 * Comprueba que un texto exportado no contiene datos sensibles.
 * @param {string} texto
 * @param {string[]} valores
 */
function sinDatosSensibles(texto, valores) {
  for (const v of valores) assert.equal(texto.includes(v), false, `no aparece «${v.slice(0, 16)}…»`);
  assert.equal(/v=0|a=fingerprint|candidate:|\b\d{1,3}(?:\.\d{1,3}){3}\b|https?:\/\/|\.local\b/.test(texto), false, 'sin SDP, candidatos, IP ni URL');
}

/**
 * Espera el fin del reintento y devuelve su resultado.
 * @param {import('playwright-core').Page} pagina
 */
async function esperarFinReintento(pagina, ms = 30_000) {
  const d = await esperarDiagnostico(pagina, (x) => !x.recuperacion.enCurso, ms);
  return d.recuperacion;
}

test('emisión normal y exportación de la cronología en ambos roles', async () => {
  await conEntorno(async ({ base, navegador }) => {
    const { emisor, espectador, sesion, tokenEspectador } = await emisorYEspectador(navegador, base);
    assert.equal((await diagnostico(emisor)).continuidad.estado, 'conectada');
    assert.equal((await diagnostico(espectador)).continuidad.estado, 'conectada');
    const p = await progresoRecepcion(espectador);
    assert.ok(p.fotogramas && p.bytesVideo && p.paquetesAudio && p.reproduccion, JSON.stringify(p));
    for (const [pagina, rol] of /** @type {const} */ ([[emisor, 'emisor'], [espectador, 'espectador']])) {
      const antes = await diagnostico(pagina);
      const { texto, datos } = await cronologiaDe(pagina);
      assert.equal(datos.esquema, 'live-directo-movil/cronologia-continuidad/1');
      assert.equal(datos.rol, rol);
      assert.equal(datos.reloj, 'monotonico');
      assert.equal(datos.capacidades.pagehide, true);
      assert.ok(datos.eventos.some((/** @type {any} */ e) => e.categoria === 'webrtc' && e.evento === 'conexion' && e.estado === 'connected'));
      assert.ok(datos.eventosConservados <= 256);
      sinDatosSensibles(texto, [sesion, tokenEspectador]);
      const despues = await diagnostico(pagina);
      assert.equal(despues.conexion, antes.conexion, 'exportar no cambia la conexión');
      assert.equal(despues.pistasLocalesActivas, antes.pistasLocalesActivas);
    }
    // El informe de diagnóstico de E02 sigue con su esquema.
    await emisor.click('#btn-informe');
    await emisor.waitForFunction(() => /** @type {HTMLTextAreaElement} */ (document.querySelector('#informe-texto')).value !== '');
    assert.equal(JSON.parse(await emisor.inputValue('#informe-texto')).esquema, 'live-directo-movil/informe-diagnostico/2');
    await emisor.click('#btn-finalizar');
    await emisor.waitForSelector('#vista-final:not([hidden])');
    assert.equal((await diagnostico(emisor)).pistasLocalesActivas, 0);
  });
});

test('interrupción WebRTC controlada y recuperación manual del emisor en la misma sesión, con progreso renovado', async () => {
  await conEntorno(async ({ app, base, navegador }) => {
    const { emisor, espectador, sesion } = await emisorYEspectador(navegador, base);
    const expiraEn = app.almacen.obtener(sesion)?.expiraEn;
    await cerrarUltimaConexion(emisor);
    // Sin medios del emisor, el espectador deja de recibir: no se finge continuidad.
    await esperarDiagnostico(emisor, (d) => d.conexion === 'closed' || d.continuidad.estado !== 'conectada');
    assert.equal((await diagnostico(emisor)).continuidad.estado, 'requiere-intervencion');
    const conexionesAntes = await conexionesCreadas(emisor);

    await emisor.click('#btn-reintentar');
    assert.equal(await emisor.isEnabled('#btn-reintentar'), false, 'un solo reintento a la vez');
    if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');
    const r = await esperarFinReintento(emisor);
    assert.equal(r.resultado, 'confirmada', JSON.stringify(r));
    assert.equal(r.detalle, 'envio-confirmado');
    assert.match((await emisor.textContent('#estado-recuperacion')) ?? '', /no puede confirmar que el espectador vea y oiga/);
    assert.equal(await conexionesCreadas(emisor), conexionesAntes + 1, 'una conexión nueva, no varias');

    // Progreso renovado en el espectador, no solo `connected`.
    await esperarRecepcion(espectador);
    const p = await progresoRecepcion(espectador);
    assert.ok(p.fotogramas && p.bytesVideo && p.paquetesAudio && p.reproduccion, JSON.stringify(p));

    const d = await diagnostico(emisor);
    assert.equal(d.flujosLocalesCreados, 1, 'se reutilizó la captura: no se volvió a pedir cámara y micrófono');
    assert.equal(d.pistasLocalesActivas, 2);
    assert.equal(d.continuidad.estado, 'recuperacion-confirmada');
    assert.equal(app.almacen.tamano, 1, 'la misma sesión');
    assert.equal(app.almacen.obtener(sesion)?.expiraEn, expiraEn, 'sin alargar la caducidad');
    const { datos } = await cronologiaDe(emisor);
    assert.ok(datos.eventos.some((/** @type {any} */ e) => e.categoria === 'recuperacion' && e.evento === 'exito'));
  });
});

test('interrupción WebRTC en el espectador: su reintento pide una oferta y el emisor renegocia sin capturar de nuevo', async () => {
  await conEntorno(async ({ app, base, navegador }) => {
    const { emisor, espectador } = await emisorYEspectador(navegador, base);
    await espectador.waitForTimeout(2200); // intervalo mínimo entre ofertas del emisor
    await cerrarUltimaConexion(espectador);
    await espectador.click('#btn-reintentar');
    if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');
    const r = await esperarFinReintento(espectador);
    assert.equal(r.resultado, 'confirmada', JSON.stringify(r));
    assert.equal(r.detalle, 'recepcion-confirmada');
    assert.match((await espectador.textContent('#estado-recuperacion')) ?? '', /Confirma tú que se ve y se oye/);
    await esperarRecepcion(espectador);
    const p = await progresoRecepcion(espectador);
    assert.ok(p.fotogramas && p.bytesVideo && p.paquetesAudio && p.reproduccion, JSON.stringify(p));
    const e = await diagnostico(emisor);
    assert.equal(e.flujosLocalesCreados, 1);
    assert.equal(e.negociaciones, 2, 'el emisor creó una sola negociación nueva');
    assert.equal(app.almacen.tamano, 1);
    const { datos } = await cronologiaDe(emisor);
    assert.ok(datos.eventos.some((/** @type {any} */ x) => x.evento === 'solicitud-oferta-recibida'));
  });
});

test('interrupción de la señalización y reapertura controlada cuando el servidor permite continuar', async () => {
  await conEntorno(async ({ app, base, navegador }) => {
    const { emisor, espectador, sesion } = await emisorYEspectador(navegador, base);
    // El servidor cierra el flujo de eventos del emisor sin enviar «fin»: para la página es un EOF inesperado.
    app.almacen.obtener(sesion)?.canales.emisor?.cerrar();
    await esperarDiagnostico(emisor, (d) => d.canalDetalle === 'interrumpida');
    const interrumpido = await diagnostico(emisor);
    assert.equal(interrumpido.continuidad.estado, 'requiere-intervencion');
    assert.equal(interrumpido.continuidad.motivo, 'canal-perdido');
    assert.equal(interrumpido.terminado, false, 'una interrupción no es un cierre definitivo');
    assert.match((await emisor.textContent('#mensaje-error')) ?? '', /Reintentar conexión/);
    // El espectador sabe que el emisor perdió la señalización (no que finalizó).
    await esperarDiagnostico(espectador, (d) => d.continuidad.motivo === 'participante-desconectado');

    await emisor.click('#btn-reintentar');
    if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');
    const r = await esperarFinReintento(emisor);
    assert.equal(r.resultado, 'confirmada', JSON.stringify(r));
    await esperarRecepcion(espectador);
    const p = await progresoRecepcion(espectador);
    assert.ok(p.fotogramas && p.bytesVideo && p.paquetesAudio && p.reproduccion, JSON.stringify(p));
    assert.equal(app.almacen.tamano, 1);
    assert.ok(app.almacen.obtener(sesion)?.canales.emisor, 'un canal del emisor registrado de nuevo');
    assert.equal((await diagnostico(emisor)).flujosLocalesCreados, 1);
  });
});

test('finalizar durante una recuperación pendiente: la emisión no se reactiva', async () => {
  await conEntorno(async ({ app, base, navegador }) => {
    const { emisor, espectador } = await emisorYEspectador(navegador, base);
    await cerrarUltimaConexion(emisor);
    const retenidas = await retenerSenal(emisor, 'oferta');
    await emisor.click('#btn-reintentar');
    await esperarDiagnostico(emisor, () => retenidas.length === 1, 10_000);
    assert.equal((await diagnostico(emisor)).recuperacion.enCurso, true);
    await emisor.click('#btn-finalizar');
    await emisor.waitForSelector('#vista-final:not([hidden])', { timeout: 1500 });
    const fin = await diagnostico(emisor);
    assert.equal(fin.pistasLocalesActivas, 0);
    assert.equal(fin.conexion, 'sin-conexion');
    // La oferta retenida del reintento llega ahora al servidor: la sesión ya no existe y nada se reactiva.
    await retenidas[0].continue();
    await emisor.waitForTimeout(1500);
    const despues = await diagnostico(emisor);
    assert.equal(despues.terminado, true);
    assert.equal(despues.conexion, 'sin-conexion');
    assert.equal(despues.pistasLocalesActivas, 0);
    assert.equal(despues.recuperacion.resultado, 'ninguna', 'no se declara ninguna recuperación');
    assert.equal(despues.continuidad.estado, 'finalizada');
    await espectador.waitForSelector('#vista-final:not([hidden])');
    assert.equal(app.almacen.tamano, 0);
    const { datos } = await cronologiaDe(emisor);
    assert.ok(datos.eventos.some((/** @type {any} */ e) => e.categoria === 'recuperacion' && e.evento === 'cancelada'));
  });
});

test('autenticación, privacidad y recursos se conservan tras una recuperación', async () => {
  await conEntorno(async ({ app, base, navegador }) => {
    const { emisor, espectador, sesion, tokenEspectador } = await emisorYEspectador(navegador, base);
    await cerrarUltimaConexion(emisor);
    await emisor.click('#btn-reintentar');
    if (await espectador.isVisible('#btn-reproducir')) await espectador.click('#btn-reproducir');
    assert.equal((await esperarFinReintento(emisor)).resultado, 'confirmada');
    await esperarRecepcion(espectador);

    // El rol ocupado sigue rechazado: nadie puede abrir un segundo canal del espectador ni con otro token.
    const abrirEventos = (/** @type {string} */ token) =>
      fetch(`${base}/api/sesiones/${sesion}/eventos`, { headers: { Authorization: `Bearer ${token}` } });
    const duplicado = await abrirEventos(tokenEspectador);
    assert.equal(duplicado.status, 409);
    await duplicado.body?.cancel();
    const ajeno = await abrirEventos('x'.repeat(43));
    assert.equal(ajeno.status, 403);
    await ajeno.body?.cancel();
    assert.equal((await diagnostico(espectador)).conexion, 'connected', 'el espectador conectado no fue expulsado');

    // Las exportaciones no contienen credenciales, SDP, candidatos ni direcciones.
    for (const pagina of [emisor, espectador]) {
      const { texto } = await cronologiaDe(pagina);
      sinDatosSensibles(texto, [sesion, tokenEspectador]);
      await pagina.click('#btn-informe');
      await pagina.waitForFunction(() => /** @type {HTMLTextAreaElement} */ (document.querySelector('#informe-texto')).value !== '');
      sinDatosSensibles(await pagina.inputValue('#informe-texto'), [sesion, tokenEspectador]);
    }
    // Nada se guardó en el almacenamiento del navegador.
    for (const pagina of [emisor, espectador]) {
      const almacenado = await pagina.evaluate(() => ({ local: localStorage.length, sesion: sessionStorage.length, cookies: document.cookie }));
      assert.deepEqual(almacenado, { local: 0, sesion: 0, cookies: '' });
    }
    // Recursos: una sola captura y, al finalizar, ninguna pista ni conexión.
    assert.equal((await diagnostico(emisor)).flujosLocalesCreados, 1);
    await emisor.click('#btn-finalizar');
    await emisor.waitForSelector('#vista-final:not([hidden])');
    const fin = await diagnostico(emisor);
    assert.equal(fin.pistasLocalesActivas, 0);
    assert.equal(fin.conexion, 'sin-conexion');
    await espectador.waitForSelector('#vista-final:not([hidden])');
    assert.equal((await diagnostico(espectador)).pistasRemotas, 0);
    assert.equal(app.almacen.tamano, 0);
  });
});
