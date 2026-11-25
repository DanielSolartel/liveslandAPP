// @ts-check
// Regresiones de la revisión E03-R03 (auditoría independiente de E03 v1.2) con DOBLES CONTROLADOS, contra el
// servidor real del experimento. R03-01: una interrupción de la señalización ya observada debe invalidar la
// comprobación de recuperación aunque la cola de señales esté ocupada por una operación WebRTC (aquí, un
// addIceCandidate retenido). No usa navegador ni WebRTC real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SDP, conServidor, cuenta, emisorConEspectador, esperar, pausa } from './ayudas-cliente.js';
import { fetchReal } from './navegador-simulado.js';
import { LIMITES_RECUPERACION } from '../../public/continuidad.js';

/** @typedef {import('./ayudas-cliente.js').Pagina} Pagina */

const CANDIDATO = { candidate: 'candidate:1 1 udp 2122260223 127.0.0.1 9999 typ host', sdpMid: '0', sdpMLineIndex: 0, usernameFragment: null };
const OPERACION_MS = /** @type {any} */ (LIMITES_RECUPERACION).operacionRtcMs ?? 4000;

/** @param {Pagina} pagina */
async function esperarFinRecuperacion(pagina, ms = 10_000) {
  await esperar(async () => !(await pagina.diagnostico()).recuperacion.enCurso, ms, 'el reintento terminó');
  return (await pagina.diagnostico()).recuperacion;
}

/** @param {Pagina} pagina */
function cronologia(pagina) {
  pagina.pulsar('btn-cronologia');
  return JSON.parse(pagina.valor('cronologia-texto'));
}

/**
 * Retiene `addIceCandidate` de una conexión simulada (como la sonda de la auditoría): ocupa la cola de señales.
 * @param {any} pc
 */
function retenerCandidatos(pc) {
  /** @type {{ llamadas: number, liberar: () => void }} */
  const r = { llamadas: 0, liberar: () => {} };
  pc.addIceCandidate = async () => {
    r.llamadas += 1;
    await new Promise((resolve) => {
      r.liberar = () => resolve(undefined);
    });
  };
  return r;
}

/**
 * Emisor conectado con progreso; cola ocupada por un candidato retenido; reintento iniciado; corte del flujo.
 * @param {any} ctx
 * @param {'eof' | 'error'} modo
 */
async function emisorConColaOcupada(ctx, modo) {
  const pagina = await ctx.abrir('/');
  pagina.avanzarMedios(true);
  const datos = await emisorConEspectador(pagina, ctx.participante);
  const retenido = retenerCandidatos(datos.pc);
  assert.equal((await datos.espectador.canal.enviar({ tipo: 'candidato', neg: 1, candidato: CANDIDATO })).ok, true);
  await esperar(() => retenido.llamadas === 1, 3000, 'candidato retenido: cola ocupada');
  pagina.pulsar('btn-reintentar');
  await esperar(async () => (await pagina.diagnostico()).recuperacion.enCurso, 3000, 'reintento en curso');
  await pausa(100);
  const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
  flujo.cortar(modo); // sin evento fin
  return { pagina, retenido, flujo, ...datos };
}

/**
 * Comprueba ANTES de liberar el candidato que la interrupción ya invalidó la recuperación.
 * @param {Pagina} pagina
 */
async function comprobarInvalidada(pagina) {
  await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'interrumpida', 1000, 'la interrupción se refleja sin esperar a la cola');
  const r = await esperarFinRecuperacion(pagina);
  assert.notEqual(r.resultado, 'confirmada', JSON.stringify(r));
  const d = await pagina.diagnostico();
  assert.equal(d.canalDetalle, 'interrumpida');
  assert.notEqual(d.continuidad.estado, 'recuperacion-confirmada');
  assert.doesNotMatch(pagina.texto('estado-recuperacion'), /^Recuperación técnica confirmada/);
  // Orden causal en la cronología: la interrupción consta antes de cualquier resultado del reintento.
  const eventos = cronologia(pagina).eventos;
  const iInterrupcion = eventos.findIndex((/** @type {any} */ e) => e.categoria === 'senalizacion' && e.evento === 'interrumpida');
  const iResultado = eventos.findIndex(
    (/** @type {any} */ e) => e.categoria === 'recuperacion' && ['exito', 'fallo', 'agotada', 'sin-verificar'].includes(e.evento),
  );
  assert.ok(iInterrupcion >= 0, 'la interrupción consta');
  assert.ok(iResultado === -1 || iInterrupcion < iResultado, 'la interrupción consta antes que el resultado');
  assert.equal(eventos.filter((/** @type {any} */ e) => e.categoria === 'recuperacion' && e.evento === 'exito').length, 0);
  return d;
}

test('R03-01: EOF durante la comprobación con un candidato ICE retenido invalida la recuperación (sonda de la auditoría)', async () => {
  await conServidor(async (ctx) => {
    const { pagina, retenido, pc } = await emisorConColaOcupada(ctx, 'eof');
    const d = await comprobarInvalidada(pagina);
    // Interrupción ordinaria: no termina la sesión ni cierra los medios.
    assert.equal(d.terminado, false);
    assert.equal(d.conexion, 'connected', 'la conexión WebRTC se conserva');
    assert.equal(pc.cerrada, false);
    assert.equal(pagina.pistasVivas(), 2);
    retenido.liberar();
    await pausa(200);
    assert.equal((await pagina.diagnostico()).canalDetalle, 'interrumpida', 'la cola liberada no revierte el estado');
  });
});

test('R03-01: error de lectura del flujo durante la comprobación, con la cola ocupada', async () => {
  await conServidor(async (ctx) => {
    const { pagina, retenido } = await emisorConColaOcupada(ctx, 'error');
    const d = await comprobarInvalidada(pagina);
    assert.equal(d.terminado, false);
    retenido.liberar();
  });
});

test('R03-01: en el espectador, EOF durante la comprobación con la cola ocupada invalida la recuperación', async () => {
  await conServidor(async (ctx) => {
    const creada = await (await fetchReal(`${ctx.base}/api/sesiones`, { method: 'POST' })).json();
    const emisor = ctx.participante(creada.sesion, creada.tokenEmisor);
    await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor');
    const pagina = await ctx.abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
    pagina.avanzarMedios(true);
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador');
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 })).ok, true);
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta'), 3000, 'respuesta');
    const pc = /** @type {any} */ (pagina.conexiones.at(-1));
    pc.recibirMedios();
    pc.conectar();
    const retenido = retenerCandidatos(pc);
    assert.equal((await emisor.canal.enviar({ tipo: 'candidato', neg: 1, candidato: CANDIDATO })).ok, true);
    await esperar(() => retenido.llamadas === 1, 3000, 'cola ocupada');
    pagina.pulsar('btn-reintentar');
    await pausa(100);
    /** @type {any} */ (pagina.flujosEventos.at(-1)).cortar('eof');
    const d = await comprobarInvalidada(pagina);
    assert.equal(d.terminado, false);
    assert.equal(d.pistasRemotas, 2, 'los medios recibidos se conservan');
    retenido.liberar();
  });
});

test('R03-01: una bienvenida antigua encolada no vuelve a confirmar un canal ya interrumpido', async () => {
  await conServidor(async (ctx) => {
    const creada = await (await fetchReal(`${ctx.base}/api/sesiones`, { method: 'POST' })).json();
    const emisor = ctx.participante(creada.sesion, creada.tokenEmisor);
    await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor');
    const pagina = await ctx.abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador');
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'interrumpida', 3000, 'interrumpida');
    // Reapertura con HTTP 200 y flujo controlado por la prueba: una oferta que queda retenida ocupa la cola,
    // y detrás de ella se encola una bienvenida; después el flujo se corta (EOF sin fin).
    pagina.decidirAperturaEventos(() => 'sin-bienvenida-tardia');
    pagina.retenerNegociacion({ remota: true });
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.aperturasSinBienvenida.length === 1, 3000, 'apertura');
    const a = /** @type {any} */ (pagina.aperturasSinBienvenida.at(-1));
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'conectada', 3000, 'HTTP 200');
    a.inyectar('senal', { tipo: 'oferta', sdp: SDP, neg: 7 });
    await esperar(() => pagina.pasosRetenidos() === 1, 3000, 'oferta retenida: cola ocupada');
    a.inyectar('bienvenida', { parPresente: true });
    a.cerrar();
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'interrumpida', 1000, 'interrupción reflejada sin esperar a la cola');
    pagina.liberarNegociacion();
    await pausa(200);
    const d = await pagina.diagnostico();
    assert.equal(d.canalDetalle, 'interrumpida', 'la bienvenida atrasada no reconfirma el canal');
    assert.notEqual(d.continuidad.estado, 'conectada');
    const r = await esperarFinRecuperacion(pagina);
    assert.notEqual(r.resultado, 'confirmada');
    assert.equal(d.terminado, false);
  });
});

test('R03-01: el callback tardío de un canal sustituido no invalida el canal vigente', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion, espectador } = await emisorConEspectador(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');
    // Primer reintento: apertura sin bienvenida, que se abandona al agotar la espera.
    pagina.decidirAperturaEventos(() => 'sin-bienvenida-tardia');
    pagina.pulsar('btn-reintentar');
    await esperarFinRecuperacion(pagina, LIMITES_RECUPERACION.bienvenidaMs + 3000);
    const abandonada = /** @type {any} */ (pagina.aperturasSinBienvenida.at(-1));
    // Segundo reintento con el servidor real: canal vigente confirmado.
    pagina.decidirAperturaEventos(() => null);
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 5000, 'oferta 2');
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).ok, true);
    // El canal abandonado termina ahora (EOF) y entrega un error tardío.
    abandonada.cerrar();
    await pausa(150);
    const d = await pagina.diagnostico();
    assert.equal(d.canalDetalle, 'conectada', 'el canal vigente sigue confirmado');
    assert.notEqual(d.continuidad.motivo, 'canal-perdido');
  });
});

test('R03-01: tras la interrupción, una recuperación posterior legítima exige evidencia nueva de progreso', async () => {
  await conServidor(async (ctx) => {
    const { pagina, retenido, flujo, espectador, sesion } = await emisorConColaOcupada(ctx, 'eof');
    await comprobarInvalidada(pagina);
    retenido.liberar();
    flujo.liberarServidor();
    await esperar(() => ctx.app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal anterior liberado');
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 5000, 'negociación nueva');
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).ok, true);
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc2.remoteDescription, 3000, 'respuesta aplicada');
    const lecturasAntes = pc2.lecturas;
    pc2.conectar();
    const r = await esperarFinRecuperacion(pagina);
    assert.equal(r.resultado, 'confirmada');
    assert.ok(pc2.lecturas >= lecturasAntes + 2, 'la confirmación usa lecturas nuevas de la conexión nueva');
    assert.equal((await pagina.diagnostico()).continuidad.estado, 'recuperacion-confirmada');
  });
});

test('R03-01: el fin conserva su prioridad y libera los recursos con la cola ocupada', async () => {
  await conServidor(async (ctx) => {
    const pagina = await ctx.abrir('/');
    const datos = await emisorConEspectador(pagina, ctx.participante);
    const retenido = retenerCandidatos(datos.pc);
    assert.equal((await datos.espectador.canal.enviar({ tipo: 'candidato', neg: 1, candidato: CANDIDATO })).ok, true);
    await esperar(() => retenido.llamadas === 1, 3000, 'cola ocupada');
    ctx.app.almacen.eliminar(datos.sesion, 'expirada');
    await esperar(() => pagina.visible('vista-final'), 1000, 'fin en el acto');
    assert.equal(pagina.pistasVivas(), 0);
    assert.equal((await pagina.diagnostico()).esperasPendientes, 0);
    retenido.liberar();
  });
});

test('R03-01 (investigación): la ausencia del espectador con la cola ocupada no deja una confirmación vigente', async () => {
  await conServidor(async (ctx) => {
    const pagina = await ctx.abrir('/');
    pagina.avanzarMedios(true);
    const datos = await emisorConEspectador(pagina, ctx.participante);
    const retenido = retenerCandidatos(datos.pc);
    assert.equal((await datos.espectador.canal.enviar({ tipo: 'candidato', neg: 1, candidato: CANDIDATO })).ok, true);
    await esperar(() => retenido.llamadas === 1, 3000, 'cola ocupada');
    pagina.pulsar('btn-reintentar');
    await pausa(100);
    assert.equal((await datos.espectador.canal.enviar({ tipo: 'salir' })).ok, true); // el par ausente queda en la cola
    await esperarFinRecuperacion(pagina, OPERACION_MS + 6000);
    // La cola se libera (por el límite de la operación o aquí) y se procesa la ausencia.
    retenido.liberar();
    await esperar(async () => (await pagina.diagnostico()).continuidad.motivo === 'participante-salio', OPERACION_MS + 2000, 'ausencia procesada');
    const d = await pagina.diagnostico();
    assert.notEqual(d.continuidad.estado, 'recuperacion-confirmada', 'con el espectador ausente no se muestra una confirmación vigente');
    assert.equal(d.terminado, false);
  });
});
