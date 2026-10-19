// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CanalSenalizacion, LIMITE_ENVIO_MS, crearLectorSse } from '../../public/senalizacion.js';

test('lee eventos SSE partidos en varios fragmentos e ignora comentarios', () => {
  /** @type {import('../../public/senalizacion.js').EventoSse[]} */
  const eventos = [];
  const leer = crearLectorSse((e) => eventos.push(e));
  leer(': conectado\n\nevent: bienv');
  leer('enida\ndata: {"rol":"emisor"}\n\n: latido\n\n');
  leer('event: senal\r\ndata: {"tipo":"oferta",\r\ndata: "sdp":"v=0"}\r\n\r\n');
  leer('data: {"sin":"nombre"}\n\n');
  assert.deepEqual(eventos, [
    { evento: 'bienvenida', datos: { rol: 'emisor' } },
    { evento: 'senal', datos: { tipo: 'oferta', sdp: 'v=0' } },
    { evento: 'message', datos: { sin: 'nombre' } },
  ]);
});

test('ignora datos que no son JSON y bloques incompletos', () => {
  /** @type {unknown[]} */
  const eventos = [];
  const leer = crearLectorSse((e) => eventos.push(e));
  leer('event: x\ndata: no-json\n\n');
  leer('event: y\ndata: {"a":1}\n');
  assert.deepEqual(eventos, []);
  leer('\n');
  assert.deepEqual(eventos, [{ evento: 'y', datos: { a: 1 } }]);
});

/** @param {typeof fetch} fetchPropio @param {number} [limiteEnvioMs] */
const canalCon = (fetchPropio, limiteEnvioMs) =>
  new CanalSenalizacion({ sesion: 's', token: 't', alEvento: () => {}, fetch: fetchPropio, limiteEnvioMs });

test('enviar cancela una petición sin respuesta al agotar su límite y lo informa como tiempo-agotado', async () => {
  let cancelada = false;
  const canal = canalCon(
    (_url, opciones) =>
      new Promise((_resolver, rechazar) => {
        opciones?.signal?.addEventListener('abort', () => {
          cancelada = true;
          rechazar(new DOMException('Cancelada.', 'AbortError'));
        });
      }),
    50,
  );
  const inicio = Date.now();
  assert.deepEqual(await canal.enviar({ tipo: 'fin' }), { ok: false, estadoHttp: 0, error: 'tiempo-agotado' });
  assert.equal(cancelada, true);
  assert.ok(Date.now() - inicio < 1000);
});

test('enviar distingue un fallo de red y devuelve la respuesta del servidor dentro del límite', async () => {
  const sinRed = canalCon(() => Promise.reject(new TypeError('fetch failed')), 50);
  assert.deepEqual(await sinRed.enviar({ tipo: 'fin' }), { ok: false, estadoHttp: 0, error: 'red' });
  const conRespuesta = canalCon(async () => Response.json({ error: 'sesion-inexistente' }, { status: 404 }), 50);
  assert.deepEqual(await conRespuesta.enviar({ tipo: 'fin' }), { ok: false, estadoHttp: 404, error: 'sesion-inexistente' });
});

test('el límite de envío por defecto es LIMITE_ENVIO_MS (3 s)', () => {
  assert.equal(LIMITE_ENVIO_MS, 3000);
  assert.equal(canalCon(globalThis.fetch).limiteEnvioMs, LIMITE_ENVIO_MS);
});
