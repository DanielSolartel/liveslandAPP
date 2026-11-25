// @ts-check
// Funciones puras añadidas por la revisión E03-R01 (public/continuidad.js): semántica de los identificadores
// de negociación, también en el límite del contador, y cronología de las categorías nuevas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_NEGOCIACION, ofertaAceptable, siguienteNegociacion } from '../../public/continuidad.js';
import { LIMITES } from '../../src/validacion.js';
import { Cronologia, exportarCronologia } from '../../public/cronologia.js';

test('R01-01: el identificador de negociación del emisor crece y no da la vuelta al llegar al máximo', () => {
  assert.equal(MAX_NEGOCIACION, LIMITES.negociacionMax, 'mismo máximo que valida el servidor');
  assert.equal(siguienteNegociacion(0), 1);
  assert.equal(siguienteNegociacion(41), 42);
  assert.equal(siguienteNegociacion(MAX_NEGOCIACION - 1), MAX_NEGOCIACION);
  assert.equal(siguienteNegociacion(MAX_NEGOCIACION), null, 'al máximo no se crean más negociaciones');
  for (const malo of [-1, 1.5, Number.NaN, Infinity, MAX_NEGOCIACION + 1]) assert.equal(siguienteNegociacion(malo), null, String(malo));
});

test('R01-01: aceptación de ofertas: posteriores sí; repetidas, atrasadas o sin identificador tras una correlacionada, no', () => {
  assert.equal(ofertaAceptable({ ultima: null }, 1), 'aceptar');
  assert.equal(ofertaAceptable({ ultima: null }, undefined), 'aceptar', 'compatibilidad sin identificador');
  assert.equal(ofertaAceptable({ ultima: 2 }, 3), 'aceptar');
  assert.equal(ofertaAceptable({ ultima: 2 }, 2), 'duplicada');
  assert.equal(ofertaAceptable({ ultima: 2 }, 1), 'obsoleta');
  assert.equal(ofertaAceptable({ ultima: 2 }, undefined), 'sin-identificador');
  assert.equal(ofertaAceptable({ ultima: 2 }, null), 'sin-identificador');
  // En el límite no hay vuelta: el máximo es el último aceptable y 1 tras el máximo es atrasada.
  assert.equal(ofertaAceptable({ ultima: MAX_NEGOCIACION - 1 }, MAX_NEGOCIACION), 'aceptar');
  assert.equal(ofertaAceptable({ ultima: MAX_NEGOCIACION }, 1), 'obsoleta');
  assert.equal(ofertaAceptable({ ultima: MAX_NEGOCIACION }, MAX_NEGOCIACION), 'duplicada');
  // Valores fuera de contrato no se interpretan como identificadores válidos.
  for (const malo of [0, -5, 2.5, '7', MAX_NEGOCIACION + 1]) assert.equal(ofertaAceptable({ ultima: 2 }, malo), 'sin-identificador', String(malo));
});

test('R01-04 y R01-02: la cronología admite las categorías nuevas y sigue rechazando cadenas arbitrarias', () => {
  const c = new Cronologia({ reloj: () => 0, monotonico: true });
  c.registrar('senalizacion', 'error', { detalle: 'par-ausente' });
  c.registrar('senalizacion', 'error', { detalle: 'conflicto' });
  c.registrar('recuperacion', 'fallo', { detalle: 'interrupcion-durante-comprobacion' });
  c.registrar('senalizacion', 'senal-ignorada', { detalle: 'limite-negociaciones' });
  c.registrar('senalizacion', 'error', { detalle: 'conflicto-inventado' });
  const e = exportarCronologia(c).eventos;
  assert.deepEqual(
    e.map((x) => x.detalle),
    ['par-ausente', 'conflicto', 'interrupcion-durante-comprobacion', 'limite-negociaciones', undefined],
  );
});
