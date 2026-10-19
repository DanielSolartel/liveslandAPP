// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlmacenSesiones } from '../../src/sesiones.js';
import { PATRON_ID_SESION, PATRON_TOKEN } from '../../src/validacion.js';

function reloj(inicio = 1_000_000) {
  let t = inicio;
  return { ahora: () => t, avanzar: (/** @type {number} */ ms) => (t += ms) };
}

function canalFalso() {
  /** @type {{ evento: string, datos: unknown }[]} */
  const enviados = [];
  return {
    enviados,
    cerrado: false,
    enviar(/** @type {string} */ evento, /** @type {unknown} */ datos) {
      enviados.push({ evento, datos });
    },
    cerrar() {
      this.cerrado = true;
    },
  };
}

test('crea sesiones con identificadores y tokens impredecibles y distintos', () => {
  const almacen = new AlmacenSesiones();
  const a = almacen.crear();
  const b = almacen.crear();
  assert.ok(a && b);
  assert.match(a.sesion, PATRON_ID_SESION);
  assert.match(a.tokenEmisor, PATRON_TOKEN);
  assert.match(a.tokenEspectador, PATRON_TOKEN);
  assert.notEqual(a.sesion, b.sesion);
  assert.notEqual(a.tokenEmisor, a.tokenEspectador);
  assert.notEqual(a.tokenEmisor, b.tokenEmisor);
});

test('resuelve el rol solo con el token de la propia sesión', () => {
  const almacen = new AlmacenSesiones();
  const a = /** @type {NonNullable<ReturnType<AlmacenSesiones['crear']>>} */ (almacen.crear());
  const b = /** @type {NonNullable<ReturnType<AlmacenSesiones['crear']>>} */ (almacen.crear());
  const sesionA = /** @type {import('../../src/sesiones.js').Sesion} */ (almacen.obtener(a.sesion));
  assert.equal(almacen.rolPorToken(sesionA, a.tokenEmisor), 'emisor');
  assert.equal(almacen.rolPorToken(sesionA, a.tokenEspectador), 'espectador');
  assert.equal(almacen.rolPorToken(sesionA, b.tokenEmisor), null);
  assert.equal(almacen.rolPorToken(sesionA, 'corto'), null);
});

test('limita el número de sesiones', () => {
  const almacen = new AlmacenSesiones({ maxSesiones: 2 });
  assert.ok(almacen.crear());
  assert.ok(almacen.crear());
  assert.equal(almacen.crear(), null);
});

test('un rol solo admite un canal a la vez', () => {
  const almacen = new AlmacenSesiones();
  const creada = /** @type {NonNullable<ReturnType<AlmacenSesiones['crear']>>} */ (almacen.crear());
  const sesion = /** @type {import('../../src/sesiones.js').Sesion} */ (almacen.obtener(creada.sesion));
  const uno = canalFalso();
  const dos = canalFalso();
  assert.equal(almacen.conectar(sesion, 'emisor', uno), true);
  assert.equal(almacen.conectar(sesion, 'emisor', dos), false);
  assert.equal(almacen.desconectar(sesion, 'emisor', dos), false);
  assert.equal(almacen.desconectar(sesion, 'emisor', uno), true);
  assert.equal(almacen.conectar(sesion, 'emisor', dos), true);
});

test('caduca las sesiones y limpia las abandonadas, avisando a los canales', () => {
  const r = reloj();
  const almacen = new AlmacenSesiones({ duracionMaxMs: 10_000, inactividadMs: 1_000, ahora: r.ahora });
  const conCanal = /** @type {NonNullable<ReturnType<AlmacenSesiones['crear']>>} */ (almacen.crear());
  const vacia = /** @type {NonNullable<ReturnType<AlmacenSesiones['crear']>>} */ (almacen.crear());
  const canal = canalFalso();
  almacen.conectar(/** @type {any} */ (almacen.obtener(conCanal.sesion)), 'espectador', canal);

  r.avanzar(1_500);
  assert.deepEqual(almacen.barrer(), [vacia.sesion]);
  assert.equal(almacen.obtener(vacia.sesion), undefined);
  assert.ok(almacen.obtener(conCanal.sesion), 'con un participante conectado no se considera abandonada');

  r.avanzar(9_000);
  assert.equal(almacen.obtener(conCanal.sesion), undefined);
  assert.deepEqual(canal.enviados, [{ evento: 'fin', datos: { motivo: 'expirada' } }]);
  assert.equal(canal.cerrado, true);
  assert.equal(almacen.tamano, 0);
});

test('aplica el límite de señales por minuto y reinicia la ventana', () => {
  const r = reloj();
  const almacen = new AlmacenSesiones({ maxSenalesPorMinuto: 2, ahora: r.ahora });
  const creada = /** @type {NonNullable<ReturnType<AlmacenSesiones['crear']>>} */ (almacen.crear());
  const sesion = /** @type {import('../../src/sesiones.js').Sesion} */ (almacen.obtener(creada.sesion));
  assert.equal(almacen.registrarSenal(sesion), true);
  assert.equal(almacen.registrarSenal(sesion), true);
  assert.equal(almacen.registrarSenal(sesion), false);
  r.avanzar(60_000);
  assert.equal(almacen.registrarSenal(sesion), true);
});
