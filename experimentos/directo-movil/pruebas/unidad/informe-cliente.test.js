// @ts-check
// Informe de diagnóstico en la página (public/app.js) con DOBLES CONTROLADOS, contra el servidor real:
// disponible antes, durante y después de la emisión y para los dos roles; sin efectos sobre sesiones, capturas
// ni conexiones; copia solo por acción explícita y alternativa manual. No usa navegador ni dispositivos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SDP, conServidor, crearSesionEnPagina, cuenta, emisorConEspectador, esperar, pausa, ultimaNegociacion } from './ayudas-cliente.js';
import { LIMITE_ESTADISTICAS_INFORME_MS } from '../../public/medios.js';
import { SENUELOS, fetchReal } from './navegador-simulado.js';

/** @typedef {import('./navegador-simulado.js').instalarNavegador extends (...a: any) => infer R ? R : never} Pagina */

/**
 * Pulsa «Generar informe» y devuelve el informe mostrado, ya interpretado, y su texto.
 * @param {Pagina} pagina
 */
async function informe(pagina) {
  /** @type {any} */ (pagina.elemento('informe-texto')).value = '';
  pagina.pulsar('btn-informe');
  await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe generado');
  const texto = pagina.valor('informe-texto');
  return { texto, datos: JSON.parse(texto) };
}

/**
 * Valores que ningún informe puede contener: señuelos, datos de la sesión, SDP, candidatos y enlaces.
 * @param {string} texto
 * @param {string[]} secretos
 */
function sinDatosSensibles(texto, secretos) {
  for (const prohibido of [
    ...Object.values(SENUELOS),
    ...secretos,
    '203.0.113',
    'candidate',
    'v=0',
    'http://',
    'https://',
    'deviceId',
    'groupId',
    '?s=',
  ]) {
    assert.equal(texto.includes(prohibido), false, `el informe no debe contener «${prohibido}»`);
  }
}

/** @param {ReturnType<typeof import('../../src/servidor.js').crearServidor>} app */
function secretosDelServidor(app) {
  return [...app.almacen.sesiones.values()].flatMap((s) => [s.id, s.tokens.emisor.toString(), s.tokens.espectador.toString()]);
}

test('emisor: informe antes de crear la sesión, con la sesión creada, durante la emisión y después de finalizar', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const textos = [];

    // Antes de crear la sesión: sin rol, sin captura, sin conexión; no crea nada.
    let { texto, datos } = await informe(pagina);
    textos.push(texto);
    assert.equal(datos.esquema, 'live-directo-movil/informe-diagnostico/2');
    assert.match(datos.generadoEn, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(datos.rol, null);
    assert.equal(datos.captura.estado, 'sin-sesion');
    assert.equal(datos.metricas.disponible, false);
    assert.equal(datos.metricas.motivo, 'sin-conexion');
    assert.equal(datos.webrtc.conexion, 'sin-conexion');
    assert.equal(datos.navegador.contextoSeguro, true);
    assert.deepEqual(datos.navegador.apis, { getUserMedia: true, rtcPeerConnection: true, getStats: true, portapapeles: true });
    assert.equal(datos.navegador.visibilidad, 'visible');
    assert.equal(datos.navegador.familia, 'chrome');
    assert.equal(datos.navegador.version, 158);
    assert.equal(datos.navegador.plataforma, 'android');
    assert.ok(datos.noDisponible.includes('rol'));
    assert.equal(app.almacen.tamano, 0, 'generar el informe no crea sesiones');

    // Con la sesión creada y la captura sin activar.
    const sesion = await crearSesionEnPagina(pagina);
    ({ texto, datos } = await informe(pagina));
    textos.push(texto);
    assert.equal(datos.rol, 'emisor');
    assert.equal(datos.sesion.canal, 'conectada');
    assert.equal(datos.captura.estado, 'sin-activar');
    assert.equal(datos.pistas.localesActivas, 0);
    assert.equal(pagina.capturas.length + pagina.flujos.length, 0, 'generar el informe no inicia ninguna captura');

    // Durante la emisión: captura activa, conexión y métricas.
    pagina.capturaAutomatica(true);
    pagina.pulsar('btn-activar');
    await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura activa');
    const espectador = participante(sesion.sesion, sesion.tokenEspectador);
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta'), 3000, 'oferta recibida');
    // E03: la respuesta lleva el identificador de negociación de la oferta, como la que envía la página real.
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: ultimaNegociacion(espectador) })).ok, true);
    const pc = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc.remoteDescription, 3000, 'respuesta aplicada');
    pc.conectar();
    ({ texto, datos } = await informe(pagina));
    textos.push(texto);
    assert.equal(datos.captura.estado, 'activa');
    assert.equal(datos.captura.vistaPreviaSilenciada, true);
    assert.equal(datos.pistas.localesActivas, 2);
    assert.equal(datos.pistas.flujosLocalesCreados, 1);
    assert.deepEqual(datos.pistas.locales.map((/** @type {any} */ p) => [p.tipo, p.estado]), [['video', 'live'], ['audio', 'live']]);
    assert.deepEqual(datos.pistas.locales[0].ajustes, { ancho: 1280, alto: 720, fotogramasPorSegundo: 30, orientacionCamara: 'environment' });
    assert.deepEqual(datos.pistas.locales[1].ajustes, { frecuenciaMuestreo: 48000, canales: 2 });
    assert.equal(datos.webrtc.conexion, 'connected');
    assert.equal(datos.webrtc.ice, 'connected');
    assert.equal(datos.webrtc.senalizacion, 'stable');
    assert.equal(datos.metricas.disponible, true);
    assert.equal(datos.metricas.video.bytesEnviados, 6000);
    assert.equal(datos.metricas.audio.paquetesEnviados, 55);
    assert.equal(datos.metricas.video.bytesRecibidos, 5000);
    assert.equal(datos.metricas.audio.jitterMs, 4);
    assert.equal(datos.metricas.rttMs, 12.5);
    assert.equal(datos.finalizacion.terminada, false);
    assert.equal(datos.finalizacion.recursosLiberados, 'no-aplica');

    // Después de finalizar: recursos liberados, sin conexión ni métricas.
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'vista final');
    await esperar(async () => (await pagina.diagnostico()).avisoCierre === 'confirmado', 3000, 'fin confirmado');
    ({ texto, datos } = await informe(pagina));
    textos.push(texto);
    assert.equal(datos.captura.estado, 'liberada');
    assert.equal(datos.pistas.localesActivas, 0);
    assert.deepEqual(datos.pistas.locales, []);
    assert.equal(datos.webrtc.conexion, 'sin-conexion');
    assert.equal(datos.metricas.disponible, false);
    assert.equal(datos.metricas.motivo, 'sin-conexion');
    assert.equal(datos.finalizacion.terminada, true);
    assert.equal(datos.finalizacion.avisoCierre, 'confirmado');
    assert.equal(datos.finalizacion.conexionAbierta, false);
    assert.equal(datos.finalizacion.recursosLiberados, 'si');
    assert.equal(datos.sesion.canal, 'cerrada');

    // Ningún informe contiene tokens, identificadores de sesión, enlaces, SDP, candidatos ni datos de dispositivo.
    // Los identificadores se leen del servidor mientras la sesión existe; aquí ya terminó, así que se usan los del enlace.
    for (const t of textos) sinDatosSensibles(t, [sesion.sesion, sesion.tokenEspectador]);
  });
});

test('los tokens y el identificador de sesión del servidor no aparecen en el informe durante la emisión', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    await emisorConEspectador(pagina, participante);
    const secretos = secretosDelServidor(app);
    assert.equal(secretos.length, 3);
    const { texto } = await informe(pagina);
    sinDatosSensibles(texto, secretos);
  });
});

test('espectador: informe antes de recibir, con medios recibidos y después de salir', async () => {
  await conServidor(async ({ app, base, abrir, participante }) => {
    const creada = await (await fetchReal(`${base}/api/sesiones`, { method: 'POST' })).json();
    const emisor = participante(creada.sesion, creada.tokenEmisor);
    await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor conectado');
    const pagina = await abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
    await esperar(() => pagina.texto('estado-senal') === 'conectada', 3000, 'canal del espectador conectado');

    let { texto, datos } = await informe(pagina);
    const textos = [texto];
    assert.equal(datos.rol, 'espectador');
    assert.equal(datos.captura.estado, 'no-aplica');
    assert.equal(datos.reproduccion.estado, 'sin-flujo');
    assert.equal(datos.webrtc.conexion, 'sin-conexion');
    assert.equal(datos.sesion.canal, 'conectada');

    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP })).ok, true);
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta'), 3000, 'respuesta del espectador');
    const pc = /** @type {any} */ (pagina.conexiones.at(-1));
    pc.recibirMedios();
    pc.conectar();
    const video = /** @type {any} */ (pagina.elemento('video-remoto'));
    video.videoWidth = 640;
    video.videoHeight = 480;
    await esperar(() => !video.paused, 1000, 'reproducción iniciada');
    ({ texto, datos } = await informe(pagina));
    textos.push(texto);
    assert.equal(datos.pistas.remotasActivas, 2);
    assert.deepEqual(datos.pistas.remotas.map((/** @type {any} */ p) => p.tipo), ['video', 'audio']);
    assert.equal(datos.reproduccion.estado, 'reproduciendo');
    assert.equal(datos.reproduccion.ancho, 640);
    assert.equal(datos.reproduccion.alto, 480);
    assert.equal(datos.webrtc.conexion, 'connected');
    assert.equal(datos.metricas.disponible, true);
    assert.equal(datos.metricas.video.fotogramasDecodificados, 30);
    assert.equal(datos.metricas.audio.paquetesRecibidos, 50);
    assert.equal(datos.finalizacion.recursosLiberados, 'no-aplica');
    sinDatosSensibles(texto, secretosDelServidor(app));

    pagina.pulsar('btn-salir');
    await esperar(() => pagina.visible('vista-final'), 1000, 'vista final');
    ({ texto, datos } = await informe(pagina));
    textos.push(texto);
    assert.equal(datos.pistas.remotasActivas, 0);
    assert.equal(datos.reproduccion.estado, 'sin-flujo');
    assert.equal(datos.webrtc.conexion, 'sin-conexion');
    assert.equal(datos.finalizacion.terminada, true);
    assert.equal(datos.finalizacion.recursosLiberados, 'si');
    for (const t of textos) sinDatosSensibles(t, [creada.sesion, creada.tokenEmisor, creada.tokenEspectador]);
  });
});

test('generar o copiar el informe no cambia sesiones, pistas, conexiones, capturas ni la interfaz', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    await emisorConEspectador(pagina, participante);
    const pc = /** @type {any} */ (pagina.conexiones.at(-1));
    /** Todo lo observable que el informe no debe tocar. */
    const instantanea = async () => ({
      diagnostico: await pagina.diagnostico(),
      sesiones: app.almacen.tamano,
      conexiones: pagina.conexiones.length,
      conexionCerrada: pc.cerrada,
      estadoConexion: pc.connectionState,
      flujos: pagina.flujos.length,
      capturasPendientes: pagina.capturas.length,
      pistasVivas: pagina.pistasVivas(),
      peticionesRetenidas: pagina.retenidas.length,
      textos: ['estado-rol', 'estado-senal', 'estado-conexion', 'estado-ice', 'estado-medios', 'mensaje-error'].map((id) => pagina.texto(id)),
      botones: ['btn-activar', 'btn-finalizar', 'btn-crear', 'btn-copiar'].map((id) => pagina.habilitado(id)),
      vistas: ['vista-inicio', 'vista-emisor', 'vista-espectador', 'vista-final'].map((id) => pagina.visible(id)),
      enlace: pagina.valor('enlace-espectador'),
    });
    const antes = await instantanea();
    await informe(pagina);
    await informe(pagina);
    pagina.pulsar('btn-copiar-informe');
    await esperar(() => pagina.copiados.length === 1, 3000, 'copia');
    assert.deepEqual(await instantanea(), antes);

    // Con una captura pendiente tampoco se pide otra ni se resuelve la pendiente.
    const otra = await abrir('/');
    await crearSesionEnPagina(otra);
    otra.pulsar('btn-activar');
    assert.equal(otra.capturas.length, 1);
    const { datos } = await informe(otra);
    assert.equal(datos.captura.estado, 'solicitando');
    assert.equal(otra.capturas.length, 1);
    assert.equal(otra.flujos.length, 0);
    assert.equal(otra.pistasVivas(), 0);
  });
});

test('copiar: copia el informe generado solo por una acción explícita y lo declara', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    await informe(pagina);
    await pausa(30);
    assert.equal(pagina.copiados.length, 0, 'generar el informe no lo copia');
    assert.equal(pagina.texto('estado-informe').includes('copiado'), false);

    pagina.pulsar('btn-copiar-informe');
    await esperar(() => pagina.copiados.length === 1, 3000, 'informe copiado');
    assert.equal(pagina.copiados[0], pagina.valor('informe-texto'), 'se copia el mismo texto que se muestra');
    assert.equal(JSON.parse(pagina.copiados[0]).esquema, 'live-directo-movil/informe-diagnostico/2');
    assert.equal(pagina.texto('estado-informe'), 'Informe copiado al portapapeles.');
    assert.equal(/** @type {any} */ (pagina.elemento('informe-texto')).seleccionado, false);
  });
});

test('copiar: si el portapapeles rechaza o no existe, no se afirma la copia y el informe queda seleccionado', async () => {
  await conServidor(async ({ abrir }) => {
    for (const [modo, aviso] of /** @type {const} */ ([
      ['rechaza', /rechazó la copia automática/],
      ['ausente', /no permite copiar automáticamente/],
    ])) {
      const pagina = await abrir('/');
      pagina.configurarPortapapeles(modo);
      pagina.pulsar('btn-copiar-informe');
      await esperar(() => aviso.test(pagina.texto('estado-informe')), 3000, `aviso de copia (${modo})`);
      assert.equal(pagina.copiados.length, 0);
      assert.equal(pagina.texto('estado-informe').includes('Informe copiado'), false);
      assert.equal(pagina.visible('informe-texto'), true, 'el informe se muestra para copiarlo a mano');
      const area = /** @type {any} */ (pagina.elemento('informe-texto'));
      assert.equal(area.seleccionado, true, 'el informe queda seleccionado');
      assert.equal(area.enfocado, true);
      assert.equal(JSON.parse(pagina.valor('informe-texto')).navegador.apis.portapapeles, modo === 'rechaza');
      assert.equal(pagina.valor('informe-texto').includes(SENUELOS.error), false, 'no se copia el mensaje de error del navegador');
      pagina.restaurar();
    }
  });
});

test('APIs y métricas no disponibles: el informe lo declara y no falla', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);

    pc.fallaEstadisticas = true;
    let { texto, datos } = await informe(pagina);
    assert.equal(datos.metricas.disponible, false);
    assert.equal(datos.metricas.motivo, 'error');
    assert.equal(texto.includes(SENUELOS.error), false);
    assert.equal(datos.webrtc.conexion, 'connected', 'el resto del informe se genera igualmente');

    pc.fallaEstadisticas = false;
    pc.getStats = undefined;
    ({ datos } = await informe(pagina));
    assert.equal(datos.metricas.motivo, 'api-ausente');
    assert.equal(datos.navegador.apis.getStats, true, 'la API se mide en el prototipo del navegador, no en esta conexión');

    // Navegador sin captura, sin portapapeles y sin datos del agente.
    pagina.configurarPortapapeles('ausente');
    pagina.navegador.mediaDevices = undefined;
    pagina.navegador.userAgent = /** @type {any} */ (undefined);
    pagina.navegador.platform = /** @type {any} */ (undefined);
    ({ datos } = await informe(pagina));
    assert.equal(datos.navegador.apis.getUserMedia, false);
    assert.equal(datos.navegador.apis.portapapeles, false);
    assert.equal(datos.navegador.familia, null);
    assert.equal(datos.navegador.version, null);
    assert.equal(datos.navegador.plataforma, null);
    for (const ruta of ['navegador.familia', 'navegador.version', 'navegador.plataforma']) {
      assert.ok(datos.noDisponible.includes(ruta), ruta);
    }
  });
});

test('errores: constan solo sus categorías, sin mensajes ni detalles', async () => {
  await conServidor(async ({ abrir }) => {
    // Permiso de captura denegado.
    const pagina = await abrir('/');
    await crearSesionEnPagina(pagina);
    pagina.pulsar('btn-activar');
    pagina.capturas[0].rechazar('NotAllowedError');
    await esperar(() => pagina.visible('mensaje-error'), 3000, 'error de captura');
    let { texto, datos } = await informe(pagina);
    assert.equal(datos.captura.estado, 'sin-captura');
    assert.equal(datos.captura.ultimoError, 'permiso-denegado');
    assert.deepEqual(datos.errores, { total: 1, categorias: ['captura-permiso-denegado'] });
    assert.equal(texto.includes('Permiso de cámara'), false, 'el mensaje mostrado al usuario no se copia');
    assert.equal(datos.pistas.localesActivas, 0);

    // Enlace de espectador incompleto.
    const otra = await abrir('/?s=corto#x');
    ({ texto, datos } = await informe(otra));
    assert.equal(datos.rol, 'espectador');
    assert.equal(datos.sesion.canal, 'no-iniciada');
    assert.deepEqual(datos.errores.categorias, ['enlace-incompleto']);
    assert.equal(texto.includes('corto'), false);
  });
});

// ---------- E02-R01-01: el informe describe un único instante y no se bloquea ni se pisa ----------

/** @param {Pagina} pagina */
const vaciarInforme = (pagina) => void (/** @type {any} */ (pagina.elemento('informe-texto')).value = '');

/** @param {Pagina} pagina */
const leerInforme = (pagina) => JSON.parse(pagina.valor('informe-texto'));

/** @param {number} bytes */
const estadisticasConBytes = (bytes) => [{ type: 'outbound-rtp', kind: 'video', bytesSent: bytes }];

test('E02-R01-01 A: finalizar mientras getStats está pendiente no mezcla el estado de antes y de después', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 1, 3000, 'getStats pendiente');
    await pausa(15);
    const antesDeFinalizar = Date.now();
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'sesión finalizada');
    assert.equal(pc.cerrada, true);
    await pausa(15);
    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(123456));
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe mostrado');

    // El informe describe un único instante, el de la solicitud, anterior al fin de la sesión.
    const d = leerInforme(pagina);
    assert.ok(Date.parse(d.generadoEn) <= antesDeFinalizar, 'generadoEn es el instante de la solicitud');
    assert.equal(d.sesion.terminada, false);
    assert.equal(d.sesion.canal, 'conectada');
    assert.equal(d.finalizacion.terminada, false);
    assert.equal(d.finalizacion.conexionAbierta, true);
    assert.equal(d.finalizacion.recursosLiberados, 'no-aplica');
    assert.equal(d.webrtc.conexion, 'connected');
    assert.equal(d.pistas.localesActivas, 2);
    // Las estadísticas llegaron con la conexión ya cerrada: se descartan, no se mezclan.
    assert.equal(d.metricas.disponible, false);
    assert.equal(d.metricas.motivo, 'descartadas');
    assert.equal(d.metricas.video, null);
    assert.equal(pagina.valor('informe-texto').includes('123456'), false);

    // Un informe nuevo describe el estado final, también coherente.
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe posterior');
    const fin = leerInforme(pagina);
    assert.equal(fin.finalizacion.terminada, true);
    assert.equal(fin.finalizacion.conexionAbierta, false);
    assert.equal(fin.finalizacion.recursosLiberados, 'si');
    assert.equal(fin.webrtc.conexion, 'sin-conexion');
    assert.equal(fin.metricas.motivo, 'sin-conexion');
  });
});

test('E02-R01-01 A2: si la conexión se sustituye o se cierra sin terminar la sesión, las estadísticas antiguas se descartan', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc, espectador } = await emisorConEspectador(pagina, participante);
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 1, 3000, 'getStats pendiente');
    // El espectador se va: el emisor cierra esa conexión, pero su sesión sigue.
    espectador.canal.cerrar();
    await esperar(() => pc.cerrada, 3000, 'conexión cerrada por la salida del espectador');
    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(123456));
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe mostrado');
    const d = leerInforme(pagina);
    assert.equal(d.metricas.motivo, 'descartadas');
    assert.equal(d.webrtc.conexion, 'connected', 'el informe describe el instante de la solicitud');
    assert.equal(d.finalizacion.conexionAbierta, true);
    assert.equal(d.finalizacion.terminada, false);
    assert.equal(pagina.valor('informe-texto').includes('123456'), false);
  });
});

test('E02-R01-01 B: estadísticas de una sesión anterior no sobrescriben el informe de la sesión nueva', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 1, 3000, 'getStats de la sesión A pendiente');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'sesión A finalizada');
    pagina.pulsar('btn-nueva');
    await crearSesionEnPagina(pagina);

    // Informe de la sesión B, sin conexión.
    pagina.pulsar('btn-informe');
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe de B');
    const textoB = pagina.valor('informe-texto');
    const b = JSON.parse(textoB);
    assert.equal(b.rol, 'emisor');
    assert.equal(b.captura.estado, 'sin-activar');
    assert.equal(b.sesion.terminada, false);
    assert.equal(b.metricas.motivo, 'sin-conexion');

    // Llegan tarde las estadísticas de A: no tocan el informe mostrado ni la sesión B.
    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(123456));
    await pausa(60);
    assert.equal(pagina.valor('informe-texto'), textoB);
    assert.equal(pagina.texto('estado-informe').includes('copiado'), false);
    assert.equal(pagina.visible('vista-emisor'), true);
    assert.equal(pagina.texto('estado-senal'), 'conectada');
  });
});

test('E02-R01-01 C: dos solicitudes que se resuelven en orden inverso dejan el informe de la más reciente', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 2, 3000, 'dos getStats pendientes');

    pc.estadisticasPendientes[1].resolver(estadisticasConBytes(222));
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe de la segunda solicitud');
    const textoReciente = pagina.valor('informe-texto');
    assert.equal(JSON.parse(textoReciente).metricas.video.bytesEnviados, 222);

    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(111));
    await pausa(60);
    assert.equal(pagina.valor('informe-texto'), textoReciente, 'la solicitud antigua no pisa la reciente');
  });
});

test('E02-R01-01 C2: una copia solicitada y superada por otra solicitud no copia un informe obsoleto', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-copiar-informe');
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 2, 3000, 'dos getStats pendientes');

    pc.estadisticasPendientes[1].resolver(estadisticasConBytes(222));
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe de la solicitud reciente');
    const textoReciente = pagina.valor('informe-texto');
    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(111));
    await pausa(60);
    assert.equal(pagina.valor('informe-texto'), textoReciente);
    assert.equal(pagina.copiados.length, 0, 'no se copia un informe obsoleto');
    assert.equal(pagina.texto('estado-informe').includes('Informe copiado'), false);
  });
});

test('E02-R01-01 D: getStats que no se resuelve o que rechaza no bloquea el informe', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);
    const antes = await pagina.diagnostico();

    // No se resuelve nunca: el informe se genera al agotarse el límite, con el resto de datos.
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    const inicio = Date.now();
    pagina.pulsar('btn-informe');
    await esperar(() => pagina.valor('informe-texto') !== '', LIMITE_ESTADISTICAS_INFORME_MS + 2000, 'informe tras el límite');
    const espera = Date.now() - inicio;
    assert.ok(espera >= LIMITE_ESTADISTICAS_INFORME_MS - 100, `no antes del límite (${espera} ms)`);
    assert.ok(espera < LIMITE_ESTADISTICAS_INFORME_MS + 1500, `no mucho después del límite (${espera} ms)`);
    const d = leerInforme(pagina);
    assert.equal(d.metricas.disponible, false);
    assert.equal(d.metricas.motivo, 'tiempo-agotado');
    assert.equal(d.webrtc.conexion, 'connected');
    assert.equal(d.pistas.localesActivas, 2);

    // Si responde cuando ya expiró el límite, nada cambia.
    const texto = pagina.valor('informe-texto');
    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(123456));
    await pausa(60);
    assert.equal(pagina.valor('informe-texto'), texto);

    // Rechaza: el informe lo declara.
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 2, 3000, 'segundo getStats pendiente');
    pc.estadisticasPendientes[1].rechazar();
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe tras el rechazo');
    assert.equal(leerInforme(pagina).metricas.motivo, 'error');
    assert.equal(pagina.valor('informe-texto').includes(SENUELOS.error), false);

    // La página sigue usable y la conexión intacta.
    pc.retenerEstadisticas = false;
    vaciarInforme(pagina);
    pagina.pulsar('btn-informe');
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe normal');
    assert.equal(leerInforme(pagina).metricas.disponible, true);
    assert.deepEqual(await pagina.diagnostico(), antes);
    assert.equal(pc.cerrada, false);
  });
});

// ---------- E02-R01-02: ninguna cadena arbitraria del navegador llega al informe ----------

test('E02-R01-02: del navegador solo salen familia, versión y plataforma de listas cerradas', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');

    // Cadenas con valores señuelo dentro del agente y de la plataforma.
    pagina.navegador.userAgent = 'Mozilla/5.0 Chrome/158.0.0.0 TOKEN-SENUELO http://203.0.113.7/identificador';
    pagina.navegador.platform = 'Android ID-SENUELO';
    pagina.navegador.userAgentData = { platform: 'Android ID-SENUELO-2', brands: [{ brand: 'SENUELO-MARCA', version: '9' }] };
    let { texto, datos } = await informe(pagina);
    assert.deepEqual([datos.navegador.familia, datos.navegador.version, datos.navegador.plataforma], ['chrome', 158, 'android']);
    for (const prohibido of ['SENUELO', 'TOKEN', '203.0.113', 'http', 'identificador', 'Mozilla']) {
      assert.equal(texto.includes(prohibido), false, `el informe no debe contener «${prohibido}»`);
    }

    // No reconocido: no se conserva la cadena y consta como no disponible.
    pagina.navegador.userAgent = 'SENUELO-AGENTE-DESCONOCIDO';
    pagina.navegador.platform = 'SENUELO-PLATAFORMA';
    pagina.navegador.userAgentData = undefined;
    ({ texto, datos } = await informe(pagina));
    assert.deepEqual([datos.navegador.familia, datos.navegador.version, datos.navegador.plataforma], [null, null, null]);
    for (const ruta of ['navegador.familia', 'navegador.version', 'navegador.plataforma']) assert.ok(datos.noDisponible.includes(ruta), ruta);
    assert.equal(texto.includes('SENUELO'), false);

    // Datos válidos: Edge en Windows.
    pagina.navegador.userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36 Edg/158.0.3000.1';
    pagina.navegador.platform = 'Win32';
    pagina.navegador.userAgentData = { platform: 'Windows', brands: [{ brand: 'SENUELO-MARCA', version: '9' }] };
    ({ texto, datos } = await informe(pagina));
    assert.deepEqual([datos.navegador.familia, datos.navegador.version, datos.navegador.plataforma], ['edge', 158, 'windows']);
    assert.equal(texto.includes('SENUELO'), false);
  });
});

// ---------- E02-R02-01: la copia al portapapeles no se pisa ni afirma lo que no copió ----------

/** Agente de usuario que distingue los informes A y B por su versión de navegador. */
const agenteVersion = (/** @type {number} */ v) => `Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 Chrome/${v}.0.0.0 Mobile Safari/537.36`;

/** @param {Pagina} pagina */
const versionMostrada = (pagina) => leerInforme(pagina).navegador.version;

/**
 * Pide copiar el informe con el navegador «versión» y espera a que `writeText` quede pendiente.
 * @param {Pagina} pagina
 * @param {number} version
 */
async function copiarVersion(pagina, version) {
  const antes = pagina.escrituras.length;
  pagina.navegador.userAgent = agenteVersion(version);
  pagina.pulsar('btn-copiar-informe');
  await esperar(() => pagina.escrituras.length === antes + 1, 3000, `escritura de la versión ${version} pendiente`);
}

/** Genera un informe con el navegador «versión» y espera a que se muestre. @param {Pagina} pagina @param {number} version */
async function generarVersion(pagina, version) {
  pagina.navegador.userAgent = agenteVersion(version);
  pagina.pulsar('btn-informe');
  await esperar(() => pagina.valor('informe-texto') !== '' && versionMostrada(pagina) === version, 3000, `informe de la versión ${version}`);
}

test('E02-R02-01 A: la copia anterior que termina bien no se presenta como copia del informe reciente', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    pagina.configurarPortapapeles('retiene');
    await copiarVersion(pagina, 111); // A: escritura pendiente
    await generarVersion(pagina, 222); // B: se genera mientras A sigue pendiente
    const estadoB = pagina.texto('estado-informe');
    assert.equal(estadoB.includes('copiado'), false);

    pagina.escrituras[0].resolver();
    await pausa(60);
    assert.equal(versionMostrada(pagina), 222, 'la pantalla sigue mostrando B');
    assert.equal(JSON.parse(pagina.copiados[0]).navegador.version, 111, 'el portapapeles contiene A');
    assert.equal(pagina.texto('estado-informe'), estadoB, 'no se afirma que se copió el informe mostrado');
    assert.equal(pagina.texto('estado-informe').includes('copiado'), false);
    const area = /** @type {any} */ (pagina.elemento('informe-texto'));
    assert.equal(area.seleccionado, false);
    assert.equal(area.enfocado, false);
    assert.equal(pagina.habilitado('btn-copiar-informe'), true, 'el botón vuelve a estar disponible');
  });
});

test('E02-R02-01 B: el rechazo de una copia superada no altera el mensaje ni la selección del informe reciente', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    pagina.configurarPortapapeles('retiene');
    await copiarVersion(pagina, 111);
    await generarVersion(pagina, 222);
    const estadoB = pagina.texto('estado-informe');

    pagina.escrituras[0].rechazar();
    await pausa(60);
    assert.equal(pagina.texto('estado-informe'), estadoB);
    assert.equal(versionMostrada(pagina), 222);
    const area = /** @type {any} */ (pagina.elemento('informe-texto'));
    assert.equal(area.seleccionado, false, 'no se selecciona el texto del informe reciente');
    assert.equal(area.enfocado, false);
    assert.equal(pagina.copiados.length, 0);
    assert.equal(pagina.habilitado('btn-copiar-informe'), true);
  });
});

test('E02-R02-01 C: no puede haber dos escrituras pendientes que terminen en orden inverso', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    pagina.configurarPortapapeles('retiene');
    await copiarVersion(pagina, 111); // A
    assert.equal(pagina.habilitado('btn-copiar-informe'), false, 'mientras se copia, el botón de copia no está disponible');
    pagina.navegador.userAgent = agenteVersion(222);
    assert.throws(() => pagina.pulsar('btn-copiar-informe'), /deshabilitado/);
    // Aunque un evento llegara igualmente al manejador, no se inicia otra escritura.
    for (const oyente of pagina.elemento('btn-copiar-informe').oyentes.get('click') ?? []) oyente({ type: 'click' });
    await pausa(60);
    assert.equal(pagina.intentosEscritura(), 1, 'solo hay una escritura iniciada');
    assert.equal(pagina.escrituras.length, 1);

    // La generación de informes sigue disponible mientras se copia.
    await generarVersion(pagina, 222);
    assert.equal(pagina.habilitado('btn-informe'), true);

    pagina.escrituras[0].resolver(); // termina A, ya superado
    await esperar(() => pagina.habilitado('btn-copiar-informe'), 1000, 'botón de copia disponible');
    assert.equal(versionMostrada(pagina), 222);
    assert.equal(pagina.texto('estado-informe').includes('copiado'), false);

    // Ahora sí se puede copiar B, y el portapapeles queda con B.
    await copiarVersion(pagina, 222);
    pagina.escrituras[1].resolver();
    await esperar(() => pagina.texto('estado-informe') === 'Informe copiado al portapapeles.', 1000, 'copia vigente confirmada');
    assert.deepEqual(pagina.copiados.map((c) => JSON.parse(c).navegador.version), [111, 222]);
    assert.equal(pagina.habilitado('btn-copiar-informe'), true);
  });
});

test('E02-R02-01: la copia vigente funciona, y si se rechaza conserva la alternativa manual y el botón', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    pagina.configurarPortapapeles('retiene');

    // Copia normal.
    await copiarVersion(pagina, 111);
    assert.equal(pagina.texto('estado-informe'), 'Copiando el informe…');
    assert.equal(pagina.habilitado('btn-copiar-informe'), false);
    pagina.escrituras[0].resolver();
    await esperar(() => pagina.texto('estado-informe') === 'Informe copiado al portapapeles.', 1000, 'copia confirmada');
    assert.equal(pagina.copiados[0], pagina.valor('informe-texto'));
    assert.equal(pagina.habilitado('btn-copiar-informe'), true);
    assert.equal(/** @type {any} */ (pagina.elemento('informe-texto')).seleccionado, false);

    // Copia vigente rechazada: alternativa manual.
    await copiarVersion(pagina, 111);
    pagina.escrituras[1].rechazar();
    await esperar(() => /rechazó la copia automática/.test(pagina.texto('estado-informe')), 1000, 'aviso de rechazo');
    const area = /** @type {any} */ (pagina.elemento('informe-texto'));
    assert.equal(area.seleccionado, true);
    assert.equal(area.enfocado, true);
    assert.equal(pagina.visible('informe-texto'), true);
    assert.equal(pagina.texto('estado-informe').includes('Informe copiado'), false);
    assert.equal(pagina.habilitado('btn-copiar-informe'), true);
    assert.equal(pagina.copiados.length, 1);
  });
});

test('E02-R02-01: generar un informe no toca el portapapeles y una escritura que no termina no bloquea la generación', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    pagina.configurarPortapapeles('retiene');
    await generarVersion(pagina, 111);
    await generarVersion(pagina, 222);
    assert.equal(pagina.intentosEscritura(), 0, 'generar no escribe en el portapapeles');

    // Una escritura que el navegador no resuelve: la copia sigue bloqueada, no se simula una cancelación
    // y no se permite otra escritura, pero los informes se siguen generando y se pueden copiar a mano.
    await copiarVersion(pagina, 111);
    await pausa(150);
    assert.equal(pagina.habilitado('btn-copiar-informe'), false);
    await generarVersion(pagina, 222);
    assert.equal(pagina.visible('informe-texto'), true);
    assert.equal(pagina.intentosEscritura(), 1);
    assert.equal(pagina.copiados.length, 0, 'no se afirma ninguna copia');
    assert.equal(pagina.texto('estado-informe').includes('Informe copiado'), false);
  });
});

test('E02-R02-01: una copia superada mientras esperaba las estadísticas no llega a escribir en el portapapeles', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConEspectador(pagina, participante);
    pagina.configurarPortapapeles('retiene');
    pc.retenerEstadisticas = true;
    vaciarInforme(pagina);
    pagina.pulsar('btn-copiar-informe');
    await esperar(() => pc.estadisticasPendientes.length === 1, 3000, 'estadísticas de la copia pendientes');
    assert.equal(pagina.habilitado('btn-copiar-informe'), false);
    pagina.pulsar('btn-informe');
    await esperar(() => pc.estadisticasPendientes.length === 2, 3000, 'estadísticas del informe pendientes');
    pc.estadisticasPendientes[1].resolver(estadisticasConBytes(222));
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe mostrado');
    pc.estadisticasPendientes[0].resolver(estadisticasConBytes(111));
    await esperar(() => pagina.habilitado('btn-copiar-informe'), 1000, 'botón de copia disponible');
    assert.equal(pagina.intentosEscritura(), 0, 'la copia superada no escribe');
    assert.equal(pagina.texto('estado-informe').includes('copiado'), false);
  });
});
