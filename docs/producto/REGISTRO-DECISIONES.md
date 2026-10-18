# Registro de decisiones del promotor — v1.0

| Campo | Valor |
| --- | --- |
| Versión | 1.0 |
| Fecha | 17-10-2026 (America/Bogota) |
| Entrega | LIVE-FASE02-E01 v1.1, reconciliación documental y alcance del primer piloto ([plan por fases, v1.2](../estado/PLAN-POR-FASES.md)) |
| Base | `bc5f14617f68a334cffb4f5dfaf10de4f4f9ced4` |
| Estado | Preparado. Pendiente de auditoría y publicación manual |

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

- [Ficha del promotor, v1.1](../expedientes/LIVE-FASE02-E01-ficha-promotor.md): respuestas al primer bloque de preguntas y paso posterior.
- [Plan por fases, v1.2](../estado/PLAN-POR-FASES.md): alcance de FASE-02 y FASE-09 diferida.
- [Estado del proyecto](../estado/ESTADO-PROYECTO.md): base histórica, requisitos vigentes y pendientes por ámbito.
- La [síntesis LIVE-001 v1.2](../investigacion/LIVE-001-resultado-v1.2.md) no se modifica. Estudió el circuito completo de la v0.33, con casino; no evaluó ni aprobó el piloto de directos sin juegos.
