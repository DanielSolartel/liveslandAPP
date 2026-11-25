// @ts-check
// Cronología de continuidad (public/cronologia.js, E03): orden, tiempo relativo, límite de 256 eventos,
// listas cerradas, saneamiento y exportación independiente del informe de diagnóstico (esquema 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPACIDAD_CRONOLOGIA,
  Cronologia,
  ESQUEMA_CRONOLOGIA,
  exportarCronologia,
  sanearEvento,
  serializarCronologia,
} from '../../public/cronologia.js';
import { ESQUEMA_INFORME } from '../../public/medios.js';

/** Reloj de prueba controlado por la propia prueba. */
function relojPrueba(inicio = 1000) {
  const r = { t: inicio, ahora: () => r.t };
  return r;
}

const SENUELOS = Object.freeze([
  'TOKEN-SENUELO-0123456789abcdefghijklmnopqrstuvwxyzABC',
  'SESION-SENUELO-012345',
  'v=0\r\no=- 1 2 IN IP4 203.0.113.9',
  'candidate:1 1 udp 2122260223 203.0.113.9 54321 typ host',
  '203.0.113.9',
  'MiRedWifi-SENUELO',
  'https://ejemplo.invalid/?s=SESION#TOKEN',
  'Error: SENUELO at foo (bar.js:1:1)',
]);

test('registra los eventos en orden, con secuencia y tiempo relativo monotónico', () => {
  const reloj = relojPrueba(5000);
  const c = new Cronologia({ reloj: reloj.ahora, monotonico: true });
  c.fijarRol('emisor');
  c.nuevaSesionLocal();
  assert.equal(c.registrar('pagina', 'inicio', { estado: 'visible' }), true);
  reloj.t = 5250.4;
  c.registrar('senalizacion', 'apertura');
  reloj.t = 5100; // un reloj que retrocede no hace retroceder la cronología
  c.registrar('senalizacion', 'conectada');
  reloj.t = 6000.6;
  c.registrar('webrtc', 'conexion', { estado: 'connected' });
  const e = c.eventos();
  assert.deepEqual(
    e.map((x) => [x.n, x.t, x.categoria, x.evento]),
    [
      [1, 0, 'pagina', 'inicio'],
      [2, 250, 'senalizacion', 'apertura'],
      [3, 250, 'senalizacion', 'conectada'],
      [4, 1001, 'webrtc', 'conexion'],
    ],
  );
  assert.equal(e[0].estado, 'visible');
  assert.equal(e[0].sesionLocal, 1);
  const x = exportarCronologia(c, new Date('2026-11-25T10:00:00Z'));
  assert.equal(x.esquema, ESQUEMA_CRONOLOGIA);
  assert.equal(x.reloj, 'monotonico');
  assert.equal(x.rol, 'emisor');
  assert.equal(x.generadoEn, '2026-11-25T10:00:00.000Z');
  assert.equal(x.eventosRegistrados, 4);
  assert.equal(x.eventosConservados, 4);
  assert.equal(x.eventosDescartados, 0);
});

test('conserva como máximo 256 eventos y cuenta explícitamente los descartados', () => {
  assert.equal(CAPACIDAD_CRONOLOGIA, 256);
  const reloj = relojPrueba();
  const c = new Cronologia({ reloj: reloj.ahora, monotonico: true });
  for (let i = 0; i < 300; i += 1) {
    reloj.t += 1;
    c.registrar('red', i % 2 === 0 ? 'offline' : 'online');
  }
  const e = c.eventos();
  assert.equal(e.length, 256);
  assert.equal(c.bufer.length, 256, 'memoria acotada: el búfer no crece');
  assert.equal(e[0].n, 45, 'se descartan los más antiguos');
  assert.equal(e.at(-1)?.n, 300);
  assert.ok(e.every((x, i) => i === 0 || x.n === e[i - 1].n + 1), 'orden y secuencia continuos');
  const x = exportarCronologia(c);
  assert.equal(x.eventosRegistrados, 300);
  assert.equal(x.eventosConservados, 256);
  assert.equal(x.eventosDescartados, 44);
  assert.equal(x.eventos.length, 256);
});

test('admite eventos repetidos y rechaza, contándolos, los pares categoría-evento desconocidos', () => {
  const c = new Cronologia({ reloj: () => 0, monotonico: true });
  c.registrar('pagina', 'visibilidad', { estado: 'hidden' });
  c.registrar('pagina', 'visibilidad', { estado: 'hidden' });
  assert.equal(c.registrar('pagina', 'evento-inventado'), false);
  assert.equal(c.registrar('categoria-inventada', 'inicio'), false);
  assert.equal(c.registrar('__proto__', 'inicio'), false);
  assert.equal(c.registrar('constructor', 'inicio'), false);
  assert.equal(c.registrar(/** @type {any} */ ({ toString: () => 'pagina' }), 'inicio'), false);
  const x = exportarCronologia(c);
  assert.equal(x.eventos.length, 2, 'los repetidos constan; los inesperados no');
  assert.equal(x.eventosNoValidos, 5);
  assert.equal(x.eventosRegistrados, 2, 'los rechazados no consumen número de secuencia');
});

test('los valores fuera de lista, anidados o de tipo erróneo no se registran ni se exportan', () => {
  const c = new Cronologia({ reloj: () => 0, monotonico: true });
  for (const senuelo of SENUELOS) {
    c.registrar('senalizacion', 'error', { detalle: senuelo, estado: senuelo, pista: senuelo });
  }
  c.registrar('webrtc', 'conexion', {
    estado: /** @type {any} */ ({ valor: 'connected', token: SENUELOS[0] }),
    detalle: /** @type {any} */ (['red', SENUELOS[1]]),
    pista: /** @type {any} */ (7),
    // campos que no forman parte del evento
    ...(/** @type {any} */ ({ token: SENUELOS[0], sdp: SENUELOS[2], ip: SENUELOS[4], url: SENUELOS[6] })),
  });
  const x = exportarCronologia(c);
  assert.equal(x.eventos.length, SENUELOS.length + 1, 'los eventos válidos constan, sin sus valores no admitidos');
  for (const e of x.eventos) {
    assert.deepEqual(Object.keys(e).sort(), ['categoria', 'evento', 'n', 'sesionLocal', 't'], 'solo campos permitidos');
  }
  const texto = serializarCronologia(x);
  for (const senuelo of SENUELOS) assert.equal(texto.includes(senuelo), false, `no aparece «${senuelo.slice(0, 20)}»`);
  assert.equal(/203\.0\.113|candidate:|v=0|https?:/.test(texto), false);
});

test('sanearEvento rechaza estructuras maliciosas o inesperadas', () => {
  const base = { n: 1, t: 0, sesionLocal: 0, categoria: 'red', evento: 'online' };
  assert.deepEqual(sanearEvento(base), base);
  for (const malo of [
    null,
    'texto',
    [],
    [base],
    { ...base, n: -1 },
    { ...base, n: 1.5 },
    { ...base, t: Number.NaN },
    { ...base, t: Infinity },
    { ...base, sesionLocal: '1' },
    { ...base, categoria: 'red', evento: 'inicio' },
    { ...base, categoria: 'hasOwnProperty' },
    Object.create({ ...base }),
  ]) {
    assert.equal(sanearEvento(malo), null, JSON.stringify(malo));
  }
  const conExtras = sanearEvento({ ...base, estado: 'connected', pista: 'video', detalle: 'red', token: 'x', anidado: { a: 1 } });
  assert.deepEqual(conExtras, { ...base, estado: 'connected', pista: 'video', detalle: 'red' });
});

test('sin APIs de observación o sin reloj monotónico, lo declara en lugar de suponerlo', () => {
  const c = new Cronologia({ reloj: () => Date.now(), monotonico: false, capacidades: { freeze: false, descarte: 'si', red: true } });
  const x = exportarCronologia(c);
  assert.equal(x.reloj, 'no-monotonico');
  assert.equal(x.capacidades.relojMonotonico, false);
  assert.equal(x.capacidades.freeze, false);
  assert.equal(x.capacidades.descarte, null, 'un valor no booleano no se interpreta como capacidad');
  assert.equal(x.capacidades.red, true);
  assert.equal(x.capacidades.pagehide, null, 'lo no detectado consta como desconocido');
  // Sin `performance`, el reloj por defecto es Date.now y se declara no monotónico.
  const original = Object.getOwnPropertyDescriptor(globalThis, 'performance');
  Object.defineProperty(globalThis, 'performance', { value: undefined, configurable: true, writable: true });
  try {
    assert.equal(exportarCronologia(new Cronologia()).reloj, 'no-monotonico');
  } finally {
    if (original) Object.defineProperty(globalThis, 'performance', original);
  }
  assert.equal(exportarCronologia(new Cronologia()).reloj, 'monotonico');
});

test('la exportación es un objeto nuevo con su propio esquema, independiente del informe (esquema 2)', () => {
  assert.equal(ESQUEMA_INFORME, 'live-directo-movil/informe-diagnostico/2', 'el informe de E02 conserva su esquema');
  assert.equal(ESQUEMA_CRONOLOGIA, 'live-directo-movil/cronologia-continuidad/1');
  const c = new Cronologia({ reloj: () => 0, monotonico: true });
  c.fijarRol('rol-inventado');
  c.registrar('captura', 'mute', { pista: 'audio' });
  const x = exportarCronologia(c);
  assert.equal(x.rol, null);
  assert.deepEqual(
    Object.keys(x).sort(),
    [
      'capacidad',
      'capacidades',
      'duracionMs',
      'esquema',
      'eventos',
      'eventosConservados',
      'eventosDescartados',
      'eventosNoValidos',
      'eventosRegistrados',
      'generadoEn',
      'reloj',
      'rol',
    ],
  );
  // Modificar lo exportado no altera el registro.
  x.eventos[0].evento = 'manipulado';
  assert.equal(c.eventos()[0].evento, 'mute');
  assert.equal(exportarCronologia(c, new Date(Number.NaN)).generadoEn, null);
});
