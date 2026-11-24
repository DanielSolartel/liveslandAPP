// @ts-check
// Ayudas de las pruebas del cliente (public/app.js) con dobles controlados: servidor real, páginas simuladas
// y un segundo participante con el cliente de señalización real. Ver navegador-simulado.js.
import assert from 'node:assert/strict';
import { crearServidor } from '../../src/servidor.js';
import { CanalSenalizacion } from '../../public/senalizacion.js';
import { cargarApp, fetchReal, instalarNavegador } from './navegador-simulado.js';

/** @typedef {ReturnType<typeof instalarNavegador>} Pagina */
/** @typedef {{ canal: CanalSenalizacion, eventos: { evento: string, datos: any }[] }} Participante */

export const SDP = 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n';

/** @param {number} ms */
export const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @template T
 * @param {() => T | Promise<T>} condicion
 * @param {number} [ms]
 * @param {string} [descripcion]
 * @returns {Promise<NonNullable<T>>}
 */
export async function esperar(condicion, ms = 3000, descripcion = 'condición') {
  const limite = Date.now() + ms;
  for (;;) {
    const valor = await condicion();
    if (valor) return /** @type {NonNullable<T>} */ (valor);
    if (Date.now() > limite) throw new Error(`No se cumplió en ${ms} ms: ${descripcion}`);
    await pausa(10);
  }
}

/**
 * Servidor real y páginas simuladas. Todo lo que llegó a crearse se cierra aunque la prueba falle.
 * @param {(ctx: {
 *   app: ReturnType<typeof crearServidor>,
 *   base: string,
 *   abrir: (url?: string) => Promise<Pagina>,
 *   participante: (sesion: string, token: string) => Participante,
 * }) => Promise<void>} cuerpo
 */
export async function conServidor(cuerpo) {
  const app = crearServidor({ barridoMs: 20, latidoMs: 50 });
  /** @type {(() => void)[]} */
  const limpiezas = [];
  try {
    const direccion = await app.escuchar(0, '127.0.0.1');
    const base = `http://127.0.0.1:${direccion.port}`;
    const abrir = async (url = '/') => {
      const pagina = instalarNavegador({ base, url });
      limpiezas.push(() => pagina.restaurar());
      await cargarApp();
      return pagina;
    };
    /** La prueba hace de otro participante con el cliente de señalización real. */
    const participante = (/** @type {string} */ sesion, /** @type {string} */ token) => {
      /** @type {Participante['eventos']} */
      const eventos = [];
      const canal = new CanalSenalizacion({
        base,
        sesion,
        token,
        fetch: fetchReal,
        alEvento: (e) => eventos.push(/** @type {any} */ (e)),
      });
      void canal.abrir();
      limpiezas.push(() => canal.cerrar());
      return { canal, eventos };
    };
    await cuerpo({ app, base, abrir, participante });
  } finally {
    for (const limpiar of limpiezas.reverse()) limpiar();
    await app.cerrar();
  }
}

/**
 * Crea la sesión desde la página del emisor y devuelve los datos del enlace del espectador.
 * @param {Pagina} pagina
 */
export async function crearSesionEnPagina(pagina) {
  pagina.pulsar('btn-crear');
  await esperar(
    () => pagina.valor('enlace-espectador') !== '' && pagina.texto('estado-senal') === 'conectada',
    3000,
    'sesión creada y canal conectado',
  );
  const enlace = new URL(pagina.valor('enlace-espectador'));
  return { sesion: String(enlace.searchParams.get('s')), tokenEspectador: enlace.hash.slice(1) };
}

/**
 * @param {Participante} p
 * @param {string} evento
 * @param {(datos: any) => boolean} [filtro]
 */
export const cuenta = (p, evento, filtro = () => true) => p.eventos.filter((e) => e.evento === evento && filtro(e.datos)).length;

/**
 * Emisor con captura activa y un espectador (la prueba) con oferta y respuesta intercambiadas.
 * @param {Pagina} pagina
 * @param {(sesion: string, token: string) => Participante} participante
 */
export async function emisorConEspectador(pagina, participante) {
  const datos = await crearSesionEnPagina(pagina);
  pagina.capturaAutomatica(true);
  pagina.pulsar('btn-activar');
  await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura activa');
  const espectador = participante(datos.sesion, datos.tokenEspectador);
  await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta'), 3000, 'oferta recibida');
  assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP })).ok, true);
  const pc = /** @type {any} */ (pagina.conexiones.at(-1));
  await esperar(() => pc.remoteDescription, 3000, 'respuesta aplicada');
  pc.conectar();
  assert.equal(pagina.pistasVivas(), 2);
  assert.equal((await pagina.diagnostico()).conexion, 'connected');
  return { ...datos, espectador, pc };
}
