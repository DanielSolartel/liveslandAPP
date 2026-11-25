// @ts-check
// Cliente de señalización (public/senalizacion.js) ante interrupciones (E03): cierre intencional frente a
// interrupción, EOF inesperado, fallo de lectura, límite de apertura, errores HTTP y eventos tardíos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CanalSenalizacion, categoriaCanal, LIMITE_APERTURA_MS } from '../../public/senalizacion.js';

const SESION = 'A'.repeat(22);
const TOKEN = 'B'.repeat(43);
const codificador = new TextEncoder();

/** Flujo SSE que controla la prueba. */
function flujoControlado() {
  /** @type {ReadableStreamDefaultController<Uint8Array>} */
  let control = /** @type {any} */ (null);
  const cuerpo = new ReadableStream({
    start(c) {
      control = c;
    },
  });
  return {
    respuesta: new Response(cuerpo, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    /** @param {string} evento @param {unknown} datos */
    enviar: (evento, datos) => control.enqueue(codificador.encode(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`)),
    terminar: () => control.close(),
    romper: () => control.error(new TypeError('network error')),
  };
}

/**
 * @param {(url: string, opciones: RequestInit) => Promise<Response>} fetchPrueba
 * @param {Partial<ConstructorParameters<typeof CanalSenalizacion>[0]>} [extra]
 */
function canalCon(fetchPrueba, extra = {}) {
  /** @type {{ estado: string, detalle?: any }[]} */
  const estados = [];
  /** @type {{ evento: string, datos: unknown }[]} */
  const eventos = [];
  const canal = new CanalSenalizacion({
    sesion: SESION,
    token: TOKEN,
    base: 'http://prueba.invalid',
    fetch: /** @type {typeof fetch} */ (/** @type {unknown} */ (fetchPrueba)),
    alEvento: (e) => eventos.push(e),
    alEstado: (estado, detalle) => estados.push({ estado, detalle }),
    ...extra,
  });
  return { canal, estados, eventos };
}

test('EOF inesperado (sin fin del servidor): interrumpida, no cerrada', async () => {
  const f = flujoControlado();
  const { canal, estados, eventos } = canalCon(async () => f.respuesta);
  const abierto = canal.abrir();
  await new Promise((r) => setTimeout(r, 10));
  f.enviar('bienvenida', { rol: 'emisor' });
  f.terminar();
  await abierto;
  assert.deepEqual(estados.map((e) => e.estado), ['conectando', 'conectada', 'interrumpida']);
  assert.equal(estados.at(-1)?.detalle.error, 'fin-inesperado');
  assert.equal(categoriaCanal(estados.at(-1)?.detalle), 'fin-inesperado');
  assert.equal(eventos.length, 1);
});

test('el servidor termina el flujo tras enviar fin: cierre normal', async () => {
  const f = flujoControlado();
  const { canal, estados } = canalCon(async () => f.respuesta);
  const abierto = canal.abrir();
  await new Promise((r) => setTimeout(r, 10));
  f.enviar('fin', { motivo: 'expirada' });
  f.terminar();
  await abierto;
  assert.deepEqual(estados.map((e) => e.estado), ['conectando', 'conectada', 'cerrada']);
});

test('un fallo de lectura es una interrupción, no un error de apertura', async () => {
  const f = flujoControlado();
  const { canal, estados } = canalCon(async () => f.respuesta);
  const abierto = canal.abrir();
  await new Promise((r) => setTimeout(r, 10));
  f.romper();
  await abierto;
  assert.deepEqual(estados.map((e) => e.estado), ['conectando', 'conectada', 'interrumpida']);
  assert.equal(estados.at(-1)?.detalle.error, 'flujo-interrumpido');
});

test('tras cerrar() no llegan estados ni eventos tardíos, aunque el flujo siga entregando datos', async () => {
  const f = flujoControlado();
  const { canal, estados, eventos } = canalCon(async () => f.respuesta);
  const abierto = canal.abrir();
  await new Promise((r) => setTimeout(r, 10));
  canal.cerrar();
  try {
    f.enviar('senal', { tipo: 'oferta' });
    f.terminar();
  } catch {
    // el flujo puede estar ya cancelado
  }
  await abierto;
  assert.deepEqual(estados.map((e) => e.estado), ['conectando', 'conectada'], 'ni interrumpida ni cerrada');
  assert.equal(eventos.length, 0);
});

test('cerrar durante una apertura pendiente cancela la petición sin comunicar nada', async () => {
  /** @type {AbortSignal | undefined} */
  let senal;
  const { canal, estados } = canalCon(
    (_url, opciones) =>
      new Promise((_resolve, reject) => {
        senal = /** @type {AbortSignal} */ (opciones.signal);
        senal.addEventListener('abort', () => reject(new DOMException('cancelada', 'AbortError')));
      }),
  );
  const abierto = canal.abrir();
  canal.cerrar();
  await abierto;
  assert.equal(senal?.aborted, true);
  assert.deepEqual(estados.map((e) => e.estado), ['conectando']);
});

test('una apertura sin respuesta se cancela al agotar su límite y lo informa como tiempo-agotado', async () => {
  assert.equal(LIMITE_APERTURA_MS, 5000);
  /** @type {AbortSignal | undefined} */
  let senal;
  const { canal, estados } = canalCon(
    (_url, opciones) =>
      new Promise((_resolve, reject) => {
        senal = /** @type {AbortSignal} */ (opciones.signal);
        senal.addEventListener('abort', () => reject(new DOMException('cancelada', 'AbortError')));
      }),
    { limiteAperturaMs: 30 },
  );
  await canal.abrir();
  assert.equal(senal?.aborted, true);
  assert.deepEqual(estados.at(-1), { estado: 'error', detalle: { error: 'tiempo-agotado' } });
  assert.equal(categoriaCanal(estados.at(-1)?.detalle), 'tiempo-agotado');
});

test('errores HTTP y de red se comunican con su categoría de lista cerrada', async () => {
  // E03-R01-04: un 409 con un código que no es `rol-ya-conectado` es un conflicto genérico; el rol ocupado se
  // comprueba con el código real del servidor en revision-r01.test.js.
  /** @type {[number | 'red', string][]} */
  const casos = [
    [401, 'no-autorizado'],
    [403, 'no-autorizado'],
    [404, 'sesion-inexistente'],
    [409, 'conflicto'],
    [429, 'limite-senales'],
    [500, 'http-otro'],
    ['red', 'red'],
  ];
  for (const [respuesta, categoria] of casos) {
    const { canal, estados } = canalCon(async () => {
      if (respuesta === 'red') throw new TypeError('fetch failed');
      return new Response(JSON.stringify({ error: 'algo', detalle: { anidado: true } }), { status: respuesta });
    });
    await canal.abrir();
    const ultimo = estados.at(-1);
    assert.equal(ultimo?.estado, 'error', String(respuesta));
    assert.equal(categoriaCanal(ultimo?.detalle), categoria, String(respuesta));
    if (respuesta !== 'red') assert.deepEqual(ultimo?.detalle, { estadoHttp: respuesta, error: 'algo' }, 'solo cadenas del cuerpo');
  }
  // Un cuerpo de error que no es una cadena no se copia.
  const { canal, estados } = canalCon(async () => new Response(JSON.stringify({ error: { token: TOKEN } }), { status: 409 }));
  await canal.abrir();
  assert.deepEqual(estados.at(-1)?.detalle, { estadoHttp: 409, error: undefined });
});

test('un canal se abre una sola vez: reabrir es crear otro canal', async () => {
  let aperturas = 0;
  const f = flujoControlado();
  const { canal } = canalCon(async () => {
    aperturas += 1;
    return f.respuesta;
  });
  const a = canal.abrir();
  const b = canal.abrir();
  await new Promise((r) => setTimeout(r, 10));
  f.terminar();
  await Promise.all([a, b]);
  assert.equal(aperturas, 1);
});

test('categoriaCanal: valores desconocidos se reducen a red, sin copiar el texto recibido', () => {
  assert.equal(categoriaCanal(undefined), 'red');
  assert.equal(categoriaCanal({ error: 'mensaje arbitrario con TOKEN' }), 'red');
  assert.equal(categoriaCanal({ estadoHttp: 0, error: 'tiempo-agotado' }), 'tiempo-agotado');
});
