# Registro de decisiones del promotor — v1.2

| Campo | Valor |
| --- | --- |
| Versión | 1.2 |
| Fecha | v1.0: 17-10-2026. v1.1 y v1.2: 18-10-2026 (America/Bogota) |
| Entrega | v1.0: LIVE-FASE02-E01 v1.1. v1.1: LIVE-FASE02-E03 v1.0. v1.2: LIVE-FASE03-E01 v1.2, que corrige la v1.0 y la v1.1 tras las revisiones R01 y R02 sin cambiar este registro ([plan por fases, v1.6](../estado/PLAN-POR-FASES.md)) |
| Base | v1.0: `bc5f14617f68a334cffb4f5dfaf10de4f4f9ced4`. v1.1: `14926d2575acf492afdbfb60a8777eabfa077fcd`. v1.2: `4cd3ce453f2bdb8ba34f763e5c87836d4187a683` |
| Estado | v1.0 publicada en `65378a4` con E01 v1.1. v1.1 publicada en `8128802` con E03 v1.0. v1.2 preparada; pendiente de auditoría y publicación manual. La respuesta que registra RD-011 ya está recibida, aunque su documentación aún no esté publicada |

Historial:

| Versión | Entradas | Entrega | Publicación |
| --- | --- | --- | --- |
| 1.0 | RD-001 a RD-005 | LIVE-FASE02-E01 v1.1 | `65378a49c17453aa768ca871819abe6748a03908` |
| 1.1 | RD-006 a RD-010 | LIVE-FASE02-E03 v1.0 | `8128802bbeca0349755776a0383e79853ff8c4b8` |
| 1.2 | RD-011 | LIVE-FASE03-E01 v1.2 | No publicada |

## 1. Relación con la definición v0.33

- La [definición v0.33](proyecto-live-definicion-v0.33.md) es la base original de requisitos. Se conserva sin cambios como referencia histórica ([SHA256SUMS](SHA256SUMS)).
- La propia v0.33 establece que los requisitos cambian mediante un registro de decisiones, no mediante ediciones implícitas ([§5](proyecto-live-definicion-v0.33.md#5-organización-y-versiones-propuestas)). Este archivo es ese registro.
- El registro prevalece sobre la v0.33 **solo** en los cambios explícitos de sus entradas. En todo lo demás siguen vigentes las decisiones de la v0.33.
- No es una definición v0.34 ni copia la v0.33.

## 2. Reglas del registro

- Cada entrada tiene un identificador estable (`RD-001`, `RD-002`…). Un identificador no se reutiliza ni se renumera. Una corrección posterior se registra como entrada nueva que indica qué entrada sustituye.
- Tipos de entrada:
  - **decisión**: elección del promotor que fija o cambia un requisito;
  - **preferencia**: orientación del promotor que no fija el requisito;
  - **dato pendiente**: respuesta recibida que deja el dato abierto, por ejemplo «sin definir».
- Solo recoge decisiones, preferencias y datos del promotor. Las propuestas técnicas y las confirmaciones de terceros se registran por separado. Este registro no contiene confirmaciones de terceros: no ha habido contacto con terceros.
- Una entrada no resuelve cuestiones jurídicas, contractuales, económicas ni de seguridad.

## 3. Entradas

Origen de RD-001 a RD-005: encargo LIVE-FASE02-E01 v1.1, que recoge la confirmación expresa y la actualización del usuario en su conversación del 17-10-2026 (America/Bogota). El encargo ejecutable no se copia en el repositorio.

### RD-001. Alcance del primer piloto

| Campo | Contenido |
| --- | --- |
| Fecha | 17-10-2026 |
| Tipo | **Decisión** definitiva de alcance del promotor. No es una propuesta de Claude |
| Registro | La prioridad del primer piloto son las transmisiones en vivo. Los juegos con monedas quedan para una etapa posterior y **no son obligatorios** para el piloto inicial |
| Efecto | Deja sin efecto, para el primer piloto, la obligatoriedad del casino en el lanzamiento con usuarios reales que establecía la v0.33 (menciones en §4). FASE-02 se orienta al piloto de directos y su economía, y FASE-09 queda diferida ([plan por fases, v1.2](../estado/PLAN-POR-FASES.md)) |
| Límites | No retira los juegos: se conservan para una etapa posterior (RD-002). Esta entrada no decide su obligatoriedad en etapas posteriores. No elimina otras funciones confirmadas ni las declara todas obligatorias para el primer piloto: su alcance funcional concreto sigue por delimitar. Se mantienen las cuestiones jurídicas, contractuales, económicas y de seguridad de los directos y su economía. Las pruebas previas al piloto siguen con contenido neutral, datos y saldos ficticios y entornos de prueba |

### RD-002. Juegos con monedas futuros

| Campo | Contenido |
| --- | --- |
| Fecha | 17-10-2026 |
| Tipo | **Decisión** de conservar los juegos como idea para una etapa posterior. Su forma es una posibilidad, no una decisión |
| Registro | Los juegos con monedas se conservan como idea. Podrían inspirarse en BuzzCast y desarrollarse por nosotros. Reglas, implementación, arquitectura y clasificación jurídica, pendientes |
| Efecto | Los juegos pasan al módulo diferido de FASE-09, sin fecha ni activación autorizada. Este registro no modifica las familias de juegos de la v0.33 (dados y otros juegos rápidos, tragamonedas y ruleta), el papel del anfitrión ni los usos de monedas y ganancias: quedan como antecedente de esa etapa |
| Límites | No se presume exención jurídica por usar monedas ni por el desarrollo propio. La v0.33 ya advierte que desarrollar el software no sustituye la evaluación de la ruta aplicable ([§3, «Pagos y casino en Colombia»](proyecto-live-definicion-v0.33.md#pagos-y-casino-en-colombia)). BuzzCast sigue siendo una referencia de experiencia, no un compromiso de equivalencia. No se decide convertir los juegos en sociales, sustituir sus monedas por puntos ficticios ni cambiar los usos de monedas y ganancias. No se elige la ruta A ni la B |

### RD-003. Territorio de los jugadores de los futuros juegos

| Campo | Contenido |
| --- | --- |
| Fecha | 17-10-2026 |
| Tipo | **Dato pendiente**. Respuesta recibida: «sin definir» |
| Registro | El territorio de los jugadores de los futuros juegos está **sin definir** |
| Sustituye | La respuesta anterior «solo Colombia», que queda sin efecto. Según el encargo de origen, se había dado antes; no consta en los archivos de la base `bc5f146` |
| Efecto | Responde la pregunta 1 de la [ficha del promotor](../expedientes/LIVE-FASE02-E01-ficha-promotor.md#3-primer-bloque-de-preguntas-al-promotor). No bloquea el piloto de directos. El dato se difiere con los juegos |
| Límites | Solo se refiere a los jugadores de los futuros juegos. No se extiende a creadores, anfitriones ni espectadores. No decide la admisibilidad de ningún territorio (Q2 y Q20 del [borrador de expedientes](../expedientes/LIVE-005-006-borrador.md)) |

### RD-004. País de la empresa operadora

| Campo | Contenido |
| --- | --- |
| Fecha | 17-10-2026 |
| Tipo | **Preferencia** |
| Registro | Colombia es la preferencia inicial para constituir la empresa operadora, abierta a alternativas justificadas. La empresa aún no está constituida |
| Efecto | Responde la pregunta 2 de la [ficha del promotor](../expedientes/LIVE-FASE02-E01-ficha-promotor.md#3-primer-bloque-de-preguntas-al-promotor) (P6) |
| Límites | País y forma societaria no están decididos definitivamente. La preferencia no sustituye la asesoría profesional (Q11, Q14, Q19 y Q20 del borrador; fiscalidad). No cambia que Colombia sea el primer mercado de recargas y retiros según la v0.33 |

### RD-005. Importe para asesoría

| Campo | Contenido |
| --- | --- |
| Fecha | 17-10-2026 |
| Tipo | **Dato pendiente**. Respuesta recibida: «sin definir» |
| Registro | El importe inicial para asesoría y validaciones externas de FASE-02 está **sin definir** |
| Efecto | Responde la pregunta 3 de la [ficha del promotor](../expedientes/LIVE-FASE02-E01-ficha-promotor.md#3-primer-bloque-de-preguntas-al-promotor) |
| Límites | «Sin definir» no equivale a cero. No resuelve el capital inicial, que sigue sin definir (P2). La referencia mensual previa de US$3.000 aparte de Claude conserva su carácter de referencia, no de límite de diseño ([v0.33, §3, «Presupuesto y dimensión del piloto»](proyecto-live-definicion-v0.33.md#presupuesto-y-dimensión-del-piloto)) |

### RD-006. Aportes directos en dinero

| Campo | Contenido |
| --- | --- |
| Fecha | 18-10-2026 |
| Tipo | **Decisión** del promotor |
| Origen | Respuesta «A1» a la pregunta A de la [propuesta E02, §4](../expedientes/LIVE-FASE02-E02-alcance-piloto.md#4-decisiones-mínimas-del-promotor). Origen común en §6 |
| Registro | Posponer para después del primer piloto los aportes directos en dinero de LIVE-F07 |
| Efecto | Los aportes directos (tramo K2 de E02) no forman parte del primer piloto. FASE-08 conserva recargas, regalos, accesos, ingresos y retiros de creadores, y difiere solo el componente de aportes directos ([plan por fases, v1.4](../estado/PLAN-POR-FASES.md)) |
| Límites | Se conservan como función futura, con sus reglas de la v0.33: pago independiente en dinero, comisión menor que la de los regalos y abono al banco del creador. No se posponen los regalos con monedas ni el resto de la economía del piloto |

### RD-007. Contenido exclusivo del perfil

| Campo | Contenido |
| --- | --- |
| Fecha | 18-10-2026 |
| Tipo | **Decisión** del promotor |
| Origen | Respuesta «B2» a la pregunta B de la [propuesta E02, §4](../expedientes/LIVE-FASE02-E02-alcance-piloto.md#4-decisiones-mínimas-del-promotor). Origen común en §6 |
| Registro | Incluir en el primer piloto el contenido exclusivo del perfil: fotos y videos, compras individuales, suscripciones y publicación de grabaciones, con las reglas vigentes de la v0.33 |
| Reglas que se conservan | Pago con saldo interno. Precios y catálogo elegidos por el creador. Renovación manual o automática elegida por el usuario. Compras sin vencimiento mientras el contenido siga disponible. Pagar un intervalo no da acceso a una grabación. La grabación del creador es opcional, no automática |
| Efecto | El tramo K1 de E02 entra en el circuito del piloto. Sus ingresos del creador se retiran por la misma solicitud de retiro (C6), sin otra política. FASE-07 incluye este contenido |
| Límites | No resuelve la grabación técnica del proveedor, su retención ni su admisibilidad. Se mantiene el orden de E02, §3.5: Q12 y Q21 primero y, después, decisión informada, sin dependencia circular. Publicar una grabación no concede acceso automático por haber pagado el directo. Las condiciones jurídicas y contractuales de este contenido siguen pendientes (Q10 (d), Q16 y Q21, entre otras) |

### RD-008. Campañas QR remuneradas

| Campo | Contenido |
| --- | --- |
| Fecha | 18-10-2026 |
| Tipo | **Decisión** del promotor |
| Origen | Respuesta «C1» a la pregunta C de la [propuesta E02, §4](../expedientes/LIVE-FASE02-E02-alcance-piloto.md#4-decisiones-mínimas-del-promotor). Origen común en §6 |
| Registro | Posponer para después del primer piloto las campañas QR remuneradas de LIVE-F11, con sus tareas y bonos |
| Efecto | El tramo K3 de E02 y FASE-10 quedan diferidos, sin fecha ni activación autorizada. FASE-10 no es prerrequisito de FASE-11 ni de FASE-12. Sus validaciones exclusivas (Q17, Q22 y CP-2) y las pruebas exclusivas del cartel QR se difieren con el módulo |
| Límites | No se elimina la función del producto. Sus reglas de la v0.33 se conservan para su etapa: pago base y bono, dinero o monedas a elección del participante, usos de las monedas publicitarias y cartel con video continuo |

### RD-009. «Cercanos»

| Campo | Contenido |
| --- | --- |
| Fecha | 18-10-2026 |
| Tipo | **Decisión** del promotor |
| Origen | Respuesta «D1», sobre la propuesta de E02 de postergar «Cercanos» (M9). Origen común en §6 |
| Registro | Posponer «Cercanos» para después del primer piloto |
| Efecto | FASE-07 difiere «Cercanos» y conserva el resto del descubrimiento. La parte de CP-1 sobre la ubicación aproximada para «Cercanos» se difiere |
| Límites | Se conservan la búsqueda, las categorías y los filtros. No se aplaza todo el descubrimiento ni se habilita ahora la recogida de ubicación para esta función diferida. Sus reglas de la v0.33 (indicador de cercanía, permiso, aparición inicial activada y opción de ocultarse) se conservan para su etapa |

### RD-010. Controles del piloto

| Campo | Contenido |
| --- | --- |
| Fecha | 18-10-2026 |
| Tipo | **Decisión** del promotor |
| Origen | Respuesta «E1», sobre los controles que E02 recomendaba adoptar (M1). Origen común en §6 |
| Registro | Adoptar como requisitos del piloto: verificación de identidad y edad de creadores y de las personas que aparezcan; consentimiento documentado; capacidad de bloqueo e interrupción de directos; registro de acciones de moderación |
| Efecto | Estas propuestas de la v0.33 pasan a ser requisitos del piloto. La verificación de la mayoría de edad de los espectadores al registrarse sigue vigente |
| Límites | Métodos, proveedores y condiciones concretas, pendientes de validación (Q10, Q14 y Q18, entre otras). No elige vigilancia humana continua, plantilla, horarios, plazos de conservación, proveedor de identidad ni arquitectura |

### RD-011. Acceso internacional de los espectadores

| Campo | Contenido |
| --- | --- |
| Fecha | 18-10-2026 |
| Tipo | **Preferencia**: objetivo de cobertura del promotor |
| Origen | Respuesta del promotor a la pregunta 2 del [expediente E04, §5.3](../expedientes/LIVE-FASE02-E04-validaciones-piloto.md#53-próximo-bloque-al-promotor), en su conversación con ChatGPT del 18-10-2026, transmitida por el encargo LIVE-FASE03-E01 v1.0, que no se copia en el repositorio. No es una confirmación de terceros |
| Registro | Espectadores: «permitir acceso internacional sujeto a las restricciones que se validen» |
| Efecto | Sustituye, como objetivo, el «sin definir» del territorio de los espectadores (E04, §5.2). Las consultas que lo trataban como escenario, por ejemplo Q2 (a), Q11, Q14 y Q15, deben considerar el acceso internacional con las restricciones que resulten de la validación |
| Límites | Es un objetivo de cobertura: no acredita admisión mundial ni fija una lista de países autorizados. No modifica RD-003, referido a los jugadores de juegos futuros. No convierte los cuatro países de residencia de los creadores en territorios de espectadores. No cambia que Colombia sea el primer mercado de recargas y retiros, ni decide desde qué países podrá recargarse. No autoriza el envío de consultas |

## 4. Menciones de la v0.33 afectadas por RD-001

La v0.33 no se modifica. Estas menciones de la obligatoriedad del casino en el lanzamiento, en la primera versión pública o con usuarios reales quedan como **registro histórico** en lo que respecta al primer piloto:

- §1, «Respuestas confirmadas», fila «Casino».
- §3, «Apuestas y monedas con valor económico»: «Decisión vigente: el casino es imprescindible en el lanzamiento con usuarios reales».
- §3, «Distribución elegida y etapas», fila «Lanzamiento inicial».
- §3, «Pagos y casino en Colombia»: «el casino estará en la primera versión pública».
- §3, «Presupuesto y dimensión del piloto»: «conservando el casino como requisito del lanzamiento público».
- §3, «Descubrimiento de directos y perfiles — LIVE-F13»: «incluido el casino desde el lanzamiento».
- §4, «Orden propuesto para la primera fase»: «presencia de casino» y «El casino deja de ser un módulo posterior en el plan de lanzamiento».
- §6, «Preguntas pendientes»: segunda ronda y «la presencia del casino sí están decididas».
- §11, «Registro de cambios», fila v0.3.
- Encargo LIVE-001 incluido en la v0.33: §2, «Mercado, lanzamiento y recursos», y §10, «Control antes de entregar».

La v0.33 advierte que una propuesta que posponga el casino «cambia el producto y debe indicarlo» (encargo LIVE-001, §2). RD-001 lo indica: el aplazamiento es una decisión del promotor, no una propuesta.

## 5. Efectos en otros documentos

De la v1.0 (RD-001 a RD-005):

- [Ficha del promotor, v1.1](../expedientes/LIVE-FASE02-E01-ficha-promotor.md): respuestas al primer bloque de preguntas y paso posterior.
- [Plan por fases, v1.2](../estado/PLAN-POR-FASES.md): alcance de FASE-02 y FASE-09 diferida.
- [Estado del proyecto](../estado/ESTADO-PROYECTO.md): base histórica, requisitos vigentes y pendientes por ámbito.
- La [síntesis LIVE-001 v1.2](../investigacion/LIVE-001-resultado-v1.2.md) no se modifica. Estudió el circuito completo de la v0.33, con casino; no evaluó ni aprobó el piloto de directos sin juegos.

De la v1.1 (RD-006 a RD-010):

- [Plan por fases, v1.4](../estado/PLAN-POR-FASES.md): dependencias de FASE-03, FASE-07, FASE-08, FASE-10, FASE-11 y FASE-12.
- [Estado del proyecto](../estado/ESTADO-PROYECTO.md): decisiones vigentes, efecto económico y pendientes del piloto y de lo diferido.
- [README](../../README.md): descripción del piloto.
- La [propuesta E02, v1.1](../expedientes/LIVE-FASE02-E02-alcance-piloto.md) se conserva sin editar como propuesta histórica. Las decisiones vigentes se leen en este registro y en el estado.

De la v1.2 (RD-011):

- [Estado del proyecto](../estado/ESTADO-PROYECTO.md): territorio de los espectadores, junto con los datos operativos recibidos, que no son cambios de producto.

## 6. Origen y alcance común de RD-006 a RD-010

- **Origen.** El usuario respondió literalmente «A1, B2, C1» y después «D1, E1» el 18-10-2026, en su conversación con ChatGPT. Las respuestas llegaron con el encargo LIVE-FASE02-E03 v1.0, que no se copia en el repositorio. Son decisiones del promotor, no recomendaciones de Claude ni confirmaciones de terceros.
- **Sin aprobación tácita.** Estas respuestas no aprueban las demás recomendaciones de la propuesta E02 ni cierran íntegramente el alcance funcional del piloto.
- **Lo que no cambia.** Los juegos siguen diferidos (RD-001 y RD-002). El país de la operadora (RD-004), el capital, el importe para asesoría (RD-005), las horas reales del promotor (P5) y los demás datos pendientes conservan su estado.
- **Sin autorización de cobros reales.** Las pruebas previas al piloto siguen con contenido neutral, datos y saldos ficticios y entornos de prueba.
