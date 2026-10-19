// @ts-check
// Arranque del experimento. Por defecto solo escucha en loopback (127.0.0.1).
import { readFileSync } from 'node:fs';
import { crearServidor } from './servidor.js';

const host = process.env.DIRECTO_HOST || '127.0.0.1';
const puerto = Number.parseInt(process.env.DIRECTO_PUERTO || '8787', 10);
const rutaCert = process.env.DIRECTO_TLS_CERT;
const rutaClave = process.env.DIRECTO_TLS_KEY;
const esLoopback = host === 'localhost' || host === '::1' || /^127\./.test(host);

/** @param {string} mensaje */
function salirConError(mensaje) {
  console.error(`Error: ${mensaje}`);
  process.exit(1);
}

if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  salirConError('DIRECTO_PUERTO debe ser un número de puerto entre 1 y 65535.');
}
if (Boolean(rutaCert) !== Boolean(rutaClave)) {
  salirConError('DIRECTO_TLS_CERT y DIRECTO_TLS_KEY deben indicarse juntos.');
}
if (!esLoopback && !rutaCert) {
  salirConError(
    'Escuchar fuera de loopback exige HTTPS (DIRECTO_TLS_CERT y DIRECTO_TLS_KEY). ' +
      'Los navegadores no permiten cámara ni micrófono en http:// desde una IP de red.',
  );
}

const tls = rutaCert && rutaClave ? { cert: readFileSync(rutaCert), key: readFileSync(rutaClave) } : undefined;
const app = crearServidor({ tls });
const direccion = await app.escuchar(puerto, host);
const esquema = tls ? 'https' : 'http';
const visible = esLoopback ? (host === '::1' ? '[::1]' : host) : host;

console.log(`Experimento directo-movil escuchando en ${esquema}://${visible}:${direccion.port}/`);
console.log('Solo para pruebas técnicas con contenido neutral: sin cuentas, grabación, monedas ni cobros.');
console.log('Sin STUN/TURN: la conexión de medios funciona en el mismo equipo o en una red local sin aislamiento.');
if (!esLoopback) {
  console.log('Modo laboratorio de red local: usa el nombre o la IP que cubre el certificado.');
}

/** @param {NodeJS.Signals} senal */
async function detener(senal) {
  console.log(`\n${senal}: cerrando sesiones y servidor.`);
  await app.cerrar();
  process.exit(0);
}
process.on('SIGINT', detener);
process.on('SIGTERM', detener);
