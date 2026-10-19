// @ts-check
// Pruebas HTTP del servidor: aislamiento entre sesiones, roles, mensajes inválidos y limpieza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from '../../src/servidor.js';
import { LIMITES } from '../../src/validacion.js';
import { CanalSenalizacion, crearSesion } from '../../public/senalizacion.js';

const SDP = 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n';

/** @param {import('../../src/servidor.js').OpcionesServidor} [opciones] */
async function iniciar(opciones = {}) {
  const app = crearServidor({ barridoMs: 20, latidoMs: 50, ...opciones });
  const direccion = await app.escuchar(0, '127.0.0.1');
  return { app, base: `http://127.0.0.1:${direccion.port}` };
}

/** @param {string} base */
async function nuevaSesion(base) {
  const r = await crearSesion({ base });
  assert.equal(r.ok, true);
  return /** @type {{ sesion: string, tokenEmisor: string, tokenEspectador: string }} */ (/** @type {unknown} */ (r));
}

/**
 * @param {string} base
 * @param {string} sesion
 * @param {string} token
 */
function participante(base, sesion, token) {
  /** @type {import('../../public/senalizacion.js').EventoSse[]} */
  const eventos = [];
  /** @type {{ estado: string, detalle?: { estadoHttp?: number, error?: string } }[]} */
  const estados = [];
  const canal = new CanalSenalizacion({
    base,
    sesion,
    token,
    alEvento: (e) => eventos.push(e),
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
 * @param {string | null} token
 * @param {string} cuerpo
 * @param {Record<string, string>} [cabeceras]
 */
async function enviar(base, sesion, token, cuerpo, cabeceras = {}) {
  /** @type {Record<string, string>} */
  const h = { 'Content-Type': 'application/json', ...cabeceras };
  if (token) h.Authorization = `Bearer ${token}`;
  const r = await fetch(`${base}/api/sesiones/${sesion}/senales`, { method: 'POST', headers: h, body: cuerpo });
  return { estado: r.status, cuerpo: await r.json().catch(() => null) };
}

/** @param {{ eventos: { evento: string, datos: any }[] }} p @param {string} evento */
const recibido = (p, evento) => p.eventos.find((e) => e.evento === evento);

test('reenvía oferta, respuesta y candidatos entre los dos roles de la misma sesión', async () => {
  const { app, base } = await iniciar();
  try {
    const s = await nuevaSesion(base);
    const emisor = participante(base, s.sesion, s.tokenEmisor);
    const bienvenidaEmisor = await esperar(() => recibido(emisor, 'bienvenida'));
    assert.deepEqual(/** @type {any} */ (bienvenidaEmisor.datos).rol, 'emisor');
    assert.equal(/** @type {any} */ (bienvenidaEmisor.datos).parPresente, false);

    const espectador = participante(base, s.sesion, s.tokenEspectador);
    const bienvenida = await esperar(() => recibido(espectador, 'bienvenida'));
    assert.equal(/** @type {any} */ (bienvenida.datos).rol, 'espectador');
    assert.equal(/** @type {any} */ (bienvenida.datos).parPresente, true);
    await esperar(() => emisor.eventos.find((e) => e.evento === 'par' && /** @type {any} */ (e.datos).presente));

    const r1 = await enviar(base, s.sesion, s.tokenEmisor, JSON.stringify({ tipo: 'oferta', sdp: SDP, extra: 'x' }));
    assert.equal(r1.estado, 200);
    const oferta = await esperar(() => recibido(espectador, 'senal'));
    assert.deepEqual(oferta.datos, { tipo: 'oferta', sdp: SDP }, 'solo se reenvían campos conocidos');

    const r2 = await enviar(base, s.sesion, s.tokenEspectador, JSON.stringify({ tipo: 'respuesta', sdp: SDP }));
    assert.equal(r2.estado, 200);
    const respuesta = await esperar(() => recibido(emisor, 'senal'));
    assert.deepEqual(respuesta.datos, { tipo: 'respuesta', sdp: SDP });

    const candidato = { candidate: 'candidate:1 1 udp 1 127.0.0.1 5000 typ host', sdpMid: '0', sdpMLineIndex: 0 };
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, JSON.stringify({ tipo: 'candidato', candidato }))).estado, 200);
    await esperar(() => espectador.eventos.filter((e) => e.evento === 'senal').length === 2);
    emisor.canal.cerrar();
    espectador.canal.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('aísla las sesiones: el token de otra sesión no sirve ni para enviar ni para escuchar', async () => {
  const { app, base } = await iniciar();
  try {
    const a = await nuevaSesion(base);
    const b = await nuevaSesion(base);
    const espectadorB = participante(base, b.sesion, b.tokenEspectador);
    await esperar(() => recibido(espectadorB, 'bienvenida'));

    const cruzada = await enviar(base, b.sesion, a.tokenEmisor, JSON.stringify({ tipo: 'oferta', sdp: SDP }));
    assert.deepEqual(cruzada, { estado: 403, cuerpo: { error: 'token-no-valido-para-la-sesion' } });

    const intruso = participante(base, b.sesion, a.tokenEmisor);
    await intruso.fin;
    assert.deepEqual(intruso.estados.at(-1), {
      estado: 'error',
      detalle: { estadoHttp: 403, error: 'token-no-valido-para-la-sesion' },
    });
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(espectadorB.eventos.filter((e) => e.evento === 'senal').length, 0);
    assert.equal(espectadorB.eventos.filter((e) => e.evento === 'par').length, 0);
    espectadorB.canal.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('restringe las señales según el rol del token', async () => {
  const { app, base } = await iniciar();
  try {
    const s = await nuevaSesion(base);
    const casos = [
      [s.tokenEspectador, { tipo: 'oferta', sdp: SDP }],
      [s.tokenEmisor, { tipo: 'respuesta', sdp: SDP }],
      [s.tokenEmisor, { tipo: 'salir' }],
      [s.tokenEspectador, { tipo: 'fin' }],
    ];
    for (const [token, senal] of casos) {
      const r = await enviar(base, s.sesion, /** @type {string} */ (token), JSON.stringify(senal));
      assert.deepEqual(r, { estado: 403, cuerpo: { error: 'tipo-no-permitido-para-el-rol' } }, JSON.stringify(senal));
    }
  } finally {
    await app.cerrar();
  }
});

test('rechaza peticiones y mensajes inválidos o demasiado grandes', async () => {
  const { app, base } = await iniciar();
  try {
    const s = await nuevaSesion(base);
    const t = s.tokenEmisor;
    const oferta = JSON.stringify({ tipo: 'oferta', sdp: SDP });
    assert.equal((await enviar(base, s.sesion, null, oferta)).estado, 401);
    assert.equal((await enviar(base, s.sesion, 'corto', oferta)).estado, 401);
    assert.equal((await enviar(base, 'no-es-un-id', t, oferta)).estado, 404);
    assert.equal((await enviar(base, 'A'.repeat(22), t, oferta)).estado, 404);
    assert.deepEqual(await enviar(base, s.sesion, t, '{no json'), { estado: 400, cuerpo: { error: 'json-invalido' } });
    assert.equal((await enviar(base, s.sesion, t, '[]')).estado, 400);
    assert.equal((await enviar(base, s.sesion, t, JSON.stringify({ tipo: 'chat', texto: 'hola' }))).estado, 400);
    assert.equal((await enviar(base, s.sesion, t, JSON.stringify({ tipo: 'oferta', sdp: 'hola' }))).estado, 400);
    const sdpLargo = JSON.stringify({ tipo: 'oferta', sdp: 'v=0' + 'a'.repeat(LIMITES.sdpMaxCaracteres) });
    assert.equal((await enviar(base, s.sesion, t, sdpLargo)).estado, 400);
    assert.equal((await enviar(base, s.sesion, t, oferta, { 'Content-Type': 'text/plain' })).estado, 415);
    const enorme = JSON.stringify({ tipo: 'oferta', sdp: 'v=0' + 'a'.repeat(LIMITES.cuerpoMaxBytes) });
    assert.deepEqual(await enviar(base, s.sesion, t, enorme), {
      estado: 413,
      cuerpo: { error: 'mensaje-demasiado-grande' },
    });
    const get = await fetch(`${base}/api/sesiones/${s.sesion}/senales`, { headers: { Authorization: `Bearer ${t}` } });
    assert.equal(get.status, 405);
    assert.equal((await fetch(`${base}/api/sesiones`)).status, 405);
  } finally {
    await app.cerrar();
  }
});

test('admite un solo canal por rol y rechaza señales sin par conectado', async () => {
  const { app, base } = await iniciar();
  try {
    const s = await nuevaSesion(base);
    const emisor = participante(base, s.sesion, s.tokenEmisor);
    await esperar(() => recibido(emisor, 'bienvenida'));
    const duplicado = participante(base, s.sesion, s.tokenEmisor);
    await duplicado.fin;
    assert.deepEqual(duplicado.estados.at(-1), { estado: 'error', detalle: { estadoHttp: 409, error: 'rol-ya-conectado' } });

    const sinPar = await enviar(base, s.sesion, s.tokenEmisor, JSON.stringify({ tipo: 'oferta', sdp: SDP }));
    assert.deepEqual(sinPar, { estado: 409, cuerpo: { error: 'par-ausente' } });
    emisor.canal.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('avisa al desconectarse el espectador y limpia la sesión abandonada', async () => {
  const { app, base } = await iniciar({ sesiones: { inactividadMs: 100 } });
  try {
    const s = await nuevaSesion(base);
    const emisor = participante(base, s.sesion, s.tokenEmisor);
    const espectador = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(espectador, 'bienvenida'));
    espectador.canal.cerrar();
    await esperar(() => emisor.eventos.find((e) => e.evento === 'par' && /** @type {any} */ (e.datos).presente === false));

    // El espectador puede volver a entrar mientras la sesión sigue viva.
    const otraVez = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(otraVez, 'bienvenida'));
    otraVez.canal.cerrar();
    emisor.canal.cerrar();

    await esperar(() => app.almacen.tamano === 0, 2000);
    const tarde = await enviar(base, s.sesion, s.tokenEmisor, JSON.stringify({ tipo: 'fin' }));
    assert.equal(tarde.estado, 404);
  } finally {
    await app.cerrar();
  }
});

test('el fin del emisor cierra la sesión para ambos y la salida del espectador la mantiene', async () => {
  const { app, base } = await iniciar();
  try {
    const s = await nuevaSesion(base);
    const emisor = participante(base, s.sesion, s.tokenEmisor);
    const espectador = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(espectador, 'bienvenida'));

    assert.equal((await enviar(base, s.sesion, s.tokenEspectador, JSON.stringify({ tipo: 'salir' }))).estado, 200);
    const finEspectador = await esperar(() => recibido(espectador, 'fin'));
    assert.deepEqual(finEspectador.datos, { motivo: 'salida-del-espectador' });
    await espectador.fin;
    await esperar(() => emisor.eventos.find((e) => e.evento === 'par' && /** @type {any} */ (e.datos).presente === false));
    assert.equal(app.almacen.tamano, 1);

    const vuelve = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(vuelve, 'bienvenida'));
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, JSON.stringify({ tipo: 'fin' }))).estado, 200);
    const finVuelve = await esperar(() => recibido(vuelve, 'fin'));
    assert.deepEqual(finVuelve.datos, { motivo: 'finalizada-por-el-emisor' });
    await vuelve.fin;
    await emisor.fin;
    assert.equal(vuelve.estados.at(-1)?.estado, 'cerrada');
    assert.equal(app.almacen.tamano, 0);
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, JSON.stringify({ tipo: 'fin' }))).estado, 404);
  } finally {
    await app.cerrar();
  }
});

test('caduca la sesión, limita su número y el ritmo de señales', async () => {
  const { app, base } = await iniciar({ sesiones: { duracionMaxMs: 500, maxSesiones: 2, maxSenalesPorMinuto: 2 } });
  try {
    const s = await nuevaSesion(base);
    await nuevaSesion(base);
    const tercera = await fetch(`${base}/api/sesiones`, { method: 'POST' });
    assert.equal(tercera.status, 503);

    const emisor = participante(base, s.sesion, s.tokenEmisor);
    const espectador = participante(base, s.sesion, s.tokenEspectador);
    await esperar(() => recibido(espectador, 'bienvenida'));
    const oferta = JSON.stringify({ tipo: 'oferta', sdp: SDP });
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, oferta)).estado, 200);
    assert.equal((await enviar(base, s.sesion, s.tokenEmisor, oferta)).estado, 200);
    assert.deepEqual(await enviar(base, s.sesion, s.tokenEmisor, oferta), {
      estado: 429,
      cuerpo: { error: 'demasiadas-senales' },
    });

    const fin = await esperar(() => recibido(emisor, 'fin'), 2000);
    assert.deepEqual(fin.datos, { motivo: 'expirada' });
    await esperar(() => recibido(espectador, 'fin'));
  } finally {
    await app.cerrar();
  }
});

test('sirve solo los archivos públicos, con cabeceras de seguridad', async () => {
  const { app, base } = await iniciar();
  try {
    const inicio = await fetch(`${base}/`);
    assert.equal(inicio.status, 200);
    assert.match(inicio.headers.get('content-type') ?? '', /^text\/html/);
    assert.match(inicio.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    assert.equal(inicio.headers.get('permissions-policy'), 'camera=(self), microphone=(self)');
    assert.equal(inicio.headers.get('x-content-type-options'), 'nosniff');
    assert.equal((await fetch(`${base}/app.js`)).headers.get('content-type'), 'text/javascript; charset=utf-8');
    for (const ruta of ['/package.json', '/src/servidor.js', '/%2e%2e/package.json', '/public/app.js', '/api/otra']) {
      assert.equal((await fetch(`${base}${ruta}`)).status, 404, ruta);
    }
    assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
  } finally {
    await app.cerrar();
  }
});

test('al detener el servidor se avisa a los participantes y se cierran las sesiones', async () => {
  const { app, base } = await iniciar();
  const s = await nuevaSesion(base);
  const emisor = participante(base, s.sesion, s.tokenEmisor);
  await esperar(() => recibido(emisor, 'bienvenida'));
  await app.cerrar();
  await emisor.fin;
  assert.deepEqual(recibido(emisor, 'fin')?.datos, { motivo: 'servidor-detenido' });
  assert.equal(app.almacen.tamano, 0);
});
