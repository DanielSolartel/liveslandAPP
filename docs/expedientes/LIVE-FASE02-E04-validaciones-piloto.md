# LIVE-FASE02-E04 — Validaciones del piloto: borradores de consulta — v1.1

| Campo | Valor |
| --- | --- |
| ID | LIVE-FASE02-E04 |
| Versión | 1.1 |
| Fase | FASE-02, viabilidad y decisiones del piloto ([plan](../estado/PLAN-POR-FASES.md)) |
| Fecha | 18-10-2026 |
| Base | `8128802bbeca0349755776a0383e79853ff8c4b8` |
| Estado | Borradores preparados. Pendientes de auditoría, publicación manual, revisión del promotor y adaptación a cada destinatario. **Ningún envío está autorizado** |

**Nota de revisión v1.1 (18-10-2026).** Corrige la v1.0, no publicada, tras la auditoría de contenido de ChatGPT. El resto del contenido no cambia.

- **R01-01** (§1.2, §2 y §3.2): la devolución por expulsión ya no se presenta en monedas. Su medio, su liquidación y su financiación siguen sin definir.
- **R01-02** (§1.1, §2 y §4.2): la restricción de contenido de la parte pública enviada a TikTok y Bigo figura como límite documentado, no como requisito del promotor.

Prepara dos borradores de consulta sobre el primer piloto: uno para asesoría jurídica (§3) y otro adaptable a proveedores (§4). Parten de las decisiones del [registro](../producto/REGISTRO-DECISIONES.md) (RD-001 a RD-010) y de las preguntas del [borrador LIVE-005 y LIVE-006](LIVE-005-006-borrador.md), que no se modifica ni se renumera. No es asesoría ni contiene respuestas de terceros. Enviar cualquier consulta requiere otro encargo y una autorización expresa del usuario.

Convenciones:

- **Confirmado**: decisión de la v0.33 o del registro.
- **Propuesta**: recomendación de Claude o propuesta de la v0.33 no elegida.
- **Sin definir**: dato abierto; cuando es posible, se consulta por escenarios.
- **[AG]**: fuente leída por ChatGPT según la [v1.2](../investigacion/LIVE-001-resultado-v1.2.md), pendiente de cotejo propio. **[EB]**: extracto de buscador obtenido en R01; no es un texto oficial. Ninguna se presenta como reverificada.
- Los nombres de proveedores son **candidatos históricos** de los informes, no proveedores seleccionados ni aceptados.

## 1. Descripción común y alcance vigente

Esta sección sirve de anexo común a los dos borradores.

### 1.1 Servicio que se consulta

- **Actividad declarada:** servicio web para adultos de transmisiones en vivo y perfiles exclusivos con **contenido sexual explícito entre adultos**, y monedas de consumo. El piloto **no incluye** apuestas, juegos de azar ni premios.
- **Directos:** un creador por transmisión, con chat y regalos en monedas. Salas exclusivas por intervalos, a las que se accede con regalos. Moderación por el creador y sus moderadores, con supervisión de la plataforma. Emisión simultánea a BuzzCast, TikTok Live y Bigo Live desde un solo celular. Confirmado: las emisiones externas se finalizan al pasar a sala exclusiva.
  - *Límite documentado, no requisito del promotor:* según la [v1.2, §2.1](../investigacion/LIVE-001-resultado-v1.2.md#21-requisitos-revisados), la parte pública enviada a TikTok y Bigo no puede llevar contenido sexual, por sus normas comunitarias [EB]. Está sujeto a la vigencia de esas políticas y pendiente de verificación (Q13).
  - El límite no se extiende a BuzzCast ni a los directos públicos internos. Este expediente no fija qué contenido se permite en ellos.
- **Perfiles exclusivos** ([RD-007](../producto/REGISTRO-DECISIONES.md#rd-007-contenido-exclusivo-del-perfil)): fotos y videos, compras individuales, suscripciones y publicación de grabaciones del creador.
- **Comunidad y descubrimiento:** seguidores; mensajes privados de texto gratuitos, que solo inician los seguidores del creador; inicio con directos recomendados, búsqueda, categorías y filtros; avisos por navegador o celular con permiso.
- **Controles** ([RD-010](../producto/REGISTRO-DECISIONES.md#rd-010-controles-del-piloto)): verificación de la mayoría de edad de los espectadores al registrarse; verificación de identidad y edad de creadores y de las personas que aparezcan; consentimiento documentado; capacidad de bloqueo e interrupción de directos; registro de acciones de moderación. Métodos y proveedores sin elegir.
- **Operación:** solo el usuario del proyecto administra y revisa reportes. Soporte por tickets y chat, con atención humana según su disponibilidad, sin horario fijo. Creadores del piloto por invitación y revisión previa, residentes en Colombia, EE. UU., España y Venezuela.
- **Dimensión:** hasta 5 creadores y 50 espectadores simultáneos en total dentro de la plataforma, y más de 8 h diarias con al menos un directo. Son máximos y un mínimo, no una ocupación media.
- **Mercado y empresa:** Colombia es el primer mercado de recargas y retiros. La empresa operadora aún no existe; la preferencia inicial para constituirla es Colombia, abierta a alternativas justificadas ([RD-004](../producto/REGISTRO-DECISIONES.md#rd-004-país-de-la-empresa-operadora)). El territorio de los espectadores está **sin definir**: no se deduce del mercado de recargas ni de la residencia de los creadores.
- **Etapa:** documentación y viabilidad. No hay aplicación implementada ni cobros reales; las pruebas previas usan saldos ficticios.

### 1.2 Circuito económico del piloto

Resumen de la [propuesta E02, §2](LIVE-FASE02-E02-alcance-piloto.md#2-circuito-económico-funcional), que conserva el detalle. Los tramos describen funciones, no cuentas ni movimientos autorizados.

| Tramo | Qué ocurre | Confirmado | Sin definir |
| --- | --- | --- | --- |
| C1 Recarga | El espectador paga dinero y recibe monedas | Colombia es el primer mercado de recargas | Moneda, equivalencias, proveedor |
| C2 Regalo | El espectador da monedas al creador durante el directo | Cada regalo cuenta una sola vez como ingreso del creador y como base de la comisión | Porcentaje de comisión |
| C3 Acceso por intervalos | Los regalos de C2 que califican (regalo específico o suma) dan acceso a la sala exclusiva | No hay segundo cobro, ingreso ni comisión. El aporte parcial y el excedente ya se aportaron en C2: el excedente sirve en el mismo directo y, al cerrar, vence y queda como regalo. Renovación manual o automática autorizada por el espectador | Duraciones y precios de cada creador; atribución y liquidación |
| C4 Devolución por cierre | Al cerrar el directo, incluido el caso de no reconectar en 1 minuto, se devuelve en monedas el tiempo pagado no consumido | Proporcional, en monedas, financiada entre plataforma y creador | Fórmula de reparto; ajuste del ingreso y de la comisión |
| C5 Devolución por expulsión | Al expulsar a un espectador, se le devuelve el tiempo pagado restante | Proporcional, salvo infracción comprobada por la plataforma tras revisar pruebas | Medio de la devolución, financiación, liquidación, proceso y plazos. Ni la devolución en monedas ni la financiación compartida del cierre se extienden a este caso |
| C6 Retiro del creador | El creador solicita retirar sus ingresos de C2 y de K1 | Solicitudes diarias, con un saldo mínimo de plataforma | Importe y moneda del mínimo, plazo de abono. Una solicitud diaria no garantiza el abono bancario ese mismo día |
| C7 Comisión | La plataforma retiene una parte de C2 (una vez por regalo) y de K1 | Existe una comisión de plataforma | Porcentajes |
| C8 Incidencias | Cobros duplicados o fallidos, contracargos, pagos fallidos al creador | Sin reglas confirmadas | Políticas; reparto de contracargos |
| K1 Compras y suscripciones | El espectador paga con saldo interno publicaciones, paquetes o una suscripción mensual | Incluido (RD-007). Precios y catálogo del creador; renovación manual o automática elegida por el usuario; compras sin vencimiento mientras el contenido siga disponible. Sus ingresos siguen C6 | Unidad de precio; cambios de condiciones |

**Grabación.** La captura es opcional y la activa el creador. La publicación en su perfil está incluida (K1). Pagar un intervalo no da acceso a una grabación. La grabación técnica del proveedor de video es una cuestión distinta y pendiente: Q12 y Q21 la tratan por escenarios, en paralelo y de forma iterativa, y la decisión informada llega después ([E02, §3.5](LIVE-FASE02-E02-alcance-piloto.md#35-orden-de-las-decisiones-de-grabación)). Captura, conservación y publicación se consultan por separado.

**Propuestas que solo pueden citarse como tales**, no como reglas:

- reserva del importe de cada solicitud de retiro frente a solicitudes concurrentes;
- registro del origen, la operación y el destino de cada movimiento;
- escenarios de aceptación de la v0.33, §5: eventos repetidos, regalos simultáneos, saldo insuficiente, desconexiones y devoluciones.

### 1.3 Fuera del piloto

Quedan diferidos para después del primer piloto, sin eliminarse del producto:

- juegos con monedas y anfitriones (RD-001 y RD-002);
- aportes directos en dinero (RD-006; tramo K2 de E02);
- campañas QR remuneradas (RD-008; tramo K3);
- «Cercanos» (RD-009).

Las consultas no los presentan como requisitos del piloto. Cuando una respuesta dependa de que existan después, se pide al destinatario que lo indique (§3.1 y §4.1).

## 2. Matriz de consultas

Los IDs son los del borrador LIVE-005 y LIVE-006 y de la propuesta E02. La columna «Antes del envío o escenarios» distingue un dato imprescindible para enviar la consulta de una variable que puede consultarse por escenarios. Un dato pendiente no bloquea por sí solo el envío.

| ID | Objeto en el piloto | Tramo o función | Destinatario | Dato o evidencia pendiente | Antes del envío o escenarios | Respuesta que permite avanzar |
| --- | --- | --- | --- | --- | --- | --- |
| Q2 (a) | Clasificación del circuito del piloto, sin juegos | C1–C8, K1 | Abogado de juego, con apoyo financiero si hace falta | Territorio de los espectadores | Escenarios: solo Colombia u otros países | Régimen aplicable, o su inaplicabilidad, con normas, supuestos y cambios que alterarían la clasificación |
| Q9 | Monedas, devolución en monedas por cierre, posibles modalidades de restitución por expulsión y saldos de creadores: captación, depósito electrónico o recaudo para terceros | C1, C4, C5, C6, K1 | Abogado financiero | Equivalencias y vigencia de las monedas; medio de la restitución por expulsión | Escenarios | Si aplica alguna figura y qué condiciones o autorización exige |
| Q10 (a)–(e) | Controles que exige el adquirente para contenido adulto, incluidas publicaciones y grabaciones | Moderación, K1, grabación | Adquirentes o procesadores de contenido adulto | Horas del promotor (P5); no existe diseño de moderación | Escenarios: atención sin horario fijo o con franjas declaradas | Condiciones escritas mínimas y su forma de acreditación |
| Q11-S | Entidad y términos para la operadora; preaprobación por tramo; pagos a creadores en CO, US, ES y VE | C1, C6 | Stripe (candidato) | País de la operadora (P6) | Escenarios: Colombia y una alternativa | Aceptación, restricciones o rechazo por tramo, entidad, producto y territorio |
| Q11-P | Alcance de su nota final para servicios adultos; entidad y producto; pagos a creadores en los cuatro países | C6 | Payoneer (candidato) | P6 | Escenarios | Ídem |
| Q11-O | Cobro de monedas y pago a creadores con la actividad declarada; entidad contratante y vinculación (SARLAFT) | C1, C6 | Wise, Bold, adquirentes adultos y bancos colombianos (candidatos) | P6; empresa no constituida | Escenarios para la consulta previa; una vinculación formal exigirá datos que aún no existen | Ídem, y requisitos de vinculación |
| Q12 | Aceptación escrita del contenido explícito; grabación o conservación por defecto; retención y borrado; publicación de grabaciones; facturación | Directos, grabación, K1 | Proveedores de video y alojamiento (candidatos) | Volúmenes | Escenarios con los máximos de §1.1 | Aceptación y condiciones; comportamiento de grabación que alimenta Q21 |
| Q13 | Permisos y capacidades oficiales: clave de emisión desde un servidor de terceros sin PC, chat y regalos, ingesta externa en BuzzCast y cierre de la emisión | Multistream | TikTok, BIGO, BuzzCast | — | Ningún dato imprescindible; no requiere resultados de LIVE-002 | Vía oficial disponible o inexistente, requisitos de cuenta y restricciones oficiales de contenido de cada destino |
| Q14 (a)–(d), sin la parte del jugador | Sujetos y vigencia del Decreto 0769/2026; métodos de verificación de edad; conservación de datos; relación con la verificación de creadores y de personas que aparecen (RD-010) | Registro; controles | Abogado de datos y menores | Método sin elegir | Escenarios por método | Obligaciones, métodos admisibles y plazos de conservación |
| Q15 | Obligaciones de la Ley 679/2001, el Decreto 1524/2002 y normas posteriores | Todo el contenido | Abogado de datos y menores | Sin evidencia reverificada | Ningún dato imprescindible | Obligaciones y restricciones aplicables |
| Q16 | Reglas de consumo del piloto | C3, C4, C5, K1 | Abogado de consumo | Políticas de C8 | Escenarios | Validez de cada regla y cambios necesarios |
| Q18 | Verificación de la edad de los espectadores, y de la identidad y edad de creadores y personas que aparecen | Registro; controles | Proveedores de verificación | Respuesta a Q14 | Escenarios, en paralelo con Q14 | Método, datos que conserva y durante cuánto tiempo, precio y aceptación del sector |
| Q19 | Retenciones, tributos y obligaciones de información de los pagos a creadores | C6 | Tributarista | P6 | Escenarios por país de la operadora | Obligaciones según la residencia del creador |
| Q20 (primera parte) | Sanciones o restricciones para pagar a creadores residentes en Venezuela | C6 | Abogado de comercio internacional | P6; proveedor de pagos | Escenarios | Restricciones y, si existen, vías admisibles |
| Q21 | Escenarios de captura, conservación y publicación, incluida la grabación técnica, con las personas que aparecen | Grabación, K1 | Abogado de datos | Comportamientos del proveedor (Q12) | Escenarios, en paralelo con Q12 | Requisitos por escenario |
| CP-1 (sin «Cercanos») | Mensajes privados, historial de visualización e intereses para recomendaciones | Mensajes; descubrimiento | Abogado de datos | — | Ningún dato imprescindible | Tratamiento permitido, base legal y conservación |
| CP-3 | Monedas compradas no consumidas e incidencias de pago | C1, C8 | Abogado de consumo | Políticas de C8 | Escenarios | Derechos del consumidor y tratamiento de cobros duplicados y contracargos |

CP-1 y CP-3 son consultas propuestas por Claude en la propuesta E02, §3.4, no por el promotor.

**Partes diferidas**, que no se consultan ahora y se conservan:

- Q1; Q2 (a) en lo relativo a los juegos; Q2 (b) y (c); Q3 a Q8;
- Q11-S (b) y Q11-O en lo relativo a aportes directos y casino; Q11-P en lo relativo a juegos de azar;
- Q14 (d) en la identificación del jugador;
- Q17, Q22 y CP-2 (campañas QR);
- Q20 en lo relativo al territorio de los jugadores;
- CP-1 en lo relativo a la ubicación para «Cercanos»;
- P7 y P8.

## 3. Borrador para asesoría jurídica

### 3.1 Texto común

> Le solicitamos su opinión sobre un servicio en preparación, descrito en el anexo. La empresa operadora aún no está constituida. Se trata de una web para adultos con contenido sexual explícito entre adultos, transmisiones en vivo, perfiles exclusivos y monedas de consumo. El piloto no incluye apuestas, juegos de azar ni premios. En una etapa posterior podrían añadirse juegos con monedas, aportes directos en dinero y campañas remuneradas. Si su posible inclusión futura afecta a su respuesta, le pedimos que lo indique; no es necesario analizarlos ahora.
>
> Le agradeceremos que en cada respuesta identifique las normas vigentes y su fecha, el alcance territorial, los supuestos que asume, las restricciones, los cambios que el circuito necesitaría y la información adicional que le haga falta. Algunos datos aún no están definidos; cuando su respuesta dependa de ellos, le pedimos que la plantee por escenarios.
>
> Las referencias que citamos proceden de extractos de buscador o de lecturas no verificadas en fuente oficial. Le pedimos que confirme las condiciones aplicables con los textos vigentes.

El anexo es la §1 de este expediente, adaptada al destinatario.

### 3.2 Preguntas por especialidad

Cada bloque puede enviarse a un profesional distinto. No se presupone que uno solo cubra todas las materias.

**A. Juego y clasificación del circuito** (abogado de juego; puede requerir apoyo financiero)

- **Q2 (a).** ¿El circuito del anexo queda, total o parcialmente, en el régimen colombiano de juegos de suerte y azar, en otro régimen o fuera de ellos? El circuito comprende recarga de dinero a monedas, regalos, acceso a salas por intervalos mediante regalos, compras y suscripciones con saldo interno, devoluciones en monedas e ingresos de creadores con solicitud de retiro, sin juegos ni premios. ¿Qué elementos determinan la clasificación y qué cambios la alterarían?
  - Referencias: Ley 643/2001, art. 38 [EB]; réplicas del Acuerdo 08/2020 de Coljuegos [EB].

**B. Financiero**

- **Q9.** ¿Constituyen las monedas compradas, la devolución proporcional en monedas al cerrar el directo y los saldos de creadores pendientes de pago una captación de recursos del público, un depósito electrónico, un recaudo para terceros u otra actividad sujeta a supervisión?
  - La devolución por expulsión es proporcional, salvo infracción comprobada, pero su medio y su liquidación no están definidos. ¿Qué consecuencias tendría cada posible modalidad de restitución, por ejemplo en monedas o en dinero? Se plantean como escenarios por evaluar, no como decisiones.
  - ¿Qué condiciones de las monedas, como su vigencia, su reembolso o sus límites, cambiarían la respuesta?
  - Referencias: conceptos de la Superintendencia Financiera y de Supersociedades sobre captación [EB] (v1.1, R01G-03).

**C. Consumo**

- **Q16.** ¿Son compatibles con la Ley 1480/2011, y con qué deberes de información, estas reglas?
  1. Pago de contenido solo con saldo interno.
  2. Renovación automática autorizada de intervalos y de suscripciones.
  3. Pausa de los contadores y 1 minuto para reconectar.
  4. Aporte parcial que queda como regalo, y excedente que vence al cerrar y queda como regalo.
  5. Devolución proporcional en monedas al cerrar el directo.
  6. Devolución proporcional al expulsar, salvo infracción comprobada por la plataforma tras revisar las pruebas. Su medio y su liquidación están sin definir.
  7. Compras sin vencimiento mientras el contenido siga disponible.
- **CP-3** (consulta propuesta). ¿Qué exige la normativa de consumo para las monedas compradas y no consumidas: vigencia, reembolso en dinero o retracto? ¿Cómo deben tratarse frente al consumidor los cobros duplicados y los contracargos?

**D. Datos, menores y contenido** (abogado de datos y menores)

- **Q14.**
  - (a) ¿A qué sujetos obliga el Decreto 0769/2026 y desde cuándo? ¿Alcanza a un servicio web de contenido sexual explícito entre adultos?
  - (b) ¿Qué métodos de verificación se consideran «acordes con el riesgo» para los espectadores al registrarse?
  - (c) ¿Qué datos pueden conservarse y durante cuánto tiempo, según la Ley 1581/2012 y las instrucciones de la SIC?
  - (d) ¿Cómo se concilia con la verificación de identidad y edad de creadores y de las personas que aparecen, y con el consentimiento documentado, que son requisitos del piloto?
  - Referencias: Decreto 0769/2026, art. 2.2.31.2.6, lit. c), en la compilación de MinTIC [AG]; Ley 2489/2025 (prensa y extractos de R01).
- **Q15.** ¿Qué obligaciones imponen la Ley 679/2001, el Decreto 1524/2002 y las normas posteriores a un servicio web de contenido sexual explícito entre adultos? No se adjunta evidencia reverificada.
- **Q21.** ¿Qué exige la Ley 1581/2012, respecto de las personas que aparecen, en cada uno de estos escenarios? ¿Qué cambia entre ellos?
  1. Captura activada por el creador.
  2. Conservación por la plataforma o por un proveedor.
  3. Publicación en el perfil del creador.
  4. Grabación técnica del proveedor de video, si se produce.

  Puede responderse sin esperar a Q12. Si llegan datos del proveedor, se incorporarán.
  - Referencias: documentación de Cloudflare sobre grabación y retención [AG].
- **CP-1** (consulta propuesta, sin la parte de «Cercanos»). ¿Qué exige la Ley 1581/2012 para los mensajes privados de texto entre usuarios, y para el historial de visualización y los intereses usados en las recomendaciones, en un servicio de contenido sexual explícito? ¿Son datos sensibles?

**E. Tributario**

- **Q19.** ¿Qué retenciones, tributos y obligaciones de información se aplican a los pagos a creadores residentes en Colombia, EE. UU., España y Venezuela, con solicitudes diarias de retiro? Escenarios: operadora en Colombia, que es la preferencia inicial, y en otro país si el profesional lo considera pertinente.

**F. Comercio internacional**

- **Q20 (primera parte).** ¿Qué sanciones o restricciones afectan a pagar a creadores residentes en Venezuela, según el país de la operadora y el del proveedor de pagos?

### 3.3 Datos que aún no pueden aportarse

País y forma de la operadora; capital; moneda, equivalencias, comisiones, saldo mínimo y plazos; políticas de incidencias; fórmula de las devoluciones; territorio de los espectadores; volúmenes; horas del promotor. Se presentan como datos sin definir (§5.2). Los borradores no incluyen datos personales, documentos de identidad, credenciales ni datos bancarios.

## 4. Borrador para proveedores

### 4.1 Introducción común

> Preparamos un servicio web para adultos con **contenido sexual explícito entre adultos**: transmisiones en vivo, perfiles exclusivos con fotos, videos y grabaciones publicadas, y monedas de consumo. Las monedas se compran con dinero y se usan en regalos, salas exclusivas, compras y suscripciones. Los creadores pueden solicitar el retiro de sus ingresos. El anexo describe el servicio y su piloto.
>
> El piloto no incluye apuestas, juegos de azar ni premios. Más adelante podrían añadirse juegos con monedas, aportes directos en dinero y campañas remuneradas. Le pedimos que nos indique si esos módulos futuros deben declararse ya y de qué forma, y si cambiarían su respuesta.
>
> Para cada actividad y tramo, le agradeceremos que nos indique si lo acepta, con qué restricciones o si no lo admite; la entidad, el producto y los territorios cubiertos; las condiciones y los requisitos; los costos aplicables; y la documentación que respalda su respuesta. Indíquenos también qué forma tiene esa respuesta (por ejemplo, una aceptación escrita individual, una revisión previa o una indicación preliminar) y si requiere que la empresa esté constituida.

Una página comercial o una política pública no equivalen a una aceptación individual. No se presupone que todos los proveedores exijan la misma forma de autorización.

### 4.2 Bloques adaptables

**P-A. Cobros, adquirencia, banco y pagos a creadores** (tramos C1 y C6; K1 se paga con saldo interno, por lo que el proveedor de cobros interviene en la recarga C1)

- **Q11-S** (Stripe, candidato):
  - (a) ¿Qué entidad y qué términos regionales aplican a una operadora constituida en Colombia o, como alternativa, en otro país?
  - (b) ¿Concede una preaprobación escrita para el cobro de monedas usadas en contenido adulto y para el pago a creadores?
  - (c) ¿Admite pagos a creadores residentes en Colombia, EE. UU., España y Venezuela para esta actividad?
  - Referencias: *Restricted Businesses* y SSA §1.2(a)(ix) [AG]; Global Payouts [EB]. Parte diferida: (b) en lo relativo al casino y a los aportes directos.
- **Q11-P** (Payoneer, candidato):
  - (a) ¿Alcanza la nota final de su lista a los servicios adultos, y en qué condiciones?
  - (b) ¿Qué entidad y qué producto aplican?
  - (c) ¿Puede pagar a creadores residentes en los cuatro países?
  - Referencia: *Prohibited transaction list* [AG]. Parte diferida: juegos de azar.
- **Q11-O** (Wise, Bold, adquirentes adultos y bancos colombianos, candidatos): con la actividad declarada, ¿aceptan el cobro de monedas y el pago a creadores? ¿Con qué entidad contratante y qué vinculación (SARLAFT) exigen a la operadora?
  - Sin evidencia reverificada. Parte diferida: aportes directos.
- Pendientes del bloque: P6 (escenarios); empresa no constituida; moneda, equivalencias, mínimo y plazos sin definir.

**P-B. Controles de contenido y moderación** (adquirentes o procesadores que admitan contenido adulto declarado)

- **Q10:**
  - (a) ¿Cómo deben acreditarse los controles de la SPME §9.4.1: registro, acuerdos y consentimiento, verificación de creadores y de personas que aparecen, revisión previa, control del directo y quejas en siete días hábiles?
  - (b) ¿Acepta la detección automática con corte inmediato y escalado humano, o exige vigilancia humana continua? ¿Qué guardia mínima?
  - (c) ¿Cuentan los moderadores designados por los creadores?
  - (d) ¿Qué exige para las publicaciones y las grabaciones publicadas?
  - (e) ¿Qué exige Visa para la misma actividad?
  - Referencia: SPME de Mastercard, versión del 04-08-2026, §9.4.1 [AG], sin comprobación de vigencia.
- Pendientes del bloque: horas del promotor (P5), por escenarios; el diseño de moderación no existe. Los controles adoptados (RD-010) no fijan vigilancia continua, plantilla ni horarios.

**P-C. Video, alojamiento y grabación** (candidatos: Cloudflare, AWS IVS y LiveKit; un alojamiento propio también depende de servicios de infraestructura y red contratados, con sus propias condiciones)

- **Q12:** ¿Acepta por escrito contenido sexual explícito legal entre adultos? ¿Graba o conserva las emisiones por defecto? ¿En qué condiciones, con qué retención y con qué borrado? ¿Admite que el creador publique grabaciones en su perfil? ¿Cómo se facturan la entrega WebRTC y la salida a destinos externos?
  - Referencias: *Start a live stream* y *Pricing* de Cloudflare [AG].
- Escenarios de volumen: los máximos de §1.1, sin convertirlos en ocupación media.
- La respuesta sobre los comportamientos de grabación alimenta Q21. No se pide decidir antes la grabación técnica.

**P-D. Verificación de edad e identidad** (proveedores de verificación)

- **Q18:** ¿Qué método ofrece para verificar la mayoría de edad de los espectadores al registrarse? ¿Y para verificar la identidad y la edad de los creadores y de las personas que aparezcan? ¿Qué datos conserva y durante cuánto tiempo? ¿A qué precio? ¿Acepta el sector?
- Se coordina con Q14: ambas pueden consultarse en paralelo, y el método se elegirá después con las dos respuestas.

**P-E. Plataformas externas** (TikTok, BIGO, BuzzCast)

- **Q13:** ¿Permite usar la clave de emisión desde un servidor de terceros y obtenerla sin PC? ¿Hay una API o un programa oficial para consultar el chat y los regalos? ¿Admite BuzzCast ingesta externa? ¿Puede confirmarse por medios oficiales el cierre de la emisión? ¿Qué restricciones oficiales de contenido aplican a la emisión que recibe su plataforma?
  - Referencias: guía oficial de Bigo para PC [EB]. Para TikTok y Bigo, la [v1.2, §2.1](../investigacion/LIVE-001-resultado-v1.2.md#21-requisitos-revisados) documenta un límite de contenido sexual en la parte pública [EB], pendiente de verificación. Para BuzzCast no hay evidencia. La integración no está demostrada técnicamente.
- No requiere resultados de LIVE-002: las pruebas móviles y la demostración técnica siguen en FASE-03.

### 4.3 Documentación no disponible

- Textos oficiales de las normas citadas en §3: los extractos [EB] no son textos oficiales.
- Texto vigente de la SPME §9.4.1 y condiciones de Visa.
- Términos de los candidatos (SSA de Stripe, lista de Payoneer, condiciones de Cloudflare), leídos solo por ChatGPT [AG].
- Anexo del Acuerdo 01/2026 y D.O. 51.452: sin leer. Su materia corresponde a los juegos, que están diferidos.

## 5. Datos faltantes y orden de respuesta

### 5.1 Respuestas recibidas, que no se vuelven a preguntar

- Decisiones RD-001 a RD-010, incluidas las respuestas A1, B2, C1, D1 y E1.
- País de la operadora: Colombia como preferencia inicial, abierta a alternativas (RD-004). La empresa aún no está constituida.
- Importe para asesoría: sin definir (RD-005). Capital: sin definir.
- Capacidad: 5 creadores y 50 espectadores simultáneos como máximo, y más de 8 h diarias con algún directo como mínimo.

### 5.2 Datos pendientes

| Dato | Situación | Quién lo aclara | ¿Imprescindible antes del envío? | Tratamiento en la consulta |
| --- | --- | --- | --- | --- |
| P2 Capital | Sin definir | Promotor | No | Se omite; se pide a cada destinatario qué capital, garantías o reservas exigiría |
| P5 Horas y franjas reales del promotor | Atención según su disponibilidad, sin horario fijo; sin horas declaradas | Promotor; el adquirente fija los mínimos (Q10) | No | Escenarios: sin horario fijo o con franjas declaradas |
| P6 País de constitución | Preferencia por Colombia, sin decidir | Promotor, después de la asesoría (Q11, Q14, Q19 y Q20) | No para la consulta previa; sí para una vinculación formal | Escenario principal en Colombia y la alternativa que indique el destinatario |
| Volúmenes | Solo los máximos y el mínimo | Promotor | No | Escenarios con los máximos, sin convertirlos en media |
| Grabación técnica | Pendiente | Proveedor (Q12) y abogado (Q21); después, el promotor | No | Escenarios, en paralelo |
| Territorio de los espectadores | Sin definir | Promotor; la admisibilidad, los profesionales | No | Escenarios: solo Colombia u otros países |
| Moneda, equivalencias, comisiones, saldo mínimo y plazos | Sin definir | Promotor, con las condiciones de los proveedores | No | Se indican como no fijados |
| Políticas de incidencias (C8) y fórmula de las devoluciones | Sin definir | Promotor, con Q16 y CP-3 | No | Se consultan como reglas por definir |
| Remitente de las consultas | Sin decidir | Promotor | Sí | Pregunta 1 de §5.3 |

### 5.3 Próximo bloque al promotor

Propuesta de hasta tres preguntas nuevas. «Sin definir» es una respuesta válida. No se piden documentos ni datos bancarios.

1. **Remitente.** Mientras la empresa no exista, ¿quién enviaría las consultas: usted como persona natural, un asesor en su nombre, o prefiere esperar a constituir la empresa?
2. **Territorio de los espectadores del piloto.** ¿Solo Colombia, otros países que usted indique, o sin definir para consultarlo por escenarios? No se deduce del mercado de recargas ni de la residencia de los creadores.
3. **Disponibilidad real (P5).** ¿Qué horas semanales y qué franjas podría declarar para atender el soporte y la moderación? Las 20, 40 y 60 h de informes anteriores son supuestos.

### 5.4 Orden propuesto

1. Auditoría de E04 por ChatGPT y publicación manual por el usuario.
2. Revisión de los borradores por el promotor: descripción común (§1), matriz (§2) y textos (§3 y §4).
3. Respuestas del promotor a §5.3, si las da.
4. Encargo posterior para adaptar cada texto a destinatarios concretos, completar los datos disponibles y fijar el remitente. El envío exige una autorización expresa del usuario.
5. Envío por bloques, si se autoriza:
   - primero, lo que condiciona el circuito: Q2 (a), Q9, Q14, Q15, Q16 y CP-3 en la parte jurídica, y Q10, Q11, Q12 y Q18 en la de proveedores;
   - después, Q13, Q19, Q20, Q21 y CP-1.

   Q12 y Q21 pueden enviarse juntas.
6. Registro de cada respuesta como confirmación de un tercero, separada de las decisiones del promotor, con su fecha y su documento.
7. Evaluación por tramo: viable, viable con cambios o bloqueado, con las decisiones que necesite el promotor. Sin abrir otra investigación general.

### 5.5 Listo y pendiente

- **Listo como borrador:** descripción común, matriz y textos de §3 y §4.
- **Falta antes de enviar:**
  - revisión y aprobación del promotor;
  - elegir los destinatarios concretos y adaptar cada texto;
  - fijar el remitente;
  - decidir si se adjuntan documentos oficiales en lugar de las referencias [AG] y [EB];
  - una autorización expresa de envío, mediante encargo.

Ninguna consulta está enviada ni autorizada.
