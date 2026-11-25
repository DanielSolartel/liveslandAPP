// @ts-check
// Regresiones de la revisión E03-R02 (auditoría independiente de E03 v1.1) con DOBLES CONTROLADOS, contra el
// servidor real del experimento. R02-01: prioridad de los eventos terminales sobre negociaciones pendientes.
// R02-02: límite efectivo de las operaciones de negociación durante un reintento. R02-03: aislamiento entre
// generaciones (una operación de una sesión anterior no toca la sesión nueva). No usa navegador ni WebRTC real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SDP, conServidor, crearSesionEnPagina, cuenta, emisorConEspectador, esperar, pausa } from './ayudas-cliente.js';
import { fetchReal } from './navegador-simulado.js';
import { LIMITES_RECUPERACION } from '../../public/continuidad.js';

/** @typedef {import('./ayudas-cliente.js').Pagina} Pagina */
/** @typedef {import('./ayudas-cliente.js').Participante} Participante */

/** Límite técnico de cada operación de negociación (v1.2). Si no existe (v1.1), se usa 4 s para la espera. */
const OPERACION_MS = /** @type {any} */ (LIMITES_RECUPERACION).operacionRtcMs ?? 4000;

/**
 * @param {Pagina} pagina
 * @param {number} ms
 */
async function esperarFinRecuperacion(pagina, ms) {
  await esperar(async () => !(await pagina.diagnostico()).recuperacion.enCurso, ms, 'el reintento terminó por sí solo');
  return (await pagina.diagnostico()).recuperacion;
}

/** @param {Pagina} pagina */
function cronologia(pagina) {
  pagina.pulsar('btn-cronologia');
  return JSON.parse(pagina.valor('cronologia-texto'));
}

/**
 * Página de espectador con un emisor que hace la prueba (servidor real).
 * @param {any} ctx
 */
async function espectadorPagina(ctx) {
  const creada = await (await fetchReal(`${ctx.base}/api/sesiones`, { method: 'POST' })).json();
  const emisor = ctx.participante(creada.sesion, creada.tokenEmisor);
  await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor conectado');
  const pagina = await ctx.abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
  pagina.avanzarMedios(true);
  await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador conectado');
  return { creada, emisor, pagina };
}

/**
 * Comprueba el estado terminal ANTES de liberar la operación retenida.
 * @param {Pagina} pagina
 */
async function terminadaSinEsperar(pagina) {
  await esperar(() => pagina.visible('vista-final'), 1500, 'la sesión termina sin esperar a la operación WebRTC');
  const d = await pagina.diagnostico();
  assert.equal(d.terminado, true);
  assert.equal(d.conexion, 'sin-conexion');
  assert.ok(pagina.conexiones.every((/** @type {any} */ c) => c.cerrada), 'todas las conexiones cerradas');
  return d;
}

// ---------- E03-R02-01: prioridad terminal ----------

test('R02-01: fin remoto (caducidad) durante setRemoteDescription retenida termina en el acto y no envía la respuesta después', async () => {
  await conServidor(async (ctx) => {
    const { creada, emisor, pagina } = await espectadorPagina(ctx);
    pagina.retenerNegociacion({ remota: true });
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'setRemoteDescription retenida');
    ctx.app.almacen.eliminar(creada.sesion, 'expirada'); // el servidor envía fin y cierra el flujo (fin seguido de EOF)
    await terminadaSinEsperar(pagina);
    assert.equal(pagina.texto('texto-final'), 'La sesión de prueba caducó.');
    pagina.liberarNegociacion();
    await pausa(150);
    assert.equal(cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta'), 0, 'ninguna respuesta tras el fin');
    assert.equal((await pagina.diagnostico()).terminado, true);
    assert.equal(pagina.conexiones.length, 1, 'no se reactiva ninguna conexión');
  });
});

test('R02-01: fin remoto durante createOffer retenida, lanzada por la entrada del espectador', async () => {
  await conServidor(async (ctx) => {
    const pagina = await ctx.abrir('/');
    const datos = await crearSesionEnPagina(pagina);
    pagina.capturaAutomatica(true);
    pagina.pulsar('btn-activar');
    await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura activa');
    pagina.retenerNegociacion({ oferta: true });
    const espectador = ctx.participante(datos.sesion, datos.tokenEspectador);
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'createOffer retenida por el evento par');
    ctx.app.almacen.eliminar(datos.sesion, 'servidor-detenido');
    await terminadaSinEsperar(pagina);
    assert.equal(pagina.pistasVivas(), 0, 'captura liberada');
    pagina.liberarNegociacion();
    await pausa(150);
    assert.equal(cuenta(espectador, 'senal', (d) => d.tipo === 'oferta'), 0, 'ninguna oferta tras el fin');
  });
});

test('R02-01: fin remoto durante createAnswer o setLocalDescription pendientes', async () => {
  for (const paso of /** @type {const} */ (['respuesta', 'local'])) {
    await conServidor(async (ctx) => {
      const { creada, emisor, pagina } = await espectadorPagina(ctx);
      pagina.retenerNegociacion({ [paso]: true });
      assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
      await esperar(() => pagina.pasosRetenidos() === 1, 3000, `${paso} retenida`);
      assert.equal((await emisor.canal.enviar({ tipo: 'fin' })).ok, true); // fin explícito del emisor
      await terminadaSinEsperar(pagina);
      assert.equal(pagina.texto('texto-final'), 'El emisor finalizó la emisión.');
      pagina.liberarNegociacion();
      await pausa(150);
      assert.equal(cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta'), 0, `${paso}: ninguna respuesta tras el fin`);
      void creada;
    });
  }
});

test('R02-01: un fin con la operación pendiente durante toda la prueba no deja esperas ni temporizadores', async () => {
  await conServidor(async (ctx) => {
    const { creada, emisor, pagina } = await espectadorPagina(ctx);
    pagina.retenerNegociacion({ remota: true });
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'retenida');
    ctx.app.almacen.eliminar(creada.sesion, 'expirada');
    const d = await terminadaSinEsperar(pagina);
    assert.equal(d.esperasPendientes, 0, 'ninguna espera lógica retenida');
    assert.equal(pagina.pasosRetenidos(), 1, 'la promesa nativa sigue pendiente; no se afirma que se cancelara');
    await pausa(OPERACION_MS + 500);
    assert.equal((await pagina.diagnostico()).terminado, true);
    assert.equal(cuenta(emisor, 'senal', (x) => x.tipo === 'respuesta'), 0);
  });
});

test('R02-01: un fin atrasado de un canal abandonado no termina la sesión vigente', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion } = await emisorConEspectador(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');
    pagina.decidirAperturaEventos(() => 'sin-bienvenida-tardia');
    pagina.pulsar('btn-reintentar');
    await esperarFinRecuperacion(pagina, LIMITES_RECUPERACION.bienvenidaMs + 3000);
    const abandonada = pagina.aperturasSinBienvenida.at(-1);
    assert.equal(abandonada?.cancelada, true, 'la apertura sin bienvenida se abandonó');
    // El canal abandonado entrega ahora un fin y una bienvenida atrasados.
    abandonada?.inyectar('fin', { motivo: 'finalizada-por-el-emisor' });
    abandonada?.inyectar('bienvenida', { parPresente: true });
    await pausa(150);
    const d = await pagina.diagnostico();
    assert.equal(d.terminado, false, 'el fin atrasado no termina la sesión');
    assert.notEqual(d.canalDetalle, 'conectada', 'la bienvenida atrasada no confirma nada');
    assert.equal(pagina.pistasVivas(), 2);
    // La sesión sigue recuperable con el servidor real.
    pagina.decidirAperturaEventos(() => null);
    pagina.pulsar('btn-reintentar');
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'conectada', 3000, 'reapertura real');
  });
});

test('R02-01: una interrupción ordinaria de la señalización durante una negociación pendiente no es un cierre', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina } = await espectadorPagina(ctx);
    pagina.retenerNegociacion({ remota: true });
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'retenida');
    /** @type {any} */ (pagina.flujosEventos.at(-1)).cortar('eof'); // EOF sin fin
    await pausa(OPERACION_MS + 500);
    const d = await pagina.diagnostico();
    assert.equal(d.terminado, false, 'una pérdida de canal no termina la sesión');
    assert.equal(pagina.visible('vista-final'), false);
    pagina.liberarNegociacion();
  });
});

// ---------- E03-R02-02: límite efectivo de la negociación en un reintento ----------

/** Emisor conectado y con el transporte en failed. */
async function emisorFallido(/** @type {any} */ ctx) {
  const pagina = await ctx.abrir('/');
  pagina.avanzarMedios(true);
  const datos = await emisorConEspectador(pagina, ctx.participante);
  datos.pc.perderTransporte('failed');
  return { pagina, ...datos };
}

test('R02-02: createOffer o setLocalDescription que no se resuelven: el reintento termina solo por agotamiento', async () => {
  for (const paso of /** @type {const} */ (['oferta', 'local'])) {
    await conServidor(async (ctx) => {
      const { pagina, espectador } = await emisorFallido(ctx);
      pagina.retenerNegociacion({ [paso]: true });
      pagina.pulsar('btn-reintentar');
      await esperar(() => pagina.pasosRetenidos() === 1, 3000, `${paso} retenida`);
      const r = await esperarFinRecuperacion(pagina, OPERACION_MS + 3000);
      assert.equal(r.resultado, 'no-confirmada', paso);
      assert.equal(r.detalle, 'negociacion-agotada', paso);
      assert.match(pagina.texto('estado-recuperacion'), /no terminó a tiempo/);
      assert.equal(pagina.habilitado('btn-reintentar'), true, 'se puede volver a intentar');
      const d = await pagina.diagnostico();
      assert.equal(d.esperasPendientes, 0, `${paso}: ninguna espera lógica retenida`);
      assert.equal(d.conexion, 'sin-conexion', 'la conexión del intento agotado se liberó');
      // Resolución tardía: no envía la oferta ni cambia el resultado.
      pagina.liberarNegociacion();
      await pausa(150);
      assert.equal(cuenta(espectador, 'senal', (x) => x.tipo === 'oferta' && x.neg === 2), 0, `${paso}: la oferta agotada no se envía`);
      assert.equal((await pagina.diagnostico()).recuperacion.detalle, 'negociacion-agotada');
      // Segundo reintento válido.
      pagina.pulsar('btn-reintentar');
      await esperar(() => cuenta(espectador, 'senal', (x) => x.tipo === 'oferta' && x.neg === 3), 3000, 'oferta 3');
      assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 3 })).ok, true);
      const pc3 = /** @type {any} */ (pagina.conexiones.at(-1));
      await esperar(() => pc3.remoteDescription, 3000, 'respuesta 3');
      pc3.conectar();
      assert.equal((await esperarFinRecuperacion(pagina, 10_000)).resultado, 'confirmada');
    });
  }
});

test('R02-02: en el espectador, setRemoteDescription o createAnswer que no se resuelven agotan el reintento', async () => {
  for (const paso of /** @type {const} */ (['remota', 'respuesta'])) {
    await conServidor(async (ctx) => {
      const { emisor, pagina } = await espectadorPagina(ctx);
      assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
      await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 1), 3000, 'respuesta 1');
      const pc = /** @type {any} */ (pagina.conexiones.at(-1));
      pc.recibirMedios();
      pc.conectar();
      pc.perderTransporte('failed');
      pagina.retenerNegociacion({ [paso]: true });
      pagina.pulsar('btn-reintentar');
      await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'solicitud-oferta'), 3000, 'solicitud');
      assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 2 })).ok, true);
      await esperar(() => pagina.pasosRetenidos() === 1, 3000, `${paso} retenida`);
      const r = await esperarFinRecuperacion(pagina, OPERACION_MS + 3000);
      assert.equal(r.detalle, 'negociacion-agotada', paso);
      assert.equal((await pagina.diagnostico()).esperasPendientes, 0);
      pagina.liberarNegociacion();
      await pausa(150);
      assert.equal(cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 2), 0, 'la respuesta agotada no se envía');
      // La cola de la señalización no quedó bloqueada: una oferta posterior se procesa.
      assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 3 })).ok, true);
      await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 3), 3000, 'respuesta 3');
    });
  }
});

test('R02-02: finalizar durante una operación acotada cancela la espera sin dejar temporizadores', async () => {
  await conServidor(async (ctx) => {
    const { pagina } = await emisorFallido(ctx);
    pagina.retenerNegociacion({ oferta: true });
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'retenida');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
    const d = await pagina.diagnostico();
    assert.equal(d.esperasPendientes, 0);
    assert.equal(d.recuperacion.enCurso, false);
    await pausa(OPERACION_MS + 500);
    assert.equal((await pagina.diagnostico()).recuperacion.resultado, 'ninguna', 'el agotamiento no se publica tras finalizar');
    pagina.liberarNegociacion();
  });
});

// ---------- E03-R02-03: aislamiento entre generaciones ----------

test('R02-03: la operación de una sesión anterior no cambia el mensaje ni la cronología de la sesión nueva', async () => {
  await conServidor(async (ctx) => {
    const { pagina } = await emisorFallido(ctx);
    pagina.retenerNegociacion({ oferta: true });
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'retenida');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'sesión 1 finalizada');
    pagina.pulsar('btn-nueva');
    const s2 = await crearSesionEnPagina(pagina);
    const antes = cronologia(pagina);
    const conexiones = pagina.conexiones.length;
    assert.equal(pagina.texto('estado-recuperacion'), '');
    pagina.liberarNegociacion(); // la createOffer de la sesión 1 se rechaza ahora (su conexión está cerrada)
    await pausa(200);
    assert.equal(pagina.texto('estado-recuperacion'), '', 'el mensaje de la sesión nueva no cambia');
    const despues = cronologia(pagina);
    const nuevos = despues.eventos.filter((/** @type {any} */ e) => e.n > antes.eventosRegistrados);
    assert.deepEqual(nuevos, [], 'ningún evento tardío de la sesión 1 atribuido a la 2');
    assert.equal(pagina.conexiones.length, conexiones, 'ninguna conexión nueva');
    assert.equal(new URL(pagina.valor('enlace-espectador')).searchParams.get('s'), s2.sesion, 'la sesión vigente es la 2');
    assert.equal((await pagina.diagnostico()).recuperacion.enCurso, false);
  });
});

test('R02-03: con la sesión nueva en su propio reintento, la operación antigua no lo cancela ni lo sustituye', async () => {
  await conServidor(async (ctx) => {
    const { pagina } = await emisorFallido(ctx);
    pagina.retenerNegociacion({ oferta: true });
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'createOffer de la sesión 1 retenida');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'sesión 1 finalizada');
    // Sesión 2 con su propio espectador; la createOffer de la sesión 1 sigue pendiente (posición 0).
    pagina.pulsar('btn-nueva');
    const s2 = await crearSesionEnPagina(pagina);
    pagina.capturaAutomatica(true);
    pagina.pulsar('btn-activar');
    await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura 2');
    const espectador2 = ctx.participante(s2.sesion, s2.tokenEspectador);
    await esperar(() => pagina.pasosRetenidos() === 2, 3000, 'createOffer inicial de la sesión 2 retenida');
    pagina.liberarPaso(1);
    const ofertas = () => espectador2.eventos.filter((e) => e.evento === 'senal' && e.datos.tipo === 'oferta').map((e) => e.datos.neg);
    await esperar(() => ofertas().length === 1, 3000, 'oferta de la sesión 2');
    assert.equal((await espectador2.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: ofertas()[0] })).ok, true);
    let pc = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc.remoteDescription, 3000, 'respuesta');
    pc.conectar();
    pc.perderTransporte('failed');
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.pasosRetenidos() === 2, 3000, 'reintento de la sesión 2 retenido');
    const cronoAntes = cronologia(pagina).eventosRegistrados;
    const mensaje = pagina.texto('estado-recuperacion');
    // La operación antigua (posición 0) se resuelve con el reintento de la sesión 2 aún en curso.
    pagina.liberarPaso(0);
    await pausa(200);
    assert.equal((await pagina.diagnostico()).recuperacion.enCurso, true, 'el reintento de la sesión 2 sigue vigente');
    assert.equal(pagina.texto('estado-recuperacion'), mensaje, 'el mensaje de la sesión 2 no cambia');
    assert.deepEqual(cronologia(pagina).eventos.filter((/** @type {any} */ e) => e.n > cronoAntes), [], 'ningún evento de la sesión 1');
    // El reintento de la sesión 2 termina con normalidad.
    pagina.liberarNegociacion();
    await esperar(() => ofertas().length === 2, 3000, 'oferta del reintento de la sesión 2');
    assert.equal((await espectador2.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: ofertas()[1] })).ok, true);
    pc = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc.remoteDescription, 3000, 'respuesta del reintento');
    pc.conectar();
    const r = await esperarFinRecuperacion(pagina, 10_000);
    assert.equal(r.resultado, 'confirmada', 'el reintento legítimo de la sesión 2 termina bien');
    const eventos = cronologia(pagina).eventos.filter((/** @type {any} */ e) => e.n > cronoAntes);
    assert.equal(eventos.filter((/** @type {any} */ e) => e.categoria === 'recuperacion' && e.evento === 'descartada').length, 0);
    assert.ok(eventos.every((/** @type {any} */ e) => e.sesionLocal === 2));
  });
});
