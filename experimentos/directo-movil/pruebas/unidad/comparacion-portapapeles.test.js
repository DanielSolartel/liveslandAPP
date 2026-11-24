// @ts-check
// Regresión de portabilidad de la prueba de navegador: el portapapeles de Windows devuelve CRLF y el cuadro
// de texto, LF. La comparación acepta solo esa diferencia y rechaza cualquier otra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construirInforme, serializarInforme } from '../../public/medios.js';
import { igualesSalvoCrLf, normalizarCrLf } from '../e2e/comparacion-portapapeles.js';

/** Informe real de varias líneas, tal como lo muestra el cuadro de texto (LF). */
const mostrado = serializarInforme(construirInforme({ rol: 'emisor', navegador: { agente: 'Chrome/158.0.0.0', plataforma: 'Win32' } }, new Date('2026-11-23T12:00:00Z')));
/** El mismo texto como lo devuelve el portapapeles de Windows (CRLF). */
const copiado = mostrado.replace(/\n/g, '\r\n');
const saltos = mostrado.split('\n').length - 1;

test('la comparación original falla ante CRLF y la corregida acepta la equivalencia LF/CRLF', () => {
  assert.ok(saltos > 50, 'el informe tiene muchas líneas');
  // Comparación original de la prueba de navegador: igualdad estricta.
  assert.notEqual(copiado, mostrado);
  assert.equal(copiado.length - mostrado.length, saltos, 'la diferencia son exactamente los CR añadidos');
  // Comparación corregida.
  assert.equal(igualesSalvoCrLf(copiado, mostrado), true);
  assert.equal(igualesSalvoCrLf(mostrado, copiado), true);
  assert.equal(igualesSalvoCrLf(mostrado, mostrado), true, 'sin CRLF también es igual');
  assert.equal(igualesSalvoCrLf(copiado, copiado), true);
  assert.equal(normalizarCrLf(copiado), mostrado, 'tras normalizar, las cadenas son idénticas');
  assert.equal(igualesSalvoCrLf(mostrado.replace('\n', '\r\n'), mostrado), true, 'también con saltos mezclados');
  // El informe copiado sigue siendo JSON válido, con CRLF o sin él.
  assert.deepEqual(JSON.parse(copiado), JSON.parse(mostrado));
});

test('la comparación rechaza cualquier diferencia que no sea CRLF/LF', () => {
  /** @type {[string, string][]} */
  const alterados = [
    ['un carácter cambiado', copiado.replace('"emisor"', '"emisoR"')],
    ['un valor distinto', copiado.replace('"version": 158', '"version": 159')],
    ['un carácter menos', copiado.replace('"esquema"', '"esquem"')],
    ['un campo menos', copiado.replace(/ {2}"rol": "emisor",\r\n/, '')],
    ['truncado', copiado.slice(0, -20)],
    ['una parte', copiado.slice(0, Math.floor(copiado.length / 2))],
    ['vacío', ''],
    ['espacio al final', `${copiado} `],
    ['salto al final', `${copiado}\r\n`],
    ['espacio al principio', ` ${copiado}`],
    ['sangría distinta', copiado.replace('\r\n  "rol"', '\r\n   "rol"')],
    ['un CR suelto', copiado.replace('\r\n', '\r\r\n')],
    ['un CR suelto sin LF', copiado.replace('\r\n', '\r')],
    ['un LF de más', copiado.replace('\r\n', '\r\n\n')],
    ['espacios cambiados por otros', copiado.replace('"esquema": ', '"esquema":  ')],
    ['mayúsculas', copiado.toUpperCase()],
  ];
  for (const [nombre, alterado] of alterados) {
    assert.notEqual(alterado, copiado, `la alteración «${nombre}» cambia el texto`);
    assert.equal(igualesSalvoCrLf(alterado, mostrado), false, `se rechaza: ${nombre}`);
    assert.equal(igualesSalvoCrLf(mostrado, alterado), false, `se rechaza (orden inverso): ${nombre}`);
  }
});

test('solo se normaliza CRLF: ni se recorta ni se tocan otros saltos', () => {
  assert.equal(normalizarCrLf('a\r\nb\nc'), 'a\nb\nc');
  assert.equal(normalizarCrLf('a\rb'), 'a\rb');
  assert.equal(normalizarCrLf('a\r\r\nb'), 'a\r\nb');
  assert.equal(normalizarCrLf(' a \r\n'), ' a \n');
  assert.equal(normalizarCrLf(''), '');
});
