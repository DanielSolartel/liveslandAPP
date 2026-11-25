// @ts-check
// Continuidad y recuperación manual en la página (public/app.js, E03) con DOBLES CONTROLADOS, contra el
// servidor real del experimento: cronología, estados por componente, reapertura de la señalización, señales
// obsoletas, reconstrucción de la conexión, finalización durante cada fase de un reintento y expiración.
// No usa navegador, WebRTC real ni dispositivos: los casos con Chromium y medios sintéticos están en pruebas/e2e/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SDP, conServidor, crearSesionEnPagina, cuenta, emisorConEspectador, esperar, pausa, ultimaNegociacion } from './ayudas-cliente.js';
import { SENUELOS, fetchReal } from './navegador-simulado.js';
import { LIMITES_RECUPERACION } from '../../public/continuidad.js';
import { ESQUEMA_INFORME } from '../../public/medios.js';

/** @typedef {import('./ayudas-cliente.js').Pagina} Pagina */
/** @typedef {import('./ayudas-cliente.js').Participante} Participante */

/** @param {Pagina} pagina */
async function continuidad(pagina) {
  return (await pagina.diagnostico()).continuidad;
}

/** @param {Pagina} pagina */
function cronologia(pagina) {
  pagina.pulsar('btn-cronologia');
  return JSON.parse(pagina.valor('cronologia-texto'));
}

/**
 * @param {any} c Cronología exportada.
 * @param {string} categoria
 * @param {string} evento
 * @param {string} [detalle]
 */
const eventos = (c, categoria, evento, detalle) =>
  c.eventos.filter((/** @type {any} */ e) => e.categoria === categoria && e.evento === evento && (detalle === undefined || e.detalle === detalle));

/** @param {Pagina} pagina */
async function esperarFinRecuperacion(pagina, ms = 10_000) {
  await esperar(async () => !(await pagina.diagnostico()).recuperacion.enCurso, ms, 'el reintento terminó');
  return (await pagina.diagnostico()).recuperacion;
}

/**
 * La prueba hace de espectador: espera la oferta de la negociación `neg` y la responde con ese identificador.
 * @param {Participante} espectador
 * @param {number} neg
 */
async function responderOferta(espectador, neg) {
  await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === neg), 5000, `oferta ${neg}`);
  assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg })).ok, true);
}

/**
 * Emisor conectado con un espectador (la prueba), con estadísticas que avanzan en las conexiones nuevas.
 * @param {Pagina} pagina
 * @param {(sesion: string, token: string) => Participante} participante
 */
async function emisorConectado(pagina, participante) {
  pagina.avanzarMedios(true);
  return emisorConEspectador(pagina, participante);
}

/** Valores que una cronología o un informe nunca pueden contener. */
function comprobarSinDatosSensibles(/** @type {string} */ texto, /** @type {string[]} */ extra) {
  for (const valor of [...extra, SENUELOS.candidato, SENUELOS.ip, SENUELOS.huella, SENUELOS.dispositivo, SENUELOS.red, SENUELOS.error]) {
    assert.equal(texto.includes(valor), false, `no aparece «${valor.slice(0, 24)}»`);
  }
  assert.equal(/v=0|candidate:|a=fingerprint|https?:\/\/|127\.0\.0\.1/.test(texto), false, 'sin SDP, candidatos, URL ni IP');
}

test('cronología: una emisión normal queda registrada en orden y exportarla no cambia nada ni expone datos', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion, tokenEspectador, pc } = await emisorConectado(pagina, participante);
    const antes = await pagina.diagnostico();
    const c = cronologia(pagina);
    const despues = await pagina.diagnostico();
    assert.equal(c.esquema, 'live-directo-movil/cronologia-continuidad/1');
    assert.equal(c.rol, 'emisor');
    assert.equal(c.reloj, 'monotonico');
    const secuencia = c.eventos.map((/** @type {any} */ e) => `${e.categoria}/${e.evento}${e.detalle ? `/${e.detalle}` : ''}${e.estado ? `=${e.estado}` : ''}`);
    const orden = [
      'pagina/inicio=visible',
      'senalizacion/apertura',
      'senalizacion/conectada',
      'senalizacion/bienvenida=ausente',
      'captura/solicitud',
      'captura/concedida',
      'senalizacion/par-presente',
      'webrtc/creada',
      'webrtc/negociacion/oferta-enviada',
      'webrtc/negociacion/respuesta-aplicada',
      'webrtc/conexion=connected',
    ];
    let desde = -1;
    for (const paso of orden) {
      const i = secuencia.indexOf(paso, desde + 1);
      assert.ok(i > desde, `«${paso}» consta después del paso anterior: ${secuencia.join(', ')}`);
      desde = i;
    }
    assert.ok(c.eventos.every((/** @type {any} */ e, /** @type {number} */ i) => i === 0 || (e.n > c.eventos[i - 1].n && e.t >= c.eventos[i - 1].t)));
    // Antes de crear la sesión los eventos son de la página (sesión local 0); después, de la sesión local 1.
    const apertura = c.eventos.findIndex((/** @type {any} */ e) => e.evento === 'apertura');
    assert.ok(c.eventos.slice(0, apertura).every((/** @type {any} */ e) => e.sesionLocal === 0));
    assert.ok(c.eventos.slice(apertura).every((/** @type {any} */ e) => e.sesionLocal === 1));
    comprobarSinDatosSensibles(pagina.valor('cronologia-texto'), [sesion, tokenEspectador]);
    // Exportar no toca la sesión, la captura ni la conexión.
    assert.deepEqual({ ...despues, medidas: null }, { ...antes, medidas: null });
    assert.equal(pc.cerrada, false);
    assert.equal(pagina.pistasVivas(), 2);
    // El informe de E02 conserva su esquema y es independiente.
    pagina.pulsar('btn-informe');
    await esperar(() => pagina.valor('informe-texto') !== '', 3000, 'informe');
    assert.equal(JSON.parse(pagina.valor('informe-texto')).esquema, ESQUEMA_INFORME);
    assert.equal(JSON.parse(pagina.valor('informe-texto')).cronologia, undefined);
  });
});

test('copia: una sola escritura al portapapeles a la vez entre informe y cronología, sin afirmar copias obsoletas', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    await crearSesionEnPagina(pagina);
    pagina.configurarPortapapeles('retiene');
    pagina.pulsar('btn-copiar-informe');
    await esperar(() => pagina.escrituras.length === 1, 3000, 'escritura del informe pendiente');
    assert.equal(pagina.habilitado('btn-copiar-informe'), false);
    assert.equal(pagina.habilitado('btn-copiar-cronologia'), false, 'tampoco se puede copiar la cronología');
    // Generar sigue disponible y no escribe en el portapapeles.
    pagina.pulsar('btn-cronologia');
    assert.equal(pagina.intentosEscritura(), 1);
    pagina.escrituras[0].resolver();
    await esperar(() => pagina.texto('estado-informe') === 'Informe copiado al portapapeles.', 3000, 'informe copiado');
    assert.equal(pagina.habilitado('btn-copiar-cronologia'), true);

    // Una copia de la cronología superada por una generación posterior no se presenta como copia de la reciente.
    pagina.pulsar('btn-copiar-cronologia');
    await esperar(() => pagina.escrituras.length === 2, 3000, 'escritura de la cronología pendiente');
    pagina.pulsar('btn-cronologia');
    await pausa(10);
    const reciente = pagina.texto('estado-cronologia');
    assert.match(reciente, /Cronología generada/);
    pagina.escrituras[1].resolver();
    await pausa(30);
    assert.equal(pagina.texto('estado-cronologia'), reciente, 'no se afirma «copiada» sobre la cronología reciente');
    assert.equal(pagina.intentosEscritura(), 2);

    // Rechazo: alternativa manual con el texto seleccionado.
    pagina.configurarPortapapeles('rechaza');
    pagina.pulsar('btn-copiar-cronologia');
    await esperar(() => /rechazó la copia automática\. La cronología está seleccionada/.test(pagina.texto('estado-cronologia')), 3000, 'alternativa manual');
    assert.equal(/** @type {any} */ (pagina.elemento('cronologia-texto')).seleccionado, true);
  });
});

test('señalización: un EOF inesperado con el canal aún registrado da un estado honesto, 409 acotado y recuperación en la misma sesión', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion, tokenEspectador, espectador, pc } = await emisorConectado(pagina, participante);
    const expiraEn = app.almacen.obtener(sesion)?.expiraEn;
    const flujo = pagina.flujosEventos.at(-1);
    assert.ok(flujo);
    flujo.cortar('eof'); // la página deja de recibir, pero el servidor conserva el canal (semiabierto)
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'interrumpida', 3000, 'canal interrumpido');
    assert.deepEqual(await continuidad(pagina), { estado: 'requiere-intervencion', motivo: 'canal-perdido' });
    assert.equal(pc.cerrada, false, 'perder la señalización no cierra la conexión WebRTC');
    assert.equal((await pagina.diagnostico()).conexion, 'connected');
    assert.match(pagina.texto('mensaje-error'), /Reintentar conexión/);
    assert.ok(app.almacen.obtener(sesion)?.canales.emisor, 'el servidor aún tiene el canal anterior');

    // Reintento: el servidor responde 409 (rol ocupado). Se reintenta un número acotado de veces y se informa.
    const aperturas = pagina.aperturasEventos();
    pagina.pulsar('btn-reintentar');
    assert.equal(pagina.habilitado('btn-reintentar'), false, 'un solo reintento a la vez');
    assert.equal((await continuidad(pagina)).estado, 'recuperacion-en-curso');
    const r1 = await esperarFinRecuperacion(pagina);
    assert.equal(r1.detalle, 'rol-ocupado');
    assert.equal(r1.resultado, 'no-confirmada');
    assert.equal(pagina.aperturasEventos() - aperturas, LIMITES_RECUPERACION.intentosRolOcupado, 'intentos acotados');
    assert.match(pagina.texto('estado-recuperacion'), /conserva el canal anterior/);
    assert.ok(app.almacen.obtener(sesion)?.canales.emisor, 'no se expulsa al canal registrado');
    assert.equal(pagina.habilitado('btn-reintentar'), true);

    // El servidor detecta por fin el cierre del canal anterior; un reintento nuevo recupera la misma sesión.
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal anterior liberado');
    await esperar(() => cuenta(espectador, 'par', (d) => d.presente === false && d.motivo === 'desconexion'), 3000, 'ausencia por desconexión');
    pagina.pulsar('btn-reintentar');
    await responderOferta(espectador, 2);
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc2.remoteDescription, 3000, 'respuesta aplicada');
    pc2.conectar();
    const r2 = await esperarFinRecuperacion(pagina);
    assert.equal(r2.detalle, 'envio-confirmado');
    assert.equal(r2.resultado, 'confirmada');
    assert.deepEqual(await continuidad(pagina), { estado: 'recuperacion-confirmada', motivo: 'ninguno' });
    assert.match(pagina.texto('estado-recuperacion'), /no puede confirmar que el espectador vea y oiga/);

    // Misma sesión, mismos roles y credenciales, misma caducidad, misma captura, un canal y una conexión.
    assert.equal(app.almacen.tamano, 1);
    assert.equal(app.almacen.obtener(sesion)?.expiraEn, expiraEn, 'el reintento no alarga la sesión');
    assert.equal(new URL(pagina.valor('enlace-espectador')).hash.slice(1), tokenEspectador, 'el enlace del espectador sigue siendo el mismo');
    const d = await pagina.diagnostico();
    assert.equal(d.flujosLocalesCreados, 1, 'no se volvió a capturar');
    assert.equal(pagina.flujos.length, 1);
    assert.equal(pagina.pistasVivas(), 2);
    assert.equal(pc.cerrada, true, 'la conexión anterior se cerró');
    assert.equal(pagina.conexiones.filter((/** @type {any} */ c) => !c.cerrada).length, 1, 'una sola conexión vigente');
    assert.deepEqual(pc2.pistas, pagina.flujos[0].getTracks(), 'se reutilizan las mismas pistas');
    assert.equal(d.negociaciones, 2);

    const c = cronologia(pagina);
    assert.equal(eventos(c, 'recuperacion', 'fallo', 'rol-ocupado').length, 1);
    assert.equal(eventos(c, 'recuperacion', 'exito', 'envio-confirmado').length, 1);
    assert.equal(eventos(c, 'senalizacion', 'interrumpida', 'fin-inesperado').length, 1);
    assert.ok(eventos(c, 'senalizacion', 'reapertura').length >= 2);
    comprobarSinDatosSensibles(pagina.valor('cronologia-texto'), [sesion, tokenEspectador]);
  });
});

test('reapertura: red, 401, 403, 429 y apertura sin respuesta dan estados honestos, sin duplicar canales ni reintentar sin fin', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion, espectador } = await emisorConectado(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');

    /** @type {[ReturnType<Parameters<Pagina['decidirAperturaEventos']>[0]>, string, string][]} */
    const casos = [
      ['red', 'red', 'canal-perdido'],
      [401, 'no-autorizado', 'no-autorizado'],
      [403, 'no-autorizado', 'no-autorizado'],
      [429, 'limite-senales', 'limite-senales'],
    ];
    for (const [modo, detalle, motivo] of casos) {
      pagina.decidirAperturaEventos(() => modo);
      const aperturas = pagina.aperturasEventos();
      pagina.pulsar('btn-reintentar');
      const r = await esperarFinRecuperacion(pagina);
      assert.equal(r.detalle, detalle, String(modo));
      assert.equal(r.resultado, 'no-confirmada');
      assert.equal(pagina.aperturasEventos() - aperturas, 1, `${modo}: un solo intento`);
      assert.deepEqual(await continuidad(pagina), { estado: 'requiere-intervencion', motivo }, String(modo));
      assert.equal(app.almacen.obtener(sesion)?.canales.emisor, null, 'ningún canal registrado');
      assert.equal((await pagina.diagnostico()).terminado, false, 'la sesión no se da por terminada');
    }

    // Apertura sin respuesta: se cancela al agotar el límite y se informa como tiempo agotado.
    pagina.decidirAperturaEventos(() => 'retener');
    pagina.pulsar('btn-reintentar');
    const r = await esperarFinRecuperacion(pagina, 12_000);
    assert.equal(r.detalle, 'tiempo-agotado');
    assert.equal((await continuidad(pagina)).motivo, 'canal-tiempo-agotado');
    assert.equal(pagina.texto('estado-senal'), 'error');

    // Con el servidor disponible de nuevo, la misma sesión se recupera.
    pagina.decidirAperturaEventos(() => null);
    pagina.pulsar('btn-reintentar');
    await responderOferta(espectador, 2);
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc2.remoteDescription, 3000, 'respuesta aplicada');
    pc2.conectar();
    assert.equal((await esperarFinRecuperacion(pagina)).detalle, 'envio-confirmado');
    assert.equal((await pagina.diagnostico()).continuidad.estado, 'recuperacion-confirmada');
    assert.equal(app.almacen.tamano, 1);
  });
});

test('sesión caducada durante una interrupción: el reintento la rechaza (404), libera la captura y no crea otra sesión', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion, espectador } = await emisorConectado(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('eof');
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'interrumpida', 3000, 'interrumpida');
    app.almacen.eliminar(sesion, 'expirada'); // el aviso de fin no llega a la página: su flujo está cortado
    await esperar(() => cuenta(espectador, 'fin', (d) => d.motivo === 'expirada'), 3000, 'el espectador recibe el fin');
    flujo.liberarServidor();
    assert.equal(pagina.pistasVivas(), 2, 'sin aviso, la página aún no sabe que caducó');

    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.visible('vista-final'), 5000, 'la sesión termina');
    assert.match(pagina.texto('texto-final'), /ya no existe en el servidor/);
    assert.equal(pagina.pistasVivas(), 0, 'la captura se liberó');
    const d = await pagina.diagnostico();
    assert.equal(d.conexion, 'sin-conexion');
    assert.equal(d.continuidad.estado, 'finalizada');
    assert.equal(d.recuperacion.resultado, 'ninguna', 'no se declara ninguna recuperación');
    assert.equal(pagina.visible('btn-reintentar'), false);
    assert.equal(app.almacen.tamano, 0, 'no se creó otra sesión');
    const c = cronologia(pagina);
    assert.equal(eventos(c, 'recuperacion', 'cancelada', 'sesion-terminada').length, 1);
    assert.equal(eventos(c, 'finalizacion', 'terminacion-remota', 'sesion-inexistente').length, 1);
    assert.equal(eventos(c, 'recuperacion', 'exito').length, 0);
  });
});

test('WebRTC: una desconexión transitoria se muestra como interrupción y se recupera sola; failed exige intervención', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { espectador, pc } = await emisorConectado(pagina, participante);
    pc.perderTransporte('disconnected');
    assert.deepEqual(await continuidad(pagina), { estado: 'interrupcion-detectada', motivo: 'transporte-desconectado' });
    pc.conectar();
    assert.deepEqual(await continuidad(pagina), { estado: 'conectada', motivo: 'ninguno' });
    assert.equal(eventos(cronologia(pagina), 'recuperacion', 'inicio').length, 0, 'no hubo reintento automático');

    pc.perderTransporte('failed');
    assert.deepEqual(await continuidad(pagina), { estado: 'requiere-intervencion', motivo: 'transporte-fallido' });
    await pausa(50);
    assert.equal(pagina.conexiones.length, 1, 'tampoco se reconstruye sola');

    pagina.pulsar('btn-reintentar');
    await responderOferta(espectador, 2);
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc2.remoteDescription, 3000, 'respuesta aplicada');
    pc2.conectar();
    assert.equal((await esperarFinRecuperacion(pagina)).detalle, 'envio-confirmado');
    assert.equal(pc.cerrada, true);
    assert.deepEqual(pc2.pistas, pagina.flujos[0].getTracks(), 'mismas pistas locales');
    assert.equal((await pagina.diagnostico()).flujosLocalesCreados, 1, 'renegociar no incrementa el contador de capturas');
    assert.equal(pagina.capturas.length, 0);
    // La confirmación no oculta una interrupción posterior.
    pc2.perderTransporte('disconnected');
    assert.equal((await continuidad(pagina)).estado, 'interrupcion-detectada');
  });
});

test('señales obsoletas: respuesta y candidatos de otra negociación se descartan; los anticipados se aplican tras la respuesta', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { espectador, pc } = await emisorConectado(pagina, participante);
    pc.perderTransporte('failed');
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 3000, 'oferta 2');
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    const candidato = { candidate: 'candidate:9 1 udp 1 127.0.0.1 9 typ host', sdpMid: '0', sdpMLineIndex: 0, usernameFragment: null };

    // Respuesta tardía de la negociación 1 y respuesta sin identificador: descartadas.
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 1 })).ok, true);
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP })).ok, true);
    // Candidato tardío de la negociación 1: descartado. Candidato de la 2 antes de su respuesta: en cola.
    assert.equal((await espectador.canal.enviar({ tipo: 'candidato', neg: 1, candidato })).ok, true);
    assert.equal((await espectador.canal.enviar({ tipo: 'candidato', neg: 2, candidato })).ok, true);
    await esperar(async () => (await pagina.diagnostico()).senalesDescartadas === 3, 3000, 'tres señales descartadas');
    assert.equal(pc2.remoteDescription, null);
    assert.equal(pc2.candidatosRecibidos.length, 0, 'el candidato anticipado espera a la respuesta');
    assert.equal(pc.candidatosRecibidos.length, 0, 'la conexión anterior no recibe nada');

    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).ok, true);
    await esperar(() => pc2.candidatosRecibidos.length === 1, 3000, 'el candidato anticipado se aplica tras la respuesta');
    // Una respuesta repetida, ya sin oferta local pendiente, también se descarta.
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).ok, true);
    await esperar(async () => (await pagina.diagnostico()).senalesDescartadas === 4, 3000, 'respuesta repetida descartada');
    pc2.conectar();
    assert.equal((await esperarFinRecuperacion(pagina)).detalle, 'envio-confirmado');
    const c = cronologia(pagina);
    assert.equal(eventos(c, 'senalizacion', 'senal-obsoleta', 'respuesta').length, 3);
    assert.equal(eventos(c, 'senalizacion', 'senal-obsoleta', 'candidato').length, 1);
  });
});

test('candidatos salientes: no se envían antes de que la oferta llegue al servidor y llegan después de ella', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const datos = await crearSesionEnPagina(pagina);
    pagina.capturaAutomatica(true);
    pagina.pulsar('btn-activar');
    await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura activa');
    pagina.retenerSenales((s) => s.tipo === 'oferta');
    const espectador = participante(datos.sesion, datos.tokenEspectador);
    await esperar(() => pagina.retenidas.length === 1, 3000, 'oferta retenida');
    const pc = /** @type {any} */ (pagina.conexiones.at(-1));
    pc.generarCandidato();
    pc.generarCandidato();
    await pausa(80);
    assert.equal(cuenta(espectador, 'senal', (d) => d.tipo === 'candidato'), 0, 'ningún candidato antes que la oferta');
    pagina.retenerSenales(() => false);
    await pagina.retenidas[0].liberar();
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'candidato') === 2, 3000, 'candidatos enviados');
    const senales = espectador.eventos.filter((e) => e.evento === 'senal').map((e) => e.datos);
    assert.equal(senales[0].tipo, 'oferta', 'la oferta llega primero');
    assert.ok(senales.slice(1).every((s) => s.tipo === 'candidato' && s.neg === senales[0].neg), 'los candidatos llevan la negociación de la oferta');
    // Después de la oferta, los candidatos nuevos salen en el acto.
    pc.generarCandidato();
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'candidato') === 3, 3000, 'candidato posterior');
  });
});

test('solicitud de oferta: el emisor crea una sola negociación ante solicitudes repetidas y el espectador no puede ofrecer', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { espectador } = await emisorConectado(pagina, participante);
    // Justo después de una oferta, una solicitud se ignora por demasiado temprana.
    assert.equal((await espectador.canal.enviar({ tipo: 'solicitud-oferta' })).ok, true);
    await pausa(50);
    assert.equal((await pagina.diagnostico()).negociaciones, 1);
    await pausa(LIMITES_RECUPERACION.intervaloMinOfertasMs + 100);
    const [a, b] = await Promise.all([espectador.canal.enviar({ tipo: 'solicitud-oferta' }), espectador.canal.enviar({ tipo: 'solicitud-oferta' })]);
    assert.ok(a.ok && b.ok);
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 3000, 'oferta 2');
    await pausa(80);
    assert.equal((await pagina.diagnostico()).negociaciones, 2, 'una sola negociación nueva');
    assert.equal(cuenta(espectador, 'senal', (d) => d.tipo === 'oferta'), 2);
    assert.equal((await espectador.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 9 })).estadoHttp, 403, 'el espectador no ofrece');
    const c = cronologia(pagina);
    assert.equal(eventos(c, 'recuperacion', 'solicitud-oferta-recibida').length, 3);
    assert.equal(eventos(c, 'senalizacion', 'senal-ignorada', 'demasiado-pronto').length, 2);
  });
});

test('el emisor presenta la salida voluntaria del espectador como espera y su desconexión como interrupción', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion, tokenEspectador, espectador } = await emisorConectado(pagina, participante);
    assert.equal((await espectador.canal.enviar({ tipo: 'salir' })).ok, true);
    await esperar(async () => (await continuidad(pagina)).motivo === 'participante-salio', 3000, 'salida');
    assert.deepEqual(await continuidad(pagina), { estado: 'esperando-participante', motivo: 'participante-salio' });
    assert.equal((await pagina.diagnostico()).terminado, false, 'la emisión sigue');
    assert.equal(pagina.pistasVivas(), 2, 'la captura del emisor se conserva');

    const otro = participante(sesion, tokenEspectador);
    await esperar(() => cuenta(otro, 'senal', (d) => d.tipo === 'oferta'), 3000, 'oferta al espectador que vuelve');
    otro.canal.cerrar(); // sin salida registrada
    await esperar(async () => (await continuidad(pagina)).motivo === 'participante-desconectado', 3000, 'desconexión');
    assert.equal((await continuidad(pagina)).estado, 'interrupcion-detectada');
  });
});

test('finalizar durante la apertura de la señalización de un reintento: nada se reactiva después', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion } = await emisorConectado(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');
    pagina.decidirAperturaEventos(() => 'retener');
    const aperturas = pagina.aperturasEventos();
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.aperturasEventos() === aperturas + 1, 3000, 'apertura pendiente');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada sin esperar a la red');
    assert.equal(pagina.pistasVivas(), 0);
    pagina.decidirAperturaEventos(() => null);
    await pausa(LIMITES_RECUPERACION.pausaRolOcupadoMs + 200);
    assert.equal(pagina.aperturasEventos(), aperturas + 1, 'no se abre ningún canal nuevo');
    assert.equal(app.almacen.tamano, 0, 'el fin llegó al servidor');
    const d = await pagina.diagnostico();
    assert.equal(d.recuperacion.enCurso, false);
    assert.equal(d.recuperacion.resultado, 'ninguna');
    assert.equal(d.continuidad.estado, 'finalizada');
    assert.equal(eventos(cronologia(pagina), 'recuperacion', 'cancelada', 'finalizacion').length, 1);
  });
});

test('finalizar durante la creación o la aplicación de una negociación de un reintento: ninguna operación tardía la reactiva', async () => {
  for (const paso of /** @type {const} */ (['oferta', 'remota'])) {
    await conServidor(async ({ app, abrir, participante }) => {
      const pagina = await abrir('/');
      const { espectador, pc } = await emisorConectado(pagina, participante);
      pc.perderTransporte('failed');
      pagina.retenerNegociacion({ [paso]: true });
      pagina.pulsar('btn-reintentar');
      if (paso === 'remota') {
        await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 3000, 'oferta 2');
        assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).ok, true);
      }
      await esperar(() => pagina.pasosRetenidos() === 1, 3000, `paso ${paso} retenido`);
      const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
      pagina.pulsar('btn-finalizar');
      await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
      pagina.liberarNegociacion();
      await pausa(100);
      assert.equal(pc2.cerrada, true, `${paso}: la conexión del reintento se cerró`);
      assert.equal(pagina.pistasVivas(), 0, `${paso}: sin pistas vivas`);
      const d = await pagina.diagnostico();
      assert.equal(d.conexion, 'sin-conexion');
      assert.equal(d.terminado, true);
      assert.equal(d.recuperacion.resultado, 'ninguna');
      assert.equal(pagina.visible('mensaje-error'), false, `${paso}: la operación tardía no muestra errores`);
      if (paso === 'oferta') assert.equal(cuenta(espectador, 'senal', (x) => x.neg === 2), 0, 'la oferta tardía no se envía');
      assert.equal(app.almacen.tamano, 0);
    });
  }
});

test('finalizar mientras el reintento espera la conexión o las estadísticas: no se declara ninguna recuperación', async () => {
  for (const fase of /** @type {const} */ (['conexion', 'estadisticas'])) {
    await conServidor(async ({ abrir, participante }) => {
      const pagina = await abrir('/');
      const { espectador, pc } = await emisorConectado(pagina, participante);
      pc.perderTransporte('failed');
      pagina.pulsar('btn-reintentar');
      await responderOferta(espectador, 2);
      const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
      await esperar(() => pc2.remoteDescription, 3000, 'respuesta aplicada');
      if (fase === 'estadisticas') {
        pc2.retenerEstadisticas = true;
        pc2.conectar();
        await esperar(() => pc2.estadisticasPendientes.length === 1, 3000, 'estadísticas pendientes');
      }
      pagina.pulsar('btn-finalizar');
      await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
      if (fase === 'estadisticas') for (const p of pc2.estadisticasPendientes) p.resolver();
      else pc2.conectar();
      await pausa(LIMITES_RECUPERACION.intervaloProgresoMs + 300);
      const d = await pagina.diagnostico();
      assert.equal(d.recuperacion.resultado, 'ninguna', `${fase}: sin recuperación declarada`);
      assert.equal(d.conexion, 'sin-conexion');
      assert.equal(pagina.pistasVivas(), 0);
      assert.doesNotMatch(pagina.texto('estado-recuperacion'), /confirmada/);
      const c = cronologia(pagina);
      assert.equal(eventos(c, 'recuperacion', 'exito').length, 0);
      assert.equal(eventos(c, 'recuperacion', 'cancelada', 'finalizacion').length, 1);
    });
  }
});

test('captura: silencio, fin de una pista, reactivación explícita y captura tardía descartada al finalizar', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { espectador } = await emisorConectado(pagina, participante);
    const [video, audio] = /** @type {any[]} */ (pagina.flujos[0].getTracks());
    video.silenciar();
    assert.deepEqual(await continuidad(pagina), { estado: 'interrupcion-detectada', motivo: 'pista-silenciada' });
    assert.equal((await pagina.diagnostico()).terminado, false, 'un silencio no termina nada');
    video.reanudar();
    assert.equal((await continuidad(pagina)).estado, 'conectada');

    video.terminar();
    assert.deepEqual(await continuidad(pagina), { estado: 'requiere-intervencion', motivo: 'captura-terminada' });
    assert.equal(pagina.habilitado('btn-activar'), true, 'se puede volver a activar, solo por acción explícita');
    pagina.pulsar('btn-reintentar');
    const r = await esperarFinRecuperacion(pagina);
    assert.equal(r.detalle, 'captura-terminada');
    assert.equal(pagina.capturas.length, 0, 'el reintento no pide una captura nueva');
    assert.equal(pagina.flujos.length, 1);

    // Reactivación explícita: se libera la captura anterior antes de aceptar la nueva y se renegocia con ella.
    pagina.pulsar('btn-activar');
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 3000, 'oferta con la captura nueva');
    assert.equal(audio.readyState, 'ended', 'la pista superviviente de la captura anterior se detuvo');
    assert.equal(pagina.pistasVivas(), 2);
    assert.equal((await pagina.diagnostico()).flujosLocalesCreados, 2);
    assert.deepEqual(/** @type {any} */ (pagina.conexiones.at(-1)).pistas, pagina.flujos[1].getTracks());

    // Una captura solicitada y no resuelta cuando se finaliza se detiene al llegar.
    pagina.flujos[1].getTracks()[0].terminar();
    pagina.capturaAutomatica(false);
    pagina.pulsar('btn-activar');
    assert.equal(pagina.capturas.length, 1);
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
    pagina.capturas[0].resolver();
    await pausa(50);
    assert.equal(pagina.pistasVivas(), 0);
    assert.equal((await pagina.diagnostico()).capturasDescartadas, 1);
    assert.equal(pagina.visible('vista-final'), true);
    const c = cronologia(pagina);
    assert.equal(eventos(c, 'captura', 'mute').length, 1);
    assert.equal(eventos(c, 'captura', 'ended').length, 2);
    assert.equal(eventos(c, 'captura', 'tardia-descartada').length, 1);
  });
});

/**
 * Página de espectador conectada a un emisor que hace la prueba.
 * @param {{ base: string, abrir: (url?: string) => Promise<Pagina>, participante: (s: string, t: string) => Participante }} ctx
 */
async function espectadorConectado({ base, abrir, participante }) {
  const creada = await (await fetchReal(`${base}/api/sesiones`, { method: 'POST' })).json();
  const emisor = participante(creada.sesion, creada.tokenEmisor);
  await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor conectado');
  const pagina = await abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
  pagina.avanzarMedios(true);
  await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador conectado');
  assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
  const respuesta = await esperar(() => emisor.eventos.find((e) => e.evento === 'senal' && e.datos.tipo === 'respuesta'), 3000, 'respuesta');
  assert.equal(respuesta.datos.neg, 1, 'la respuesta lleva el identificador de la oferta');
  const pc = /** @type {any} */ (pagina.conexiones.at(-1));
  pc.recibirMedios();
  pc.conectar();
  return { creada, emisor, pagina, pc };
}

test('espectador: el reintento pide una oferta al emisor, responde a la negociación nueva y confirma la recepción', async () => {
  await conServidor(async (ctx) => {
    const { creada, emisor, pagina, pc } = await espectadorConectado(ctx);
    assert.equal((await continuidad(pagina)).estado, 'conectada');
    pc.perderTransporte('failed');
    assert.deepEqual(await continuidad(pagina), { estado: 'requiere-intervencion', motivo: 'transporte-fallido' });
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'solicitud-oferta'), 3000, 'solicitud recibida por el emisor');
    assert.equal(cuenta(emisor, 'senal', (d) => d.tipo === 'oferta'), 0, 'el espectador nunca envía ofertas');
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 2 })).ok, true);
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 2), 3000, 'respuesta 2');
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    pc2.recibirMedios();
    pc2.conectar();
    const r = await esperarFinRecuperacion(pagina);
    assert.equal(r.detalle, 'recepcion-confirmada');
    assert.match(pagina.texto('estado-recuperacion'), /Confirma tú que se ve y se oye/);
    assert.equal((await continuidad(pagina)).estado, 'recuperacion-confirmada');
    assert.equal(pc.cerrada, true);
    assert.equal(ctx.app.almacen.tamano, 1);
    assert.ok(ctx.app.almacen.obtener(creada.sesion));
    // Un candidato del emisor para la negociación anterior se descarta.
    const candidato = { candidate: 'candidate:9 1 udp 1 127.0.0.1 9 typ host', sdpMid: '0', sdpMLineIndex: 0, usernameFragment: null };
    assert.equal((await emisor.canal.enviar({ tipo: 'candidato', neg: 1, candidato })).ok, true);
    assert.equal((await emisor.canal.enviar({ tipo: 'candidato', neg: 2, candidato })).ok, true);
    await esperar(() => pc2.candidatosRecibidos.length === 1, 3000, 'solo el candidato vigente');
    assert.equal((await pagina.diagnostico()).senalesDescartadas, 1);
  });
});

test('espectador: salir durante un reintento libera sus recursos, no finaliza la sesión del emisor y no reabre el canal', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorConectado(ctx);
    pc.perderTransporte('failed');
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'solicitud-oferta'), 3000, 'solicitud');
    const aperturas = pagina.aperturasEventos();
    pagina.pulsar('btn-salir');
    await esperar(() => pagina.visible('vista-final'), 1000, 'salida');
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === false && d.motivo === 'salida'), 3000, 'el emisor recibe una salida, no un fin');
    assert.equal(cuenta(emisor, 'fin'), 0);
    assert.equal(ctx.app.almacen.tamano, 1, 'la sesión del emisor sigue');
    await pausa(200);
    assert.equal(pagina.aperturasEventos(), aperturas, 'el canal del espectador no se reabre');
    const d = await pagina.diagnostico();
    assert.equal(d.pistasRemotas, 0);
    assert.equal(d.conexion, 'sin-conexion');
    assert.equal(d.recuperacion.resultado, 'ninguna');
    assert.equal(eventos(cronologia(pagina), 'recuperacion', 'cancelada', 'salida').length, 1);
  });
});

test('expiración del servidor durante un reintento: la sesión termina y el reintento no la resucita', async () => {
  const reloj = { t: 1_000_000 };
  await conServidor(
    async ({ app, abrir, participante }) => {
      const pagina = await abrir('/');
      const { sesion, espectador, pc } = await emisorConectado(pagina, participante);
      pc.perderTransporte('failed');
      pagina.pulsar('btn-reintentar');
      await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 3000, 'oferta 2');
      reloj.t += 31 * 60 * 1000; // pasa la vida máxima de la sesión; el barrido del servidor la elimina
      await esperar(() => pagina.visible('vista-final'), 3000, 'fin por caducidad');
      assert.equal(pagina.texto('texto-final'), 'La sesión de prueba caducó.');
      assert.equal(app.almacen.obtener(sesion), undefined);
      assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).estadoHttp, 404, 'la sesión no se reactiva');
      await pausa(100);
      const d = await pagina.diagnostico();
      assert.equal(d.recuperacion.resultado, 'ninguna');
      assert.equal(pagina.pistasVivas(), 0);
      const c = cronologia(pagina);
      assert.equal(eventos(c, 'finalizacion', 'caducidad', 'expirada').length, 1);
      assert.equal(eventos(c, 'recuperacion', 'cancelada', 'sesion-terminada').length, 1);
    },
    { sesiones: { ahora: () => reloj.t } },
  );
});

test('ciclo de vida: ocultar, congelar o perder la red no finaliza nada; pagehide libera captura y conexiones', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const { pc } = await emisorConectado(pagina, participante);
    pagina.emitirDocumento('visibilitychange', 'hidden');
    pagina.emitirDocumento('freeze');
    pagina.emitirVentana('offline');
    pagina.emitirVentana('online');
    pagina.emitirDocumento('resume');
    pagina.emitirDocumento('visibilitychange', 'visible');
    const d = await pagina.diagnostico();
    assert.equal(d.terminado, false, 'la sesión no se finaliza por ocultar la página');
    assert.equal(pagina.pistasVivas(), 2);
    assert.equal(pc.cerrada, false);
    pagina.emitirVentana('pageshow', { persisted: false });
    pagina.emitirVentana('pagehide', { persisted: true });
    assert.equal(pagina.visible('vista-final'), true);
    assert.equal(pagina.pistasVivas(), 0);
    assert.equal(pc.cerrada, true);
    const c = cronologia(pagina);
    const secuencia = c.eventos.map((/** @type {any} */ e) => `${e.categoria}/${e.evento}${e.estado ? `=${e.estado}` : ''}${e.detalle ? `/${e.detalle}` : ''}`);
    for (const paso of [
      'pagina/visibilidad=hidden',
      'pagina/freeze',
      'red/offline',
      'red/online',
      'pagina/resume',
      'pagina/visibilidad=visible',
      'pagina/pageshow/no-persistida',
      'pagina/pagehide/persistida',
      'finalizacion/limpieza/pagina-ocultada',
    ]) {
      assert.ok(secuencia.includes(paso), paso);
    }
    assert.equal(eventos(c, 'pagina', 'descartada-previamente').length, 0, 'no se afirma un descarte que el navegador no indicó');
    assert.equal(c.capacidades.freeze, true);
    assert.equal(c.capacidades.descarte, true);
  });
});

test('sin progreso de medios o sin estadísticas, el reintento no declara una recuperación', async () => {
  for (const caso of /** @type {const} */ (['sin-progreso', 'sin-estadisticas'])) {
    await conServidor(async ({ abrir, participante }) => {
      const pagina = await abrir('/');
      const { espectador, pc } = await emisorConEspectador(pagina, participante); // contadores que no avanzan
      pc.perderTransporte('failed');
      pagina.pulsar('btn-reintentar');
      await responderOferta(espectador, 2);
      const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
      await esperar(() => pc2.remoteDescription, 3000, 'respuesta aplicada');
      if (caso === 'sin-estadisticas') pc2.fallaEstadisticas = true;
      pc2.conectar();
      const r = await esperarFinRecuperacion(pagina);
      assert.equal(r.resultado, 'no-confirmada', caso);
      assert.equal(r.detalle, caso === 'sin-progreso' ? 'sin-progreso' : 'conectada-sin-verificar', caso);
      assert.match(pagina.texto('estado-recuperacion'), caso === 'sin-progreso' ? /los medios no avanzan/ : /recuperación no verificada/);
      const d = await pagina.diagnostico();
      assert.equal(d.conexion, 'connected', 'la conexión está establecida…');
      assert.notEqual(d.continuidad.estado, 'recuperacion-confirmada', '…pero no se afirma la recuperación');
      assert.equal(d.continuidad.motivo, 'recuperacion-no-confirmada');
      const c = cronologia(pagina);
      assert.equal(eventos(c, 'recuperacion', 'exito').length, 0);
      assert.equal(eventos(c, 'recuperacion', caso === 'sin-progreso' ? 'fallo' : 'sin-verificar').length, 1);
    });
  }
});

test('espectador: tras perder su señalización, el reintento la reabre en la misma sesión y el emisor renegocia', async () => {
  await conServidor(async (ctx) => {
    const { creada, emisor, pagina, pc } = await espectadorConectado(ctx);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'interrumpida', 3000, 'interrumpida');
    assert.deepEqual(await continuidad(pagina), { estado: 'requiere-intervencion', motivo: 'canal-perdido' });
    flujo.liberarServidor();
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === false && d.motivo === 'desconexion'), 3000, 'el emisor ve la desconexión');
    pagina.pulsar('btn-reintentar');
    await esperar(() => emisor.eventos.filter((e) => e.evento === 'par' && e.datos.presente === true).length === 2, 3000, 'el espectador vuelve');
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 3 })).ok, true);
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 3), 3000, 'respuesta 3');
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    pc2.recibirMedios();
    pc2.conectar();
    const r = await esperarFinRecuperacion(pagina);
    assert.equal(r.detalle, 'recepcion-confirmada');
    assert.equal(pc.cerrada, true);
    assert.equal(ctx.app.almacen.tamano, 1);
    assert.ok(ctx.app.almacen.obtener(creada.sesion)?.canales.espectador, 'un solo canal del espectador, registrado de nuevo');
    assert.equal(cuenta(emisor, 'senal', (d) => d.tipo === 'oferta'), 0, 'el espectador no ofrece');
  });
});
