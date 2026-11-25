// @ts-check
// Contrato de señalización de E03 en el servidor real: identificador de negociación opcional y acotado,
// solicitud de oferta solo del espectador, motivo de ausencia del otro participante, reapertura dentro de la
// misma sesión sin alargar su caducidad, rol ocupado y sesiones caducadas no recuperables.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from '../../src/servidor.js';
import { LIMITES, TIPOS_POR_ROL, validarSenal } from '../../src/validacion.js';
import { CanalSenalizacion, crearSesion } from '../../public/senalizacion.js';

const SDP = 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n';
const CANDIDATO = { candidate: 'candidate:1 1 udp 1 127.0.0.1 9 typ host', sdpMid: '0', sdpMLineIndex: 0, usernameFragment: null };

/** @param {import('../../src/servidor.js').OpcionesServidor} [opciones] */
async function iniciar(opciones = {}) {
  const app = crearServidor({ barridoMs: 20, latidoMs: 50, ...opciones });
  const direccion = await app.escuchar(0, '127.0.0.1');
  return { app, base: `http://127.0.0.1:${direccion.port}` };
}

/**
 * @param {string} base
 * @param {string} sesion
 * @param {string} token
 */
function participante(base, sesion, token) {
  /** @type {{ evento: string, datos: any }[]} */
  const eventos = [];
  /** @type {{ estado: string, detalle?: { estadoHttp?: number, error?: string } }[]} */
  const estados = [];
  const canal = new CanalSenalizacion({
    base,
    sesion,
    token,
    alEvento: (e) => eventos.push(/** @type {any} */ (e)),
    alEstado: (estado, detalle) => estados.push({ estado, detalle }),
  });
  const fin = canal.abrir();
  return { canal, eventos, estados, fin };
}

/**
 * @template T
 * @param {() => T} condicion
 * @param {number} [ms]
 * @returns {Promise<NonNullable<T>>}
 */
async function esperar(condicion, ms = 3000) {
  const limite = Date.now() + ms;
  for (;;) {
    const valor = condicion();
    if (valor) return /** @type {NonNullable<T>} */ (valor);
    if (Date.now() > limite) throw new Error('Tiempo de espera agotado');
    await new Promise((r) => setTimeout(r, 10));
  }
}

/**
 * @param {string} base
 * @param {string} sesion
 * @param {string} token
 * @param {unknown} senal
 */
async function enviar(base, sesion, token, senal) {
  const r = await fetch(`${base}/api/sesiones/${sesion}/senales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(senal),
  });
  return { estado: r.status, cuerpo: await r.json().catch(() => null) };
}

/** @param {{ eventos: { evento: string, datos: any }[] }} p @param {string} evento @param {(d: any) => boolean} [filtro] */
const recibido = (p, evento, filtro = () => true) => p.eventos.find((e) => e.evento === evento && filtro(e.datos));

test('validación: el identificador de negociación es opcional, entero y acotado, y nunca se reenvía otra cosa', () => {
  assert.deepEqual(validarSenal('emisor', { tipo: 'oferta', sdp: SDP, neg: 7, extra: 'x' }), { ok: true, senal: { tipo: 'oferta', sdp: SDP, neg: 7 } });
  assert.deepEqual(validarSenal('espectador', { tipo: 'respuesta', sdp: SDP, neg: LIMITES.negociacionMax }), {
    ok: true,
    senal: { tipo: 'respuesta', sdp: SDP, neg: LIMITES.negociacionMax },
  });
  assert.deepEqual(validarSenal('emisor', { tipo: 'candidato', candidato: CANDIDATO, neg: 1 }), {
    ok: true,
    senal: { tipo: 'candidato', candidato: CANDIDATO, neg: 1 },
  });
  // Sin `neg`: compatible con el contrato anterior.
  assert.deepEqual(validarSenal('emisor', { tipo: 'oferta', sdp: SDP }), { ok: true, senal: { tipo: 'oferta', sdp: SDP } });
  for (const neg of [0, -1, 1.5, LIMITES.negociacionMax + 1, '1', null, {}, [], Number.NaN, Infinity]) {
    assert.deepEqual(validarSenal('emisor', { tipo: 'oferta', sdp: SDP, neg }), { ok: false, estado: 400, error: 'negociacion-invalida' }, String(neg));
  }
  // `neg` no viaja en las señales que no negocian.
  assert.deepEqual(validarSenal('emisor', { tipo: 'fin', neg: 3 }), { ok: true, senal: { tipo: 'fin' } });
});

test('validación: solo el espectador puede pedir una oferta y la solicitud no lleva datos', () => {
  assert.ok(TIPOS_POR_ROL.espectador.includes('solicitud-oferta'));
  assert.ok(!TIPOS_POR_ROL.emisor.includes('solicitud-oferta'));
  assert.ok(!TIPOS_POR_ROL.espectador.includes('oferta'), 'el espectador sigue sin poder ofrecer');
  assert.deepEqual(validarSenal('espectador', { tipo: 'solicitud-oferta', sdp: SDP, neg: 2 }), { ok: true, senal: { tipo: 'solicitud-oferta' } });
  assert.deepEqual(validarSenal('emisor', { tipo: 'solicitud-oferta' }), { ok: false, estado: 403, error: 'tipo-no-permitido-para-el-rol' });
});

test('servidor: reenvía neg y la solicitud de oferta, y rechaza una solicitud del emisor', async () => {
  const { app, base } = await iniciar();
  try {
    const s = /** @type {any} */ (await crearSesion({ base }));
    const emisor = participante(base, s.sesion, s.tokenEmisor);
    const espectador = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(emisor, 'par', (d) => d.presente));
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, { tipo: 'oferta', sdp: SDP, neg: 5 })).estado, 200);
    assert.deepEqual((await esperar(() => recibido(espectador, 'senal'))).datos, { tipo: 'oferta', sdp: SDP, neg: 5 });
    assert.equal((await enviar(base, s.sesion, s.tokenEspectador, { tipo: 'solicitud-oferta' })).estado, 200);
    assert.deepEqual((await esperar(() => recibido(emisor, 'senal', (d) => d.tipo === 'solicitud-oferta'))).datos, { tipo: 'solicitud-oferta' });
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, { tipo: 'solicitud-oferta' })).estado, 403);
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, { tipo: 'oferta', sdp: SDP, neg: 0 })).estado, 400);
    emisor.canal.cerrar();
    espectador.canal.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('servidor: la ausencia del otro participante distingue salida registrada de desconexión', async () => {
  const { app, base } = await iniciar();
  try {
    const s = /** @type {any} */ (await crearSesion({ base }));
    const emisor = participante(base, s.sesion, s.tokenEmisor);
    const a = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(emisor, 'par', (d) => d.presente));
    a.canal.cerrar(); // el flujo se cierra sin salida registrada
    const desconexion = await esperar(() => recibido(emisor, 'par', (d) => d.presente === false));
    assert.deepEqual(desconexion.datos, { presente: false, motivo: 'desconexion' });
    const b = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => emisor.eventos.filter((e) => e.evento === 'par' && e.datos.presente).length === 2);
    assert.equal((await enviar(base, s.sesion, s.tokenEspectador, { tipo: 'salir' })).estado, 200);
    await esperar(() => emisor.eventos.filter((e) => e.evento === 'par' && e.datos.presente === false).length === 2);
    assert.deepEqual(emisor.eventos.filter((e) => e.evento === 'par').at(-1)?.datos, { presente: false, motivo: 'salida' });
    await b.fin;
    emisor.canal.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('servidor: reabrir la señalización mantiene la sesión, los roles y su caducidad; el rol ocupado sigue rechazado', async () => {
  let ahora = 1_000_000;
  const { app, base } = await iniciar({ sesiones: { ahora: () => ahora } });
  try {
    const s = /** @type {any} */ (await crearSesion({ base }));
    const original = app.almacen.obtener(s.sesion)?.expiraEn;
    const primero = participante(base, s.sesion, s.tokenEmisor);
    const bienvenida1 = await esperar(() => recibido(primero, 'bienvenida'));
    // Mientras el canal sigue registrado, otro canal del mismo rol recibe 409 y no expulsa al primero.
    const duplicado = participante(base, s.sesion, s.tokenEmisor);
    await duplicado.fin;
    assert.deepEqual(duplicado.estados.at(-1), { estado: 'error', detalle: { estadoHttp: 409, error: 'rol-ya-conectado' } });
    assert.ok(app.almacen.obtener(s.sesion)?.canales.emisor, 'el canal original sigue registrado');
    primero.canal.cerrar();
    await esperar(() => app.almacen.obtener(s.sesion)?.canales.emisor === null);
    ahora += 10_000;
    const segundo = participante(base, s.sesion, s.tokenEmisor);
    const bienvenida2 = await esperar(() => recibido(segundo, 'bienvenida'));
    assert.equal(bienvenida2.datos.expiraEn, bienvenida1.datos.expiraEn, 'reabrir no alarga la vida de la sesión');
    assert.equal(app.almacen.obtener(s.sesion)?.expiraEn, original);
    assert.equal(app.almacen.tamano, 1, 'no se crea otra sesión');
    segundo.canal.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('servidor: una sesión caducada o finalizada no se puede reabrir', async () => {
  let ahora = 1_000_000;
  const { app, base } = await iniciar({ sesiones: { ahora: () => ahora, duracionMaxMs: 60_000 } });
  try {
    const s = /** @type {any} */ (await crearSesion({ base }));
    ahora += 60_000;
    const tarde = participante(base, s.sesion, s.tokenEmisor);
    await tarde.fin;
    assert.deepEqual(tarde.estados.at(-1), { estado: 'error', detalle: { estadoHttp: 404, error: 'sesion-inexistente' } });
    const t = /** @type {any} */ (await crearSesion({ base }));
    assert.equal((await enviar(base, t.sesion, t.tokenEmisor, { tipo: 'fin' })).estado, 200);
    const despues = participante(base, t.sesion, t.tokenEmisor);
    await despues.fin;
    assert.equal(despues.estados.at(-1)?.detalle?.estadoHttp, 404);
    const conOtroToken = participante(base, t.sesion, s.tokenEspectador);
    await conOtroToken.fin;
    assert.equal(conOtroToken.estados.at(-1)?.detalle?.estadoHttp, 404);
  } finally {
    await app.cerrar();
  }
});

test('servidor: sirve los dos módulos nuevos con las mismas cabeceras y nada más', async () => {
  const { app, base } = await iniciar();
  try {
    for (const ruta of ['/cronologia.js', '/continuidad.js']) {
      const r = await fetch(`${base}${ruta}`);
      assert.equal(r.status, 200, ruta);
      assert.equal(r.headers.get('content-type'), 'text/javascript; charset=utf-8');
      assert.match(r.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    }
    for (const ruta of ['/public/cronologia.js', '/pruebas/unidad/cronologia.test.js', '/continuidad.test.js', '/cronologia.js/']) {
      assert.equal((await fetch(`${base}${ruta}`)).status, 404, ruta);
    }
  } finally {
    await app.cerrar();
  }
});
