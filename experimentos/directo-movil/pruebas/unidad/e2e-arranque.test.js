// @ts-check
// Si el navegador de pruebas/e2e no arranca, la batería debe fallar con un diagnóstico y terminar sola,
// sin servidores abiertos. Lanza esa batería con un ejecutable inexistente: no necesita ningún navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const ARCHIVO_E2E = 'pruebas/e2e/recorrido.test.js';
const ESPERA_MAXIMA_MS = 30_000;
const WINDOWS = process.platform === 'win32';

/**
 * Si la batería no termina, detiene también los procesos que lanzó (node --test ejecuta cada archivo en un hijo).
 * @param {import('node:child_process').ChildProcess} hijo
 */
function detenerArbol(hijo) {
  if (hijo.pid === undefined) return;
  if (WINDOWS) spawnSync('taskkill', ['/pid', String(hijo.pid), '/t', '/f']);
  else process.kill(-hijo.pid, 'SIGKILL');
}

test('con un navegador inexistente, la batería del navegador falla con diagnóstico y termina sola', async () => {
  const pruebas = readFileSync(new URL(`../../${ARCHIVO_E2E}`, import.meta.url), 'utf8').match(/^test\(/gm)?.length ?? 0;
  assert.ok(pruebas > 0);
  /** @type {NodeJS.ProcessEnv} */
  const entorno = { ...process.env, DIRECTO_CHROMIUM: '/ruta/inexistente/chromium' };
  delete entorno.DIRECTO_CANAL;
  delete entorno.NODE_TEST_CONTEXT; // la batería hija debe comportarse como una ejecución normal de node --test
  // En Linux y macOS, un grupo de procesos propio permite detener la batería y sus hijos de una vez.
  const hijo = spawn(process.execPath, ['--test', '--test-concurrency=1', '--test-reporter=tap', ARCHIVO_E2E], {
    cwd: RAIZ,
    env: entorno,
    detached: !WINDOWS,
  });
  let salida = '';
  hijo.stdout.setEncoding('utf8').on('data', (t) => (salida += t));
  hijo.stderr.setEncoding('utf8').on('data', (t) => (salida += t));
  let forzado = false;
  const plazo = setTimeout(() => {
    forzado = true;
    detenerArbol(hijo);
  }, ESPERA_MAXIMA_MS);
  const codigo = await new Promise((resolve) => hijo.on('close', (c) => resolve(c)));
  clearTimeout(plazo);

  assert.equal(forzado, false, `la batería no terminó sola en ${ESPERA_MAXIMA_MS} ms:\n${salida}`);
  assert.equal(codigo, 1, 'termina con error');
  assert.match(salida, new RegExp(`^# fail ${pruebas}$`, 'm'), 'todas las pruebas constan como fallidas');
  assert.match(salida, /^# pass 0$/m, 'ninguna se da por superada');
  assert.match(salida, /^# skipped 0$/m, 'ninguna se omite');
  assert.match(salida, /No se pudo arrancar el navegador de la prueba \(DIRECTO_CHROMIUM=\/ruta\/inexistente\/chromium\)/);
});
