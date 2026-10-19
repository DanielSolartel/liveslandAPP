// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITES, validarSenal } from '../../src/validacion.js';

const SDP = 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n';

test('acepta las señales de cada rol y devuelve solo los campos conocidos', () => {
  const oferta = validarSenal('emisor', { tipo: 'oferta', sdp: SDP, extra: 'no se reenvía' });
  assert.deepEqual(oferta, { ok: true, senal: { tipo: 'oferta', sdp: SDP } });

  const respuesta = validarSenal('espectador', { tipo: 'respuesta', sdp: SDP });
  assert.deepEqual(respuesta, { ok: true, senal: { tipo: 'respuesta', sdp: SDP } });

  const candidato = validarSenal('emisor', {
    tipo: 'candidato',
    candidato: { candidate: 'candidate:1 1 udp 1 127.0.0.1 5000 typ host', sdpMid: '0', sdpMLineIndex: 0, otro: 1 },
  });
  assert.deepEqual(candidato, {
    ok: true,
    senal: {
      tipo: 'candidato',
      candidato: {
        candidate: 'candidate:1 1 udp 1 127.0.0.1 5000 typ host',
        sdpMid: '0',
        sdpMLineIndex: 0,
        usernameFragment: null,
      },
    },
  });

  assert.deepEqual(validarSenal('emisor', { tipo: 'fin', motivo: 'x' }), { ok: true, senal: { tipo: 'fin' } });
  assert.deepEqual(validarSenal('espectador', { tipo: 'salir' }), { ok: true, senal: { tipo: 'salir' } });
});

test('restringe los tipos de señal por rol', () => {
  assert.deepEqual(validarSenal('espectador', { tipo: 'oferta', sdp: SDP }), {
    ok: false,
    estado: 403,
    error: 'tipo-no-permitido-para-el-rol',
  });
  assert.equal(validarSenal('emisor', { tipo: 'respuesta', sdp: SDP }).ok, false);
  assert.equal(validarSenal('emisor', { tipo: 'salir' }).ok, false);
  assert.equal(validarSenal('espectador', { tipo: 'fin' }).ok, false);
});

test('rechaza estructuras y valores inválidos', () => {
  for (const valor of [null, [], 'texto', 3, {}, { tipo: 7 }]) {
    assert.deepEqual(validarSenal('emisor', valor), { ok: false, estado: 400, error: 'senal-invalida' });
  }
  assert.equal(/** @type {any} */ (validarSenal('emisor', { tipo: 'chat' })).error, 'tipo-desconocido');
  assert.equal(/** @type {any} */ (validarSenal('emisor', { tipo: 'oferta' })).error, 'sdp-invalido');
  assert.equal(/** @type {any} */ (validarSenal('emisor', { tipo: 'oferta', sdp: 'hola' })).error, 'sdp-invalido');
  const sdpLargo = 'v=0' + 'a'.repeat(LIMITES.sdpMaxCaracteres);
  assert.equal(/** @type {any} */ (validarSenal('emisor', { tipo: 'oferta', sdp: sdpLargo })).error, 'sdp-invalido');

  const malos = [
    { candidate: 3, sdpMid: '0', sdpMLineIndex: 0 },
    { candidate: 'x'.repeat(LIMITES.candidatoMaxCaracteres + 1), sdpMid: '0', sdpMLineIndex: 0 },
    { candidate: 'c', sdpMid: '0', sdpMLineIndex: -1 },
    { candidate: 'c', sdpMid: '0', sdpMLineIndex: 1.5 },
    { candidate: 'c', sdpMid: 'x'.repeat(LIMITES.sdpMidMaxCaracteres + 1), sdpMLineIndex: 0 },
    { candidate: 'c', sdpMid: '0', sdpMLineIndex: 0, usernameFragment: 5 },
  ];
  for (const candidato of malos) {
    assert.equal(
      /** @type {any} */ (validarSenal('emisor', { tipo: 'candidato', candidato })).error,
      'candidato-invalido',
    );
  }
  assert.equal(/** @type {any} */ (validarSenal('emisor', { tipo: 'candidato' })).error, 'candidato-invalido');
});
