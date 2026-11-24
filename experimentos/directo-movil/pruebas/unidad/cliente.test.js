// @ts-check
// Lógica del cliente (public/app.js) con DOBLES CONTROLADOS: DOM mínimo, captura diferida, RTCPeerConnection
// simulada y peticiones retenidas, contra el servidor real del experimento. No usa navegador, WebRTC real
// ni dispositivos: los casos con Chromium y medios sintéticos están en pruebas/e2e/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITE_ENVIO_MS } from '../../public/senalizacion.js';
import { SDP, conServidor, crearSesionEnPagina, cuenta, emisorConEspectador, esperar, pausa } from './ayudas-cliente.js';
import { fetchReal } from './navegador-simulado.js';

test('R01-01: con el aviso de fin retenido, la captura y las conexiones se cierran sin esperar a la red', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { espectador, pc } = await emisorConEspectador(pagina, participante);

    pagina.retenerSenales((s) => s.tipo === 'fin');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'la vista final aparece sin esperar la respuesta');
    assert.equal(pagina.pistasVivas(), 0, 'no queda ninguna pista de captura viva');
    assert.equal(pc.cerrada, true, 'la RTCPeerConnection se cerró');
    const d = await pagina.diagnostico();
    assert.equal(d.pistasLocalesActivas, 0);
    assert.equal(d.conexion, 'sin-conexion');
    assert.equal(d.avisoCierre, 'pendiente');
    assert.equal(pagina.retenidas.length, 1, 'el aviso de fin se envió una vez');
    assert.ok(pagina.visible('btn-nueva') && pagina.habilitado('btn-nueva'), 'se puede continuar');
    // El flujo de eventos del emisor también se cerró: el servidor avisa al espectador.
    await esperar(() => cuenta(espectador, 'par', (x) => x.presente === false), 3000, 'el espectador sabe que el emisor se fue');

    // Sin respuesta, el aviso se cancela al agotar su límite y no se da por confirmado.
    await esperar(() => pagina.retenidas[0].abortada, LIMITE_ENVIO_MS + 2000, 'aviso cancelado al agotar el límite');
    await esperar(async () => (await pagina.diagnostico()).avisoCierre === 'sin-confirmar', 1000, 'aviso sin confirmar');
    assert.equal(pagina.visible('mensaje-error'), true);
    assert.match(pagina.texto('mensaje-error'), /captura ya está detenida.*no confirmó el fin de la sesión \(tiempo-agotado\)/);
    assert.match(pagina.texto('estado-senal'), /sin confirmar/);
    assert.equal(app.almacen.tamano, 1, 'el fin no llegó al servidor y no se finge que lo hizo');
    assert.equal(cuenta(espectador, 'fin'), 0);

    pagina.pulsar('btn-nueva');
    assert.equal(pagina.visible('vista-inicio'), true);
    assert.equal(pagina.visible('mensaje-error'), false);
  });
});

test('R01-01: si el servidor responde, el fin se confirma, la sesión se elimina y el espectador recibe el aviso', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { espectador } = await emisorConEspectador(pagina, participante);
    pagina.pulsar('btn-finalizar');
    await esperar(async () => (await pagina.diagnostico()).avisoCierre === 'confirmado', 3000, 'fin confirmado');
    assert.equal(app.almacen.tamano, 0, 'la sesión se eliminó del servidor');
    assert.equal(cuenta(espectador, 'fin', (d) => d.motivo === 'finalizada-por-el-emisor'), 1);
    assert.equal(pagina.texto('texto-final'), 'Emisión finalizada.');
    assert.match(pagina.texto('estado-senal'), /el servidor eliminó la sesión/);
    assert.equal(pagina.visible('mensaje-error'), false);
  });
});

test('R01-01: una respuesta tardía del aviso de fin no altera la sesión siguiente', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const a = await emisorConEspectador(pagina, participante);
    pagina.retenerSenales((s) => s.tipo === 'fin');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'la vista final aparece sin esperar la respuesta');
    pagina.retenerSenales(() => false);
    pagina.pulsar('btn-nueva');
    const b = await crearSesionEnPagina(pagina);
    assert.equal((await pagina.diagnostico()).avisoCierre, 'sin-aviso');

    // El fin retenido de A llega ahora al servidor, que elimina A y responde 200.
    await pagina.retenidas[0].liberar();
    await esperar(() => app.almacen.obtener(a.sesion) === undefined, 3000, 'A eliminada');
    await pausa(50);
    const d = await pagina.diagnostico();
    assert.equal(d.avisoCierre, 'sin-aviso', 'la respuesta de A no cambia B');
    assert.equal(pagina.texto('estado-senal'), 'conectada');
    assert.equal(pagina.visible('vista-emisor'), true);
    assert.equal(pagina.visible('mensaje-error'), false);
    assert.ok(app.almacen.obtener(b.sesion), 'B sigue activa en el servidor');
  });
});

test('R01-01: con el aviso de salida retenido, el espectador cierra medios y conexiones sin esperar a la red', async () => {
  await conServidor(async ({ base, abrir, participante }) => {
    const creada = await (await fetchReal(`${base}/api/sesiones`, { method: 'POST' })).json();
    const emisor = participante(creada.sesion, creada.tokenEmisor);
    await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor conectado');
    const pagina = await abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador conectado');
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP })).ok, true);
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta'), 3000, 'respuesta del espectador');
    const pc = /** @type {any} */ (pagina.conexiones.at(-1));
    const remoto = pc.recibirMedios();
    pc.conectar();
    const antes = await pagina.diagnostico();
    assert.equal(antes.pistasRemotas, 2);
    assert.equal(antes.conexion, 'connected');

    pagina.retenerSenales((s) => s.tipo === 'salir');
    pagina.pulsar('btn-salir');
    await esperar(() => pagina.visible('vista-final'), 1000, 'la vista final aparece sin esperar la respuesta');
    assert.equal(pc.cerrada, true);
    assert.ok(remoto.getTracks().every((/** @type {any} */ p) => p.readyState === 'ended'), 'pistas remotas detenidas');
    const d = await pagina.diagnostico();
    assert.equal(d.pistasRemotas, 0);
    assert.equal(d.conexion, 'sin-conexion');
    assert.equal(d.avisoCierre, 'pendiente');
    assert.equal(pagina.texto('texto-final'), 'Has salido de la sesión.');
    await esperar(() => cuenta(emisor, 'par', (x) => x.presente === false), 3000, 'el emisor sabe que el espectador se fue');

    await esperar(() => pagina.retenidas[0].abortada, LIMITE_ENVIO_MS + 2000, 'aviso cancelado al agotar el límite');
    await esperar(async () => (await pagina.diagnostico()).avisoCierre === 'sin-confirmar', 1000, 'aviso sin confirmar');
    assert.match(pagina.texto('mensaje-error'), /no confirmó la salida \(tiempo-agotado\)/);
  });
});

test('R01-02: una captura pendiente de la sesión A no se incorpora a la sesión B', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    await crearSesionEnPagina(pagina);
    pagina.pulsar('btn-activar');
    assert.equal(pagina.capturas.length, 1, 'captura de A pendiente');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'A finalizada');
    pagina.pulsar('btn-nueva');
    await crearSesionEnPagina(pagina);

    pagina.capturas[0].resolver(); // llega la captura pedida en A
    await pausa(50);
    assert.equal(pagina.pistasVivas(), 0, 'las pistas de la captura antigua se detuvieron');
    const d = await pagina.diagnostico();
    assert.equal(d.pistasLocalesActivas, 0);
    assert.equal(d.capturasDescartadas, 1);
    assert.equal(pagina.texto('estado-medios'), 'cámara y micrófono sin activar', 'B sigue sin captura');
    assert.equal(pagina.habilitado('btn-activar'), true);
    assert.equal(pagina.visible('mensaje-error'), false);

    pagina.capturaAutomatica(true);
    pagina.pulsar('btn-activar');
    await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura de B activa');
    assert.equal(pagina.pistasVivas(), 2, 'solo las pistas de B');
    assert.equal((await pagina.diagnostico()).pistasLocalesActivas, 2);
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'B finalizada');
    assert.equal(pagina.pistasVivas(), 0, 'no queda ninguna pista de ninguna sesión');
    assert.equal((await pagina.diagnostico()).pistasLocalesActivas, 0);
  });
});

test('R01-02: una captura que se resuelve o falla después de finalizar no cambia la vista final', async () => {
  await conServidor(async ({ abrir }) => {
    const pagina = await abrir('/');
    await crearSesionEnPagina(pagina);
    pagina.pulsar('btn-activar');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
    const textoFinal = pagina.texto('texto-final');
    const medios = pagina.texto('estado-medios');
    pagina.capturas[0].resolver();
    await pausa(50);
    assert.equal(pagina.pistasVivas(), 0);
    assert.equal((await pagina.diagnostico()).capturasDescartadas, 1);
    assert.equal(pagina.visible('vista-final'), true);
    assert.equal(pagina.texto('texto-final'), textoFinal);
    assert.equal(pagina.texto('estado-medios'), medios);
    assert.equal(pagina.visible('mensaje-error'), false);

    // Un permiso denegado que llega tarde tampoco habilita botones ni muestra mensajes.
    pagina.pulsar('btn-nueva');
    await crearSesionEnPagina(pagina);
    pagina.pulsar('btn-activar');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
    const mediosFinal = pagina.texto('estado-medios');
    pagina.capturas[1].rechazar('NotAllowedError');
    await pausa(50);
    assert.equal(pagina.visible('mensaje-error'), false);
    assert.equal(pagina.habilitado('btn-activar'), false);
    assert.equal(pagina.texto('estado-medios'), mediosFinal);
  });
});

test('R01-02: una negociación retenida de la sesión A no bloquea ni altera la sesión B', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    const a = await crearSesionEnPagina(pagina);
    pagina.capturaAutomatica(true);
    pagina.pulsar('btn-activar');
    await esperar(() => pagina.texto('estado-medios').includes('activos'), 3000, 'captura activa');
    pagina.retenerSenales((s) => s.tipo === 'oferta');
    const espectador = participante(a.sesion, a.tokenEspectador);
    await esperar(() => pagina.retenidas.length === 1, 3000, 'oferta de A retenida');
    pagina.retenerSenales(() => false);
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'A finalizada');
    espectador.canal.cerrar();
    pagina.pulsar('btn-nueva');
    await crearSesionEnPagina(pagina);
    await esperar(
      () => pagina.texto('estado-conexion') === 'esperando espectador',
      1000,
      'B procesa sus eventos aunque la oferta de A siga retenida',
    );

    // La oferta de A llega por fin al servidor, que ya no tiene A y responde 404.
    await pagina.retenidas[0].liberar();
    await pausa(50);
    assert.equal(pagina.visible('mensaje-error'), false, 'el error de A no aparece en B');
    assert.equal(pagina.visible('vista-emisor'), true);
    assert.equal(pagina.texto('estado-conexion'), 'esperando espectador');
  });
});
