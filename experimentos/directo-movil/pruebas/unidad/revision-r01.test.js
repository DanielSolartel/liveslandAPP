// @ts-check
// Regresiones de la revisión E03-R01 (auditoría independiente de E03 v1.0) con DOBLES CONTROLADOS, contra el
// servidor real del experimento salvo donde se indica. Convierte en aserciones las sondas de la auditoría
// (R01-01 a R01-04) y las investigaciones de los riesgos R01-05 a R01-08. No usa navegador ni WebRTC real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SDP, conServidor, cuenta, emisorConEspectador, esperar, pausa } from './ayudas-cliente.js';
import { fetchReal } from './navegador-simulado.js';
import { categoriaCanal, CanalSenalizacion } from '../../public/senalizacion.js';
import { evaluarProgreso, LIMITES_RECUPERACION } from '../../public/continuidad.js';
import { crearServidor } from '../../src/servidor.js';

/** @typedef {import('./ayudas-cliente.js').Pagina} Pagina */
/** @typedef {import('./ayudas-cliente.js').Participante} Participante */

const CANDIDATO = { candidate: 'candidate:9 1 udp 1 127.0.0.1 9 typ host', sdpMid: '0', sdpMLineIndex: 0, usernameFragment: null };

/** @param {Pagina} pagina */
async function esperarFinRecuperacion(pagina, ms = 12_000) {
  await esperar(async () => !(await pagina.diagnostico()).recuperacion.enCurso, ms, 'el reintento terminó');
  return (await pagina.diagnostico()).recuperacion;
}

/** @param {Pagina} pagina */
function cronologia(pagina) {
  pagina.pulsar('btn-cronologia');
  return JSON.parse(pagina.valor('cronologia-texto'));
}

/**
 * Espectador (la página) conectado a un emisor que hace la prueba, con la primera oferta `neg`.
 * @param {{ base: string, abrir: (url?: string) => Promise<Pagina>, participante: (s: string, t: string) => Participante }} ctx
 * @param {number} neg
 */
async function espectadorCon(ctx, neg) {
  const creada = await (await fetchReal(`${ctx.base}/api/sesiones`, { method: 'POST' })).json();
  const emisor = ctx.participante(creada.sesion, creada.tokenEmisor);
  await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor conectado');
  const pagina = await ctx.abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
  pagina.avanzarMedios(true);
  await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador conectado');
  assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg })).ok, true);
  await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === neg), 3000, `respuesta ${neg}`);
  const pc = /** @type {any} */ (pagina.conexiones.at(-1));
  const remoto = pc.recibirMedios();
  pc.conectar();
  return { creada, emisor, pagina, pc, remoto };
}

/**
 * El emisor (prueba) envía una oferta; devuelve si la página respondió en el tiempo dado.
 * @param {Participante} emisor
 * @param {Record<string, unknown>} oferta
 */
async function ofertaRespondida(emisor, oferta, ms = 300) {
  const antes = cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta');
  assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, ...oferta })).ok, true);
  await pausa(ms);
  return cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta') > antes;
}

// ---------- E03-R01-01: ofertas obsoletas, duplicadas o sin identificador ----------

test('R01-01: una oferta atrasada (neg 1 tras neg 2) no sustituye la conexión vigente ni recibe respuesta', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 2);
    assert.equal(await ofertaRespondida(emisor, { neg: 1 }), false, 'no se responde a la oferta atrasada');
    assert.equal(pagina.conexiones.length, 1, 'no se crea otra conexión');
    assert.equal(pc.cerrada, false, 'la conexión vigente conserva su identidad');
    assert.equal((await pagina.diagnostico()).conexion, 'connected');
    assert.equal((await pagina.diagnostico()).senalesDescartadas, 1);
  });
});

test('R01-01: una oferta duplicada (neg 2 otra vez) se descarta', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 2);
    assert.equal(await ofertaRespondida(emisor, { neg: 2 }), false);
    assert.equal(pagina.conexiones.length, 1);
    assert.equal(pc.cerrada, false);
  });
});

test('R01-01: una oferta sin identificador no degrada una negociación ya correlacionada', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 2);
    assert.equal(await ofertaRespondida(emisor, {}), false);
    assert.equal(pagina.conexiones.length, 1);
    assert.equal(pc.cerrada, false);
    // Una oferta nueva y posterior sí se acepta.
    assert.equal(await ofertaRespondida(emisor, { neg: 3 }), true);
    assert.equal(pc.cerrada, true);
    assert.equal(cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 3), 1);
  });
});

test('R01-01: una oferta legítima posterior a una recuperación se acepta y las atrasadas siguen descartándose', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 2);
    pc.perderTransporte('failed');
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'solicitud-oferta'), 3000, 'solicitud');
    assert.equal((await emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 3 })).ok, true);
    await esperar(() => cuenta(emisor, 'senal', (d) => d.tipo === 'respuesta' && d.neg === 3), 3000, 'respuesta 3');
    const pc3 = /** @type {any} */ (pagina.conexiones.at(-1));
    pc3.recibirMedios();
    pc3.conectar();
    assert.equal((await esperarFinRecuperacion(pagina)).resultado, 'confirmada');
    assert.equal(await ofertaRespondida(emisor, { neg: 2 }), false, 'la oferta anterior a la recuperación se descarta');
    assert.equal(pc3.cerrada, false);
    assert.equal(pagina.conexiones.length, 2);
  });
});

test('R01-01: tras reabrir el canal, ofertas y candidatos atrasados se descartan y la negociación nueva se acepta', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 2);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === false), 3000, 'el emisor ve la desconexión');
    pagina.pulsar('btn-reintentar');
    await esperar(() => emisor.eventos.filter((e) => e.evento === 'par' && e.datos.presente === true).length === 2, 3000, 'reapertura');
    // Señales atrasadas llegan por el canal nuevo: la oferta 1, la oferta 2 repetida y un candidato de la 1.
    // (Un candidato de la negociación 2, que sigue vigente, es legítimo y se aplicaría.)
    assert.equal(await ofertaRespondida(emisor, { neg: 1 }), false, 'oferta atrasada descartada');
    assert.equal(await ofertaRespondida(emisor, { neg: 2 }), false, 'oferta repetida descartada');
    assert.equal((await emisor.canal.enviar({ tipo: 'candidato', neg: 1, candidato: CANDIDATO })).ok, true);
    await pausa(100);
    assert.equal(pagina.conexiones.length, 1, 'ninguna conexión nueva por señales atrasadas');
    assert.equal(pc.cerrada, false);
    assert.equal(pc.candidatosRecibidos.length, 0, 'el candidato de la negociación 1 se descarta');
    // La negociación nueva se acepta y recupera la misma sesión.
    assert.equal(await ofertaRespondida(emisor, { neg: 3 }), true);
    const pc3 = /** @type {any} */ (pagina.conexiones.at(-1));
    pc3.recibirMedios();
    pc3.conectar();
    assert.equal((await esperarFinRecuperacion(pagina)).resultado, 'confirmada');
  });
});

test('R01-01: compatibilidad: sin negociación correlacionada, ofertas sin identificador sustituyen a la anterior como en E02', async () => {
  await conServidor(async (ctx) => {
    const creada = await (await fetchReal(`${ctx.base}/api/sesiones`, { method: 'POST' })).json();
    const emisor = ctx.participante(creada.sesion, creada.tokenEmisor);
    await esperar(() => cuenta(emisor, 'bienvenida'), 3000, 'emisor');
    const pagina = await ctx.abrir(`/?s=${creada.sesion}#${creada.tokenEspectador}`);
    await esperar(() => cuenta(emisor, 'par', (d) => d.presente === true), 3000, 'espectador');
    assert.equal(await ofertaRespondida(emisor, {}), true);
    assert.equal(await ofertaRespondida(emisor, {}), true);
    assert.equal(pagina.conexiones.length, 2);
    assert.ok(emisor.eventos.filter((e) => e.evento === 'senal' && e.datos.tipo === 'respuesta').every((e) => e.datos.neg === undefined));
  });
});

// ---------- E03-R01-02: confirmación con el transporte perdido durante la comprobación ----------

/**
 * Espectador conectado con una recuperación pedida por la página; `durante(pc, lectura)` se ejecuta en cada
 * lectura de estadísticas de la conexión actual (como la sonda de la auditoría).
 * @param {any} ctx
 * @param {(pc: any, lectura: number, pagina: Pagina) => void} durante
 */
async function recuperacionConIncidente(ctx, durante) {
  const { pagina, pc } = await espectadorCon(ctx, 1);
  let lecturas = 0;
  const original = pc.getStats.bind(pc);
  pc.getStats = async () => {
    const r = await original();
    lecturas += 1;
    durante(pc, lecturas, pagina);
    return r;
  };
  pagina.pulsar('btn-reintentar');
  return { pagina, pc, resultado: await esperarFinRecuperacion(pagina) };
}

test('R01-02: failed durante getStats no se confirma como recuperación (sonda de la auditoría)', async () => {
  await conServidor(async (ctx) => {
    const { pagina, resultado } = await recuperacionConIncidente(ctx, (pc, n) => {
      if (n === 2) pc.perderTransporte('failed');
    });
    assert.notEqual(resultado.resultado, 'confirmada', JSON.stringify(resultado));
    assert.doesNotMatch(pagina.texto('estado-recuperacion'), /confirmada/);
    assert.notEqual((await pagina.diagnostico()).continuidad.estado, 'recuperacion-confirmada');
  });
});

test('R01-02: disconnected transitorio durante el intervalo de progreso invalida la comprobación', async () => {
  await conServidor(async (ctx) => {
    const { resultado } = await recuperacionConIncidente(ctx, (pc, n) => {
      if (n === 1) {
        pc.perderTransporte('disconnected');
        setTimeout(() => pc.conectar(), 200); // vuelve antes de la lectura siguiente
      }
    });
    assert.notEqual(resultado.resultado, 'confirmada', JSON.stringify(resultado));
  });
});

test('R01-02: una pista silenciada o terminada durante la comprobación impide confirmar', async () => {
  for (const incidente of /** @type {const} */ (['silenciar', 'terminar'])) {
    await conServidor(async (ctx) => {
      const { pagina, pc, remoto } = await espectadorCon(ctx, 1);
      const pista = /** @type {any} */ (remoto.getTracks()[0]);
      let lecturas = 0;
      const original = pc.getStats.bind(pc);
      pc.getStats = async () => {
        const r = await original();
        lecturas += 1;
        if (lecturas === 1) {
          if (incidente === 'silenciar') pista.silenciar();
          else pista.terminar();
        }
        return r;
      };
      pagina.pulsar('btn-reintentar');
      const resultado = await esperarFinRecuperacion(pagina);
      assert.notEqual(resultado.resultado, 'confirmada', `${incidente}: ${JSON.stringify(resultado)}`);
    });
  }
});

test('R01-02: un cambio de conexión durante las lecturas no se confirma', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 1);
    let lecturas = 0;
    const original = pc.getStats.bind(pc);
    pc.getStats = async () => {
      const r = await original();
      lecturas += 1;
      if (lecturas === 1) void emisor.canal.enviar({ tipo: 'oferta', sdp: SDP, neg: 5 });
      return r;
    };
    pagina.pulsar('btn-reintentar');
    // La conexión nueva no llega a conectar: el reintento termina al agotar la espera de conexión.
    const resultado = await esperarFinRecuperacion(pagina, LIMITES_RECUPERACION.conexionMs + LIMITES_RECUPERACION.negociacionMs + 5000);
    assert.notEqual(resultado.resultado, 'confirmada', JSON.stringify(resultado));
  });
});

test('R01-02: perder la señalización durante la comprobación impide confirmar', async () => {
  await conServidor(async (ctx) => {
    const { resultado } = await recuperacionConIncidente(ctx, (_pc, n, pagina) => {
      if (n === 1) /** @type {any} */ (pagina.flujosEventos.at(-1)).cortar('eof');
    });
    assert.notEqual(resultado.resultado, 'confirmada', JSON.stringify(resultado));
  });
});

test('R01-02: finalizar durante el intervalo entre lecturas cancela sin declarar recuperación', async () => {
  await conServidor(async (ctx) => {
    const { emisor, pagina, pc } = await espectadorCon(ctx, 1);
    let lecturas = 0;
    const original = pc.getStats.bind(pc);
    pc.getStats = async () => {
      const r = await original();
      lecturas += 1;
      if (lecturas === 1) setTimeout(() => pagina.pulsar('btn-salir'), 100);
      return r;
    };
    pagina.pulsar('btn-reintentar');
    await esperar(() => pagina.visible('vista-final'), 3000, 'salida');
    await pausa(LIMITES_RECUPERACION.intervaloProgresoMs * 2);
    const d = await pagina.diagnostico();
    assert.notEqual(d.recuperacion.resultado, 'confirmada');
    assert.equal(cuenta(emisor, 'fin'), 0);
  });
});

test('R01-02: sin incidentes, la recuperación sigue confirmándose', async () => {
  await conServidor(async (ctx) => {
    const { resultado, pagina } = await recuperacionConIncidente(ctx, () => {});
    assert.equal(resultado.resultado, 'confirmada');
    assert.equal(resultado.detalle, 'recepcion-confirmada');
    assert.match(pagina.texto('estado-recuperacion'), /Confirma tú que se ve y se oye/);
  });
});

// ---------- E03-R01-03: progreso incompleto de audio ----------

/**
 * @param {Record<string, number | null>} v
 * @param {Record<string, number | null>} a
 */
const m = (v, a) => ({ video: v, audio: a });

test('R01-03: el espectador exige bytes de audio y de video además de fotogramas y paquetes', () => {
  const antes = m({ bytesRecibidos: 10, fotogramasDecodificados: 1 }, { paquetesRecibidos: 1, bytesRecibidos: 100 });
  const sonda = m({ bytesRecibidos: 20, fotogramasDecodificados: 2 }, { paquetesRecibidos: 2, bytesRecibidos: 100 });
  assert.notEqual(evaluarProgreso('espectador', antes, sonda), 'recepcion-confirmada', 'sonda: bytes de audio sin avance');
  assert.equal(evaluarProgreso('espectador', antes, sonda), 'parcial');
  const todo = m({ bytesRecibidos: 20, fotogramasDecodificados: 2 }, { paquetesRecibidos: 2, bytesRecibidos: 200 });
  assert.equal(evaluarProgreso('espectador', antes, todo), 'recepcion-confirmada');
});

test('R01-03: contadores faltantes, detenidos, decrecientes o de un solo medio no confirman', () => {
  const antes = m({ bytesRecibidos: 10, fotogramasDecodificados: 1 }, { paquetesRecibidos: 1, bytesRecibidos: 100 });
  // Faltante: bytes de audio no disponibles.
  assert.equal(evaluarProgreso('espectador', antes, m({ bytesRecibidos: 20, fotogramasDecodificados: 2 }, { paquetesRecibidos: 2, bytesRecibidos: null })), 'no-verificable');
  assert.equal(evaluarProgreso('espectador', m({ bytesRecibidos: 10, fotogramasDecodificados: 1 }, { paquetesRecibidos: 1 }), antes), 'no-verificable');
  // Detenidos.
  assert.equal(evaluarProgreso('espectador', antes, antes), 'sin-progreso');
  // Decrecientes: la comparación no es válida.
  assert.equal(evaluarProgreso('espectador', antes, m({ bytesRecibidos: 5, fotogramasDecodificados: 2 }, { paquetesRecibidos: 2, bytesRecibidos: 200 })), 'no-verificable');
  // Un solo medio.
  assert.equal(evaluarProgreso('espectador', antes, m({ bytesRecibidos: 20, fotogramasDecodificados: 2 }, { paquetesRecibidos: 1, bytesRecibidos: 100 })), 'parcial');
  assert.equal(evaluarProgreso('espectador', antes, m({ bytesRecibidos: 10, fotogramasDecodificados: 1 }, { paquetesRecibidos: 2, bytesRecibidos: 200 })), 'parcial');
  // Emisor: decreciente y un solo medio.
  const e = m({ bytesEnviados: 100 }, { bytesEnviados: 50 });
  assert.equal(evaluarProgreso('emisor', e, m({ bytesEnviados: 90 }, { bytesEnviados: 60 })), 'no-verificable');
  assert.equal(evaluarProgreso('emisor', e, m({ bytesEnviados: 100 }, { bytesEnviados: 60 })), 'parcial');
});

// ---------- E03-R01-04: conflictos HTTP 409 ----------

test('R01-04: los 409 se distinguen por su código: rol ocupado, otro participante ausente o conflicto desconocido', () => {
  assert.equal(categoriaCanal({ estadoHttp: 409, error: 'rol-ya-conectado' }), 'rol-ocupado');
  assert.equal(categoriaCanal({ estadoHttp: 409, error: 'par-ausente' }), 'par-ausente');
  assert.equal(categoriaCanal({ estadoHttp: 409, error: 'otra-cosa TOKEN' }), 'conflicto');
  assert.equal(categoriaCanal({ estadoHttp: 409 }), 'conflicto');
});

test('R01-04: respuestas 409 reales del servidor: rol ya conectado y otro participante ausente', async () => {
  const app = crearServidor({ barridoMs: 20, latidoMs: 50 });
  try {
    const { port } = await app.escuchar(0, '127.0.0.1');
    const base = `http://127.0.0.1:${port}`;
    const s = await (await fetch(`${base}/api/sesiones`, { method: 'POST' })).json();
    /** @type {{ estado: string, detalle?: any }[]} */
    const estados = [];
    const nuevo = () =>
      new CanalSenalizacion({ base, sesion: s.sesion, token: s.tokenEmisor, alEvento: () => {}, alEstado: (estado, detalle) => estados.push({ estado, detalle }) });
    const primero = nuevo();
    void primero.abrir();
    await esperar(() => estados.some((e) => e.estado === 'conectada'), 3000, 'primero conectado');
    const segundo = nuevo();
    await segundo.abrir();
    assert.equal(categoriaCanal(estados.at(-1)?.detalle), 'rol-ocupado');
    const envio = await primero.enviar({ tipo: 'oferta', sdp: SDP, neg: 1 });
    assert.equal(envio.estadoHttp, 409);
    assert.equal(categoriaCanal(envio), 'par-ausente');
    primero.cerrar();
  } finally {
    await app.cerrar();
  }
});

test('R01-04: el reintento acotado solo se aplica al rol ocupado; otro 409 se informa una vez', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion } = await emisorConEspectador(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');
    pagina.decidirAperturaEventos(() => ({ estado: 409, error: 'conflicto-inventado' }));
    const aperturas = pagina.aperturasEventos();
    pagina.pulsar('btn-reintentar');
    const r = await esperarFinRecuperacion(pagina);
    assert.equal(pagina.aperturasEventos() - aperturas, 1, 'un 409 que no es rol ocupado no se reintenta');
    assert.notEqual(r.detalle, 'rol-ocupado');
    assert.doesNotMatch(pagina.texto('estado-recuperacion'), /conserva el canal anterior/);
    assert.equal(JSON.stringify(cronologia(pagina)).includes('conflicto-inventado'), false, 'no se copia el código recibido');
    pagina.decidirAperturaEventos(() => ({ estado: 409, error: 'rol-ya-conectado' }));
    const otras = pagina.aperturasEventos();
    pagina.pulsar('btn-reintentar');
    assert.equal((await esperarFinRecuperacion(pagina)).detalle, 'rol-ocupado');
    assert.equal(pagina.aperturasEventos() - otras, LIMITES_RECUPERACION.intentosRolOcupado);
  });
});

// ---------- E03-R01-05: bienvenida pendiente tras HTTP 200 ----------

test('R01-05: una reapertura con HTTP 200 pero sin bienvenida se cancela y no queda como canal utilizable', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion } = await emisorConEspectador(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');
    pagina.decidirAperturaEventos(() => 'sin-bienvenida');
    pagina.pulsar('btn-reintentar');
    await esperar(async () => (await pagina.diagnostico()).canalDetalle === 'conectada', 3000, 'HTTP 200 recibido');
    assert.notEqual((await pagina.diagnostico()).continuidad.estado, 'conectada', 'HTTP 200 sin bienvenida no es una señalización confirmada');
    const r = await esperarFinRecuperacion(pagina, LIMITES_RECUPERACION.bienvenidaMs + 3000);
    assert.equal(r.detalle, 'tiempo-agotado');
    const d = await pagina.diagnostico();
    assert.notEqual(d.canalDetalle, 'conectada', 'la apertura no confirmada no queda como canal');
    assert.equal(pagina.aperturasSinBienvenida.at(-1)?.cancelada, true, 'la petición se canceló');
    assert.equal(d.continuidad.estado, 'requiere-intervencion');
  });
});

test('R01-05: la bienvenida se reconoce aunque la negociación que dispara quede pendiente', async () => {
  await conServidor(async ({ app, abrir, participante }) => {
    const pagina = await abrir('/');
    const { sesion } = await emisorConEspectador(pagina, participante);
    const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
    flujo.cortar('error');
    flujo.liberarServidor();
    await esperar(() => app.almacen.obtener(sesion)?.canales.emisor === null, 3000, 'canal liberado');
    pagina.retenerNegociacion({ oferta: true }); // la oferta que lanza la bienvenida no termina
    pagina.pulsar('btn-reintentar');
    await pausa(LIMITES_RECUPERACION.bienvenidaMs + 1000);
    const d = await pagina.diagnostico();
    assert.equal(d.canalDetalle, 'conectada', 'el canal con bienvenida no se cierra por la negociación pendiente');
    assert.ok(app.almacen.obtener(sesion)?.canales.emisor, 'el servidor tiene el canal');
    assert.notEqual(d.recuperacion.detalle, 'tiempo-agotado', 'no se informa como bienvenida agotada');
    pagina.pulsar('btn-finalizar');
    pagina.liberarNegociacion();
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
  });
});

// ---------- E03-R01-06: confirmación heredada por otra conexión ----------

test('R01-06: una confirmación anterior no se presenta como estado de una conexión posterior no verificada', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    pagina.avanzarMedios(true);
    const { sesion, tokenEspectador, espectador, pc } = await emisorConEspectador(pagina, participante);
    pc.perderTransporte('failed');
    pagina.pulsar('btn-reintentar');
    await esperar(() => cuenta(espectador, 'senal', (d) => d.tipo === 'oferta' && d.neg === 2), 3000, 'oferta 2');
    assert.equal((await espectador.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg: 2 })).ok, true);
    const pc2 = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc2.remoteDescription, 3000, 'respuesta 2');
    pc2.conectar();
    assert.equal((await esperarFinRecuperacion(pagina)).resultado, 'confirmada');
    // El espectador sale y vuelve: otra conexión conecta sin comprobación.
    assert.equal((await espectador.canal.enviar({ tipo: 'salir' })).ok, true);
    const otro = participante(sesion, tokenEspectador);
    await esperar(() => cuenta(otro, 'senal', (d) => d.tipo === 'oferta'), 3000, 'oferta al que vuelve');
    const neg = otro.eventos.filter((e) => e.evento === 'senal' && e.datos.tipo === 'oferta').at(-1)?.datos.neg;
    assert.equal((await otro.canal.enviar({ tipo: 'respuesta', sdp: SDP, neg })).ok, true);
    const pc3 = /** @type {any} */ (pagina.conexiones.at(-1));
    await esperar(() => pc3.remoteDescription, 3000, 'respuesta');
    pc3.conectar();
    const c = (await pagina.diagnostico()).continuidad;
    assert.notEqual(c.estado, 'recuperacion-confirmada', 'la confirmación pertenece a la conexión que la produjo');
    assert.equal(c.estado, 'conectada');
    assert.doesNotMatch(pagina.texto('estado-recuperacion'), /^Recuperación técnica confirmada/, 'el mensaje no describe la conexión actual');
  });
});

// ---------- E03-R01-07: capturas superpuestas al reactivar ----------

test('R01-07: al reactivar tras terminar una pista, la superviviente se libera antes de pedir la captura nueva', async () => {
  await conServidor(async ({ abrir, participante }) => {
    const pagina = await abrir('/');
    await emisorConEspectador(pagina, participante);
    const [video, audio] = /** @type {any[]} */ (pagina.flujos[0].getTracks());
    video.terminar();
    assert.equal(audio.readyState, 'live');
    pagina.capturaAutomatica(false);
    pagina.pulsar('btn-activar');
    assert.equal(pagina.capturas.length, 1, 'captura nueva solicitada');
    assert.equal(pagina.pistasVivas(), 0, 'ninguna pista local activa mientras se solicita la nueva');
    // Permiso denegado en la reactivación: sin pistas y con posibilidad de reintentar.
    pagina.capturas[0].rechazar('NotAllowedError');
    await pausa(30);
    assert.equal(pagina.pistasVivas(), 0);
    assert.equal(pagina.habilitado('btn-activar'), true);
    assert.equal(pagina.visible('mensaje-error'), true);
    // Finalizar durante otra reactivación: la captura tardía se descarta.
    pagina.pulsar('btn-activar');
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'finalizada');
    pagina.capturas[1].resolver();
    await pausa(30);
    assert.equal(pagina.pistasVivas(), 0);
    assert.equal((await pagina.diagnostico()).capturasDescartadas, 1);
  });
});

// ---------- E03-R01-08: finalizar sin objeto canal ----------

/**
 * Emisor cuya reapertura se agotó sin bienvenida (con la corrección de R01-05, sin canal vigente).
 * @param {any} ctx
 */
async function emisorConReaperturaAgotada(ctx) {
  const pagina = await ctx.abrir('/');
  const datos = await emisorConEspectador(pagina, ctx.participante);
  const flujo = /** @type {any} */ (pagina.flujosEventos.at(-1));
  flujo.cortar('error');
  flujo.liberarServidor();
  await esperar(() => ctx.app.almacen.obtener(datos.sesion)?.canales.emisor === null, 3000, 'canal liberado');
  pagina.decidirAperturaEventos(() => 'sin-bienvenida');
  pagina.pulsar('btn-reintentar');
  await esperarFinRecuperacion(pagina, LIMITES_RECUPERACION.bienvenidaMs + 3000);
  pagina.decidirAperturaEventos(() => null);
  return { pagina, ...datos };
}

test('R01-08: finalizar tras una reapertura agotada libera en el acto y avisa al servidor con la autorización vigente', async () => {
  await conServidor(async (ctx) => {
    const { pagina, sesion, espectador } = await emisorConReaperturaAgotada(ctx);
    const aperturas = pagina.aperturasEventos();
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'cierre local inmediato');
    assert.equal(pagina.pistasVivas(), 0);
    await esperar(async () => (await pagina.diagnostico()).avisoCierre === 'confirmado', 4000, 'fin confirmado');
    assert.equal(ctx.app.almacen.obtener(sesion), undefined, 'el servidor eliminó la sesión');
    await esperar(() => cuenta(espectador, 'fin', (d) => d.motivo === 'finalizada-por-el-emisor'), 3000, 'el espectador recibe el fin');
    assert.equal(pagina.aperturasEventos(), aperturas, 'no se reabrió el flujo de eventos para avisar');
  });
});

test('R01-08: con la red aún interrumpida, el fin consta como no confirmado y no se presenta la sesión como eliminada', async () => {
  await conServidor(async (ctx) => {
    const { pagina, sesion } = await emisorConReaperturaAgotada(ctx);
    pagina.retenerSenales((/** @type {any} */ s) => s.tipo === "fin");
    pagina.pulsar('btn-finalizar');
    await esperar(() => pagina.visible('vista-final'), 1000, 'cierre local inmediato');
    assert.equal(pagina.pistasVivas(), 0);
    await esperar(async () => (await pagina.diagnostico()).avisoCierre === 'sin-confirmar', 6000, 'aviso sin confirmar');
    assert.match(pagina.texto('mensaje-error'), /no confirmó el fin de la sesión/);
    assert.doesNotMatch(pagina.texto('estado-senal'), /eliminó la sesión/);
    assert.ok(ctx.app.almacen.obtener(sesion), 'la sesión sigue en el servidor y no se finge lo contrario');
  });
});
