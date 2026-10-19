// @ts-check
// Manejo de permisos, API ausente y liberación de medios, con dobles de MediaStream.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capturaDisponible, contarPistasActivas, liberarMedios, solicitarMedios } from '../../public/medios.js';

/** @param {string} kind */
function pista(kind) {
  return {
    kind,
    readyState: 'live',
    paradas: 0,
    stop() {
      this.readyState = 'ended';
      this.paradas += 1;
    },
  };
}

/** @param {ReturnType<typeof pista>[]} pistas */
function flujo(pistas) {
  return { getTracks: () => pistas };
}

/**
 * @param {(r: MediaStreamConstraints) => Promise<any>} getUserMedia
 * @param {boolean} [seguro]
 */
function entorno(getUserMedia, seguro = true) {
  /** @type {MediaStreamConstraints[]} */
  const llamadas = [];
  return {
    llamadas,
    entorno: {
      isSecureContext: seguro,
      mediaDevices: {
        getUserMedia: (/** @type {MediaStreamConstraints} */ r) => {
          llamadas.push(r);
          return getUserMedia(r);
        },
      },
    },
  };
}

test('detecta un contexto inseguro y la API ausente sin pedir permisos', async () => {
  assert.deepEqual(capturaDisponible({ isSecureContext: false, mediaDevices: {} }), {
    disponible: false,
    codigo: 'contexto-inseguro',
  });
  assert.deepEqual(capturaDisponible({ isSecureContext: true }), { disponible: false, codigo: 'api-ausente' });
  assert.deepEqual(capturaDisponible({ isSecureContext: true, mediaDevices: {} }), {
    disponible: false,
    codigo: 'api-ausente',
  });

  const { entorno: inseguro, llamadas } = entorno(async () => flujo([]), false);
  const r = await solicitarMedios(inseguro);
  assert.equal(r.ok, false);
  assert.equal(/** @type {any} */ (r).codigo, 'contexto-inseguro');
  assert.equal(llamadas.length, 0);
});

test('traduce los errores de getUserMedia a códigos y mensajes', async () => {
  const casos = [
    ['NotAllowedError', 'permiso-denegado'],
    ['SecurityError', 'bloqueado-por-seguridad'],
    ['NotFoundError', 'sin-dispositivo'],
    ['OverconstrainedError', 'sin-dispositivo'],
    ['NotReadableError', 'dispositivo-ocupado'],
    ['AbortError', 'dispositivo-ocupado'],
    ['TypeError', 'restricciones-invalidas'],
    ['NotSupportedError', 'no-soportado'],
    ['OtroError', 'error-desconocido'],
  ];
  for (const [nombre, codigo] of casos) {
    const { entorno: e } = entorno(async () => {
      throw new DOMException('simulado', nombre);
    });
    const r = await solicitarMedios(e);
    assert.equal(r.ok, false);
    assert.equal(/** @type {any} */ (r).codigo, codigo, nombre);
    assert.ok(/** @type {any} */ (r).mensaje.length > 0);
  }
});

test('pide audio y video y devuelve el flujo capturado', async () => {
  const capturado = flujo([pista('video'), pista('audio')]);
  const { entorno: e, llamadas } = entorno(async () => capturado);
  const r = await solicitarMedios(e);
  assert.deepEqual(llamadas, [{ video: true, audio: true }]);
  assert.equal(r.ok, true);
  assert.equal(/** @type {any} */ (r).stream, capturado);
});

test('libera todas las pistas al finalizar o cancelar, sin pararlas dos veces', () => {
  const video = pista('video');
  const audio = pista('audio');
  const capturado = flujo([video, audio]);
  assert.equal(contarPistasActivas([capturado]), 2);
  assert.equal(liberarMedios(capturado), 2);
  assert.equal(video.readyState, 'ended');
  assert.equal(audio.readyState, 'ended');
  assert.equal(liberarMedios(capturado), 0);
  assert.equal(video.paradas, 1);
  assert.equal(contarPistasActivas([capturado]), 0);
  assert.equal(liberarMedios(null), 0);
  assert.equal(liberarMedios(undefined), 0);
});

test('una captura nueva no conserva pistas de la anterior', () => {
  const anterior = flujo([pista('video'), pista('audio')]);
  liberarMedios(anterior);
  const nueva = flujo([pista('video'), pista('audio')]);
  assert.equal(contarPistasActivas([anterior, nueva]), 2);
});
