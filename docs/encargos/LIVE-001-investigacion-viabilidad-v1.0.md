# LIVE-001 — Investigación de viabilidad — v1.0

Base de requisitos: Proyecto LIVE, definición v0.33.
Fase: investigación previa a arquitectura definitiva e implementación.
Idioma de la respuesta: español.
Identificador del resultado: LIVE-001-resultado-v1.0.

Actúa como investigador principal de producto, tecnología, pagos y operación. Investiga la viabilidad del piloto descrito aquí y entrega un informe que permita decidir la ruta de construcción. Trabaja con fuentes primarias vigentes, evidencia verificable y supuestos explícitos. El resultado de este encargo es documentación para revisión.

Este mensaje contiene el contexto necesario: comienza la investigación con él. El producto podrá recibir nuevas ideas después. Las decisiones pendientes se registran; no hace falta cerrar ahora todos los detalles de interfaz, precios o reglas para investigar los obstáculos fundamentales.

## 1. Objetivo y forma de investigar

Debes responder estas preguntas, en este orden:

1. ¿Existe una ruta legal, contractual y financiera para operar en Colombia este circuito que combina contenido sexual explícito, monedas compradas, casino, monetización de creadores y pagos bancarios?
2. ¿Qué entidades y proveedores podrían cubrir cada tramo, qué aceptan públicamente y qué exigiría aprobación contractual o revisión profesional?
3. ¿Puede ofrecerse el multistream solicitado desde un solo celular, con emisión, chat y regalos de cada destino y cierre externo antes de la transición a una sala exclusiva?
4. ¿Qué infraestructura y operación necesita el piloto, cuánto costarían y qué capital previo tendría que financiarse?
5. ¿Qué decisiones conviene resolver antes de encargar código y qué pruebas pequeñas reducirían primero la incertidumbre?

Clasifica cada conclusión con una de estas etiquetas:

- Requisito confirmado: procede de este encargo.
- Evidencia pública: respaldada por una fuente primaria aplicable, con cita.
- Propuesta: recomendación tuya, todavía no aprobada.
- Confirmación contractual pendiente: requiere aceptación escrita, contrato o documentación privada del proveedor.
- Revisión profesional pendiente: interpretación o trámite que debe validar un profesional competente.
- No comprobado: información insuficiente, inaccesible o contradictoria.

Una política pública favorable permite investigar un candidato; no confirma que admitirá nuestra empresa ni este modelo completo. La falta de documentación pública tampoco demuestra por sí sola una prohibición.

Usa navegación real si la tienes. Indica fecha de consulta, fecha o versión de las fuentes y ámbito territorial. Distingue normas vigentes, proyectos, noticias y documentos históricos. Para una conclusión crítica incluye la página o cláusula precisa, su aplicación al caso y sus límites. Prioriza reguladores, textos oficiales, documentación de desarrolladores, contratos y políticas del propio proveedor. Las páginas de terceros solo sirven para encontrar fuentes primarias o como contexto identificado.

Si no tienes navegación o una fuente resulta inaccesible, decláralo y marca las conclusiones afectadas como no comprobadas. No inventes consultas, citas, licencias, permisos de API, porcentajes, precios ni confirmaciones comerciales. Evita citas extensas: resume y enlaza.

## 2. Base de producto confirmada

LIVE es un identificador provisional. BuzzCast, Tango y Bigo son referencias de experiencia; no implican equivalencia de funciones ni derechos de integración.

### Mercado, lanzamiento y recursos

- Primer mercado de recargas y retiros: Colombia. El país de constitución de la operadora todavía está pendiente.
- Se permitirá desnudez y contenido sexual explícito. Límites detallados y controles concretos deben investigarse.
- Los espectadores deben verificar su mayoría de edad al registrarse, antes de usar la plataforma. Método y proveedor pendientes. Los requisitos de otros roles y personas que aparezcan deben investigarse; todavía no se ha elegido su procedimiento.
- Lanzamiento como web móvil; después una aplicación compatible con las tiendas, inicialmente Android y posiblemente iOS. Hay que identificar qué alcance podría admitirse en esa app posterior.
- El casino es imprescindible desde el lanzamiento con clientes reales. Una propuesta que lo posponga o sustituya sus monedas económicas por puntos ficticios cambia el producto y debe indicarlo.
- La empresa todavía no está constituida; el promotor está dispuesto a constituirla. Capital inicial sin definir.
- Referencia anterior: hasta US$3.000 mensuales aparte de Claude. El usuario aclaró después que no quiere usar esa cifra como límite de diseño. Tiene recursos limitados y desea opciones más económicas que conserven el resultado requerido. No se presumen fondos ilimitados.
- Piloto: hasta 5 creadores y 50 espectadores simultáneos EN TOTAL dentro de nuestra plataforma, no por sala.
- Más de 8 horas diarias con al menos un directo activo. Horas exactas, días de operación y ocupación media pendientes.
- Los espectadores externos, jugadores sin video y participantes de pruebas publicitarias son cargas distintas; no están incluidos automáticamente en esos 50 espectadores.

### LIVE-F01, F02 y F03: directos y multistream

- Un creador por transmisión en la primera versión.
- Multistream y consulta de chats y regalos externos desde UN SOLO CELULAR, SIN COMPUTADOR del creador. Destinos prioritarios: BuzzCast, TikTok Live y Bigo Live.
- Emitir simultáneamente en nuestra plataforma y los destinos externos. Deben investigarse por separado captura y envío de video, lectura de chat y lectura de eventos de regalos.
- Al pasar de un directo público a una sala exclusiva, finalizar las emisiones externas. La comprobación del cierre antes de enviar imágenes exclusivas es una condición técnica por diseñar.
- Desconexión temporal del creador: pausar los contadores de espectadores y dar 1 minuto de reconexión. Sin reconexión, terminar el directo y aplicar las reglas de cierre. Inicio y detección del plazo pendientes.
- Creador y moderadores que designe pueden moderar el chat y expulsar espectadores, además de la supervisión general de la plataforma.
- Expulsión con tiempo pagado restante: devolución proporcional salvo infracción comprobada POR LA PLATAFORMA, revisando pruebas. La expulsión decidida por el creador o moderador no prueba por sí sola la infracción. Proceso, plazos y revisión pendientes.
- Grabación opcional si el creador la activa; podrá publicar la grabación posteriormente en su perfil. No se ha elegido grabar ni publicar todos los directos.
- Pagar un intervalo del directo no concede acceso a esa grabación publicada. Rigen los derechos del perfil; una suscripción que la incluya o una compra válida pueden dar acceso.

### LIVE-F04 y F05: contenido exclusivo y salas por intervalos

- Perfiles con fotos y videos; suscripción mensual y compra individual de publicaciones o paquetes.
- Cada creador fija los precios de suscripciones y publicaciones.
- El creador elige entre incluir todo el contenido exclusivo en la suscripción o incluir un catálogo y vender otras publicaciones aparte.
- Compra individual sin vencimiento mientras siga disponible la publicación; no es garantía de conservación indefinida.
- Publicaciones y suscripciones se pagan SOLO con saldo interno.
- Renovación mensual manual o automática, a elección del usuario.
- Salas con regalo de valor definido cada intervalo de duración definida por el creador. Cada espectador tiene un contador propio desde su entrada.
- El creador elige entre pagar antes de entrar o disfrutar de un primer intervalo gratuito.
- El creador elige entre exigir un regalo específico o acumular el valor de regalos hasta cubrir el intervalo.
- Renovación con regalos manuales y opción automática autorizada por el espectador.
- El contador pagado y el primer contador gratuito se pausan mientras el espectador está fuera y se conservan al volver.
- En el modo de suma, lo aportado que no alcance el precio al vencer permanece como regalo al creador; por sí solo no concede la renovación.
- El excedente se acumula para siguientes intervalos del MISMO directo. Al terminar el directo, el crédito excedente vence y permanece como regalo al creador.
- Al terminar el directo, el tiempo pagado no usado se devuelve proporcionalmente EN MONEDAS.
- Esa devolución por cierre se financia entre plataforma y creador. Fórmula o porcentajes pendientes; no se ha acordado un reparto 50/50.
- Cálculo, redondeo, origen de monedas devueltas, ventana de acumulación, aplicación de crédito y cambios de condiciones requieren un contrato funcional posterior.
- La financiación de devoluciones por expulsión debe precisarse por separado. No extiendas automáticamente una regla de cierre a todos los supuestos.

### LIVE-F06 y F07: recargas, ingresos y aportes directos

- Recargas de dinero para comprar monedas y enviar regalos.
- Creadores del piloto por invitación y revisión previa, residentes en Colombia, Estados Unidos, España y Venezuela.
- Esos cuatro países describen RESIDENCIA DE CREADORES. No amplían automáticamente los mercados de jugadores, espectadores, recargas o campañas.
- Creadores pueden solicitar diariamente retiros de ingresos acumulados por regalos y contenido. Solicitud diaria no significa liquidación bancaria diaria.
- Habrá saldo mínimo de plataforma para solicitar el retiro, con importe por definir.
- País del banco, nacionalidad, residencia, monedas, verificación, saldo elegible, reservas, comisiones y tiempos de entrega pendientes.
- Aportes directos o donaciones con dinero mediante un pago independiente y abono al banco del creador.
- Objetivo: comisión de plataforma menor que la de los regalos. Porcentajes pendientes. Comisión, impuesto, retención fiscal y costo del procesador son conceptos diferentes.
- No está confirmada una entrega bancaria inmediata ni un costo total menor. La liquidación de aportes directos requiere investigar su propia ruta.

### LIVE-F08 y F09: casino y anfitriones

- Juegos iniciales: dados y otros juegos rápidos, tragamonedas y ruleta. Títulos, reglas y proveedor pendientes.
- Funcionamiento automático del juego. El creador puede ser anfitrión SOCIAL: presenta, comenta e interactúa.
- Remuneración deseada para el anfitrión: porcentaje de lo apostado. Base, porcentaje, atribución y admisibilidad pendientes.
- También habrá juegos sin anfitrión conectado.
- El jugador NO retirará ganancias a su propia cuenta bancaria. Podrá volver a apostar, enviar regalos, pagar intervalos, publicaciones y suscripciones.
- Los creadores sí podrán recibir ingresos y retirarlos a su banco. Debe analizarse el circuito completo: dinero → monedas → apuestas → ganancias → regalos o contenido → ingresos del creador → banco.
- No se ha aprobado todavía un operador, una licencia, una separación técnica de saldos ni transferencias permitidas entre saldos.

### LIVE-F11: promoción física remunerada con QR

- Campañas iniciales en Bogotá y Medellín para captar usuarios y creadores.
- Pegar QR y adjuntar pruebas: menor pago. Caminar con una prenda con QR y adjuntar pruebas: pago mayor. Sostener cartel con QR y prueba por video EN VIVO CONTINUO durante TODA la tarea: pago máximo.
- Prenda y cartel: pago base fijo por tarea de duración definida. Importes y duraciones pendientes; unidad de pago de adhesivos pendiente.
- El participante elige remuneración inicial en dinero o monedas.
- Pago base por tarea más bono por captación válida mediante su QR.
- Usuario captado válido: registro y verificación completados. Creador captado válido: identidad verificada y perfil aprobado.
- El participante cubre adhesivos, prendas y carteles SIN reembolso.
- Monedas recibidas por publicidad: regalos, casino, intervalos, publicaciones y suscripciones. No se eligió convertir posteriormente esas monedas en dinero al propio participante.
- La prueba continua no significa que se haya elegido grabarla entera, conservarla indefinidamente ni mantener un revisor humano conectado todo el tiempo.
- Zonas, permisos, materiales, aprobación de tareas, atribución, unicidad de captados, combinación de bonos, interrupciones, fraude y financiación de la campaña pendientes.

### LIVE-F10, F12, F13, F14 y F15: seguridad, experiencia y operación

- Seguridad para dinero, saldos, cuentas y contenido exclusivo.
- Mensajes privados gratuitos, solo de texto. Solo seguidores pueden iniciar conversaciones privadas con un creador. Reglas de respuesta, bloqueo, límites y conservación pendientes.
- Descubrimiento por recomendaciones, categorías, filtros, búsqueda por nombre y creadores cercanos. Filtros iniciales: país o ciudad e idioma.
- Inicio centrado en directos activos recomendados. Cuatro señales: creadores seguidos, popularidad, historial de directos vistos e intereses elegidos por el usuario.
- Dentro de POPULARIDAD, el valor de regalos recibidos tendrá el mayor peso. Esto no decide el peso de popularidad frente a las otras tres señales. Ventana, unidad, regalos elegibles, ajustes y fórmula pendientes.
- Para cercanía, cada persona elige ciudad del perfil o ubicación aproximada del celular con permiso. Se muestra SOLO un indicador de cercanía. Aparición del creador activada inicialmente, con opción de ocultarse.
- Umbral de cercanía, precisión, conservación y efecto de ocultarse en otras formas de descubrimiento pendientes. La aparición inicial no autoriza obtener ubicación móvil sin permiso.
- Avisos del lanzamiento: inicio de directos de creadores seguidos, mensajes privados y pagos, retiros y suscripciones.
- Canal elegido: notificaciones del navegador o celular, con permiso. Único control del usuario: activarlas o desactivarlas en conjunto. Compatibilidad, alcance por cuenta o dispositivo y estado inicial pendientes.
- El promotor será la ÚNICA persona que administre la plataforma y revise reportes durante el piloto. Esto conserva los moderadores de cada sala.
- Soporte por tickets y chat dentro de la plataforma. CHAT HUMANO SEGÚN SU DISPONIBILIDAD, SIN HORARIO FIJO.
- Tiempos de respuesta, estado sin atención, adjuntos, evidencias, prioridad y avisos de respuestas de soporte pendientes. No hay un equipo adicional ni atención inmediata permanente confirmados.

## 3. Investigación prioritaria: modelo económico y responsabilidades

Describe y evalúa al menos estas rutas como alternativas de investigación:

A. Empresa operadora propia con las autorizaciones y contratos necesarios.
B. Integración con un operador autorizado, si existe una estructura que permita nuestro producto y sus movimientos de valor.

Para cada ruta identifica quién contrata con el jugador, vende las monedas, custodia fondos o saldos, ejecuta apuestas, reconoce premios, remunera creadores y anfitriones, paga retiros, atiende disputas y asume obligaciones regulatorias. Una marca blanca, un proveedor de juegos o la licencia de otra empresa no demuestran por sí solos que LIVE esté cubierto. Exige evidencia del alcance y distribuye responsabilidades.

Investiga en Colombia la clasificación aplicable del casino y del circuito completo, permisos, requisitos de empresa, costos y capital de entrada, garantías, certificaciones, fiscalidad y obligaciones de control. Señala qué exige interpretación profesional. Si las cifras dependen de unidades o reglas variables, enlaza la norma, fecha, fórmula y supuesto; evita convertir una cifra histórica en requisito actual.

Evalúa específicamente:

- Ganancias internas utilizadas en regalos, contenido y acceso que luego generan retiros bancarios de creadores.
- Monedas de campañas utilizadas para apostar y remuneración a anfitriones por apuestas.
- Riesgos de cuentas vinculadas, compras al propio perfil, regalos circulares, auto-regalos y uso de un creador como salida de valor de un jugador.
- Diferencia entre regalo, compra digital, aporte directo, ingreso de anfitrión y pago por tarea publicitaria.
- Uso y alcance territorial del servicio; qué podría requerir restricciones geográficas. No presupongas que residencia del creador equivale a residencia del jugador.
- Protección al consumidor, reglas de acceso, vencimiento de excedentes, devoluciones, renovaciones automáticas y exposición clara del costo.
- Conflictos entre incentivar apuestas, pagar a anfitriones y obligaciones aplicables de juego responsable o publicidad.

Que no haya retiro bancario al propio jugador NO prueba una exención. Separar saldos tampoco prueba que se permita transferir valor entre ellos. Concluye con evidencia y límites, sin dar por aprobada la operación por elegir nombres distintos para los pagos.

## 4. Investigación de cobros, aportes y pagos a creadores

Busca candidatos reales, con cobertura documentada, para cada tramo. Evalúa al menos dos candidatos por tramo cuando encuentres fuentes suficientes; si no los hay, reporta el vacío en lugar de completar una lista ficticia.

Entrega una matriz con estas columnas:

Tramo | entidad/proveedor | contenido adulto | casino | combinación concreta solicitada | país y monedas | recargas/saldos/aportes/pagos admitidos | precio publicado o cotización pendiente | reservas y contracargos | evidencia | confirmación pendiente.

Un proveedor que admite contenido adulto no queda confirmado para casino. Un proveedor que admite apuestas no queda confirmado para contenido sexual explícito ni para pagos a estos creadores. Evalúa el alcance exacto de cada producto y el contrato, no solo el nombre del proveedor.

Incluye una tabla de cobertura para creadores residentes en Colombia, Estados Unidos, España y Venezuela. Distingue residencia, nacionalidad, país de la cuenta bancaria y país de la operadora. Investiga limitaciones pertinentes a las rutas concretas y su fuente; no deduzcas una prohibición universal por nacionalidad. Marca lo que no pueda confirmarse públicamente.

Reconstruye todos los recorridos económicos, incluyendo:

1. Dinero → recarga → monedas compradas → regalo → ingreso del creador → solicitud de retiro → banco.
2. Dinero/monedas → apuesta → resultado → ganancias → nueva apuesta, regalo o compra de acceso/contenido → eventual ingreso del creador → banco.
3. Aporte directo con pago independiente → comisión y costos → banco del creador.
4. Tarea publicitaria y bono → remuneración elegida en dinero o monedas → usos internos de las monedas.
5. Regalo que habilita intervalo → consumo de tiempo → pausa/reanudación → cierre o expulsión → devolución correspondiente.

Para cada recorrido señala titularidad, obligaciones pendientes, comisiones, reservas, liquidación y reversos. Describe a nivel conceptual los registros necesarios para evitar doble gasto y doble conteo de regalos, crédito de intervalos e ingresos. Una separación conceptual de saldos es una propuesta; documenta si los movimientos serían admisibles.

Usa uno o dos ejemplos numéricos ficticios, claramente etiquetados, para mostrar conciliación y devolución. No fijes precios, equivalencias, mínimo de retiro ni porcentajes de negocio. Mantén separadas las monedas del consumidor, los ingresos pagables del creador y las obligaciones de devolución que propongas registrar.

## 5. Viabilidad tecnológica e integraciones móviles

Haz una evaluación documental inicial; la prueba de concepto detallada de multistream será LIVE-002.

Para BuzzCast, TikTok Live y Bigo Live entrega una fila por capacidad: emitir video, recibir chat, recibir eventos de regalos y finalizar la emisión externa. Incluye API/SDK/protocolo oficial, acceso o programa requerido, elegibilidad de cuenta y región, condiciones de contenido, respaldo documental y estado de comprobación.

No supongas que disponer de una clave RTMP da acceso a chat o regalos. Distingue integración oficial, programa privado documentado, capacidad de una cuenta concreta e integración no comprobada. No presentes scraping, extracción de credenciales o eludir restricciones como una ruta autorizada.

Propón una arquitectura mínima para captura desde un solo celular, envío a nuestra plataforma, posible redistribución desde servidor y panel integrado de chat/regalos. Compara web móvil con alternativas de cliente cuando ayude a resolver una limitación, señalando si cambian el canal acordado. Aceptar video por servidor no elimina requisitos de cada destino.

Identifica qué falta probar en teléfonos Android: cámara/micrófono, segundo plano, interrupciones, red, calidad, latencia, temperatura, consumo y uso del panel. Trata iPhone como alcance posterior por definir. Investiga el cierre externo y los fallos de confirmación para que el diseño proteja el paso a contenido exclusivo.

Evalúa a alto nivel directo interno, entrega de fotos/videos exclusivos, grabación opcional, notificaciones web/móviles, permisos, aislamiento entre cuentas y administración. Señala la aceptación contractual del contenido por proveedores de infraestructura. La protección de acceso debe describirse con límites reales; no prometas impedir cualquier captura de pantalla o grabación ajena.

Para el casino identifica responsabilidades del motor/proveedor, resultados, certificación o verificación exigible, conciliación y disponibilidad. No diseñes todavía algoritmos de apuestas para producción ni selecciones reglas comerciales de los juegos.

## 6. Operación, seguridad, privacidad y promoción

Evalúa los controles necesarios y distingue requisitos respaldados de propuestas:

- Verificación de edad e identidad, creadores y personas que aparezcan, consentimiento, contenido prohibido, reportes y respuesta ante material ilícito.
- Protección de datos personales, documentos, biometría si se propone, geolocalización, mensajes, pruebas de tareas y transferencias internacionales. Minimización, acceso, conservación y borrado.
- Autorización de pagos y renovaciones, controles de cuentas, trazabilidad, conciliación, fraude, contracargos y recuperación ante errores.
- Revisión de infracciones para negar devoluciones: pruebas, decisión de plataforma, registro, revisión y tratamiento de fondos mientras se resuelve.
- Juego responsable y controles que resulten aplicables a la ruta concreta.
- Administración por una persona: carga estimada de reportes, verificación, soporte, aprobaciones, pagos y tareas de promoción. Hay chat sin horario fijo, no cobertura humana continua asegurada.
- Propuesta para mostrar disponibilidad y recibir consultas cuando no se atienda. Automatización, conversión a ticket o equipo adicional son opciones por evaluar, no decisiones tomadas.
- Permisos y reglas de publicidad exterior o uso de espacios en Bogotá y Medellín, diferenciando adhesivos, prendas y carteles, lugares públicos/privados y publicidad de una plataforma adulta con casino.
- Condiciones de participación remunerada, información del costo de materiales no reembolsable, atribución por QR, bonos, unicidad y prevención de fraude.
- Viabilidad de prueba EN VIVO CONTINUA de cartel durante toda la tarea. Separa transmisión, eventual grabación, retención y revisión humana; estima cada decisión pendiente sin sustituir la cobertura por videos puntuales.
- Proveedores y exigencias relevantes de distribución web y futura tienda. Una app compatible posterior debe describirse con su alcance; no asumas que bastará ocultar funciones o enlazar al mismo servicio.

No resuelvas una falta de personal inventando disponibilidad del promotor. Si la cobertura necesaria supera la operación de una persona, cuantifica la brecha y plantea opciones con costos y efectos sobre el producto.

## 7. Costos y ahorro con resultados comparables

Separa inversión inicial, gasto mensual, costos variables y fondos que respaldan obligaciones.

Incluye constitución/asesoría, autorizaciones y garantías cuando correspondan, integración, pagos, reservas, saldos de creadores, devoluciones, liquidez del casino, campañas, video, almacenamiento/CDN, grabaciones opcionales, verificación, notificaciones, herramientas de moderación y soporte, bases de datos y seguridad. Una reserva o garantía no es necesariamente un gasto consumido; identifica liquidez, recuperabilidad y condición.

Para cada cifra: moneda, unidad, tarifa y fuente/fecha o supuesto, fórmula, uso estimado y qué no incluye. Separa impuestos y conversiones. Cuando requiera cotización, usa “pendiente de cotización”; si haces una sensibilidad hipotética, identifícala y evita presentarla como precio del mercado.

Usa como escenarios de carga, sin convertirlos en previsiones del usuario:

- 12 horas/día × 30 días, con los 5 creadores y 50 espectadores totales durante toda esa ventana.
- 24 horas/día × 30 días, con la misma ocupación máxima.
- Añade un escenario de ocupación media declarado y editable si ayuda a dimensionar el piloto. No lo presentes como dato confirmado.

Distingue horas de creador, horas de espectador, ingreso de video, salida interna y redistribución externa. Incluye bitrate/rendiciones asumidos; convierte unidades con precisión. No contabilices 50 espectadores para cada uno de los 5 creadores. Contabiliza por separado los juegos sin video y las transmisiones de prueba publicitaria, cuya concurrencia y duración aún no conocemos.

Calcula carga humana con volúmenes y minutos por caso explícitos. Las horas de actividad del servicio no equivalen a horas de atención disponibles del promotor. Presenta el costo de trabajo externo solo como alternativa cuando corresponda.

Compara rutas de ahorro indicando qué resultado conservan, sus límites, dependencia operativa y costo total. Infraestructura compartida, servicios administrados o alojamiento propio son hipótesis a contrastar con políticas y carga. Si una opción reduce funciones, calidad, territorios o controles requeridos, muestra el cambio; no la vendas como equivalente.

Presenta qué puede cubrir la referencia de US$3.000 y qué la supera bajo los supuestos. No ajustes números para forzar esa cifra ni financies obligaciones con ingresos futuros supuestos. El fondo de campaña y el capital inicial siguen pendientes.

## 8. Entregables y orden del informe

Entrega un informe autónomo titulado “LIVE-001-resultado-v1.0”, con base v0.33 y fecha real de investigación. Incluye:

1. Conclusión ejecutiva: ruta mejor respaldada, principales obstáculos, condiciones para avanzar y nivel de evidencia. Si ninguna ruta permite acreditar todo el modelo, dilo y precisa qué falta.
2. Matriz de viabilidad por componente: estado, evidencia, responsable, decisión o prueba necesaria y dependencia.
3. Comparación de operador propio e integración autorizada: responsabilidades, cobertura del circuito, entrada económica y confirmaciones pendientes.
4. Diagrama del dinero y saldos, acompañado de las diferencias entre regalo, acceso, ganancias, aportes, promoción e ingresos pagables. Puede ser Mermaid vertical; mantenlo legible.
5. Matrices de proveedores, cobertura de pagos a creadores y capacidades de los tres destinos externos.
6. Arquitectura conceptual del piloto y dependencias fundamentales. Tecnologías propuestas con motivos y límites, sin fijarlas como aprobadas.
7. Tabla de costos iniciales, mensuales y fondos necesarios, con escenarios, unidades, fórmulas y opciones de ahorro comparables.
8. Plan de operación para una persona, brechas de cobertura y controles prioritarios; evaluación inicial de campañas y prueba continua.
9. Lista priorizada de bloqueos y dudas. Distingue incompatibilidad documentada de permiso, cotización o evidencia pendiente.
10. Máximo 8 preguntas de decisión que realmente cambien la viabilidad o el orden de construcción, explicando la decisión que habilita cada una. Las demás dudas de detalle pueden quedar en un anexo.
11. Próximos encargos pequeños, con objetivo, dependencia y criterio de aceptación: LIVE-002 para prueba de multistream; LIVE-003 para reglas de intervalos; LIVE-004 para perfiles. Propón otros solo cuando se justifiquen. No los ejecutes en este encargo.
12. Fuentes enlazadas, con ID, fecha/versiones, ámbito y conclusión que respaldan; supuestos y limitaciones; propuestas que cambiarían un requisito confirmado.

Para los estados de viabilidad usa:

- Respaldado: hay evidencia suficiente para la afirmación concreta; especifica alcance.
- Condicionado: ruta plausible con requisitos o aprobaciones identificados.
- Incompatible según la fuente: describe exactamente qué regla entra en conflicto.
- No comprobado: falta evidencia para concluir.

Estos estados no sustituyen la aceptación contractual ni una evaluación profesional cuando se necesiten. Una conclusión técnica no prueba admisión comercial.

Prioriza las decisiones críticas. Como referencia de extensión, busca un cuerpo principal de 3.000–5.000 palabras más tablas y anexo de fuentes; ajusta cuando haga falta para conservar la evidencia esencial. Evita rellenar con explicaciones generales de cómo funcionan apps o casinos.

## 9. Fuentes oficiales de partida

Estas páginas son puntos de partida; vuelve a consultarlas, localiza la documentación precisa y comprueba vigencia. Su presencia en el encargo no confirma compatibilidad ni aprobación:

- Coljuegos — juegos operados por internet: https://www.coljuegos.gov.co/publicaciones/301519/juegos_operados_por_internet
- Coljuegos — portal institucional: https://www.coljuegos.gov.co/
- Stripe — negocios restringidos/prohibidos, como ejemplo de política de proveedor a comprobar: https://stripe.com/legal/restricted-businesses
- Google Play — contenido restringido: https://support.google.com/googleplay/android-developer/answer/9878810?hl=en
- Google Play — apuestas y juegos con dinero real: https://support.google.com/googleplay/android-developer/answer/9877032?hl=en
- Google Play — pagos: https://support.google.com/googleplay/android-developer/answer/10281818?hl=en
- Apple — App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- TikTok — portal de desarrolladores: https://developers.tiktok.com/
- BIGO LIVE — sitio oficial: https://www.bigo.tv/
- BuzzCast — ficha del desarrollador en Google Play: https://play.google.com/store/apps/details?id=com.guochao.faceshow
- MDN — captura de cámara/micrófono en web: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- SIC — autoridad colombiana de protección de datos: https://www.sic.gov.co/
- Bogotá — portal oficial: https://bogota.gov.co/
- Medellín — portal oficial: https://www.medellin.gov.co/

Busca fuentes primarias adicionales para constitución, obligaciones fiscales, regulación local y pagos transfronterizos. Una noticia de un trámite no reemplaza la norma ni un anuncio comercial reemplaza el contrato.

## 10. Control antes de entregar

Comprueba que tu informe:

- Conserva casino desde el lanzamiento, contenido explícito, web inicial y multistream desde un solo celular.
- Evalúa el circuito completo hasta pagos bancarios al creador y también las monedas publicitarias.
- Separa residencia del creador de territorio de apuestas y país bancario.
- Mantiene 50 espectadores totales y cuenta cargas adicionales explícitamente.
- Respeta pausas, 1 minuto de reconexión, devoluciones proporcionales y diferencia entre tiempo pagado y excedente que vence.
- Conserva compras de perfil con saldo interno y aportes directos con pago independiente.
- No promete liquidación diaria por permitir solicitudes diarias.
- Preserva un único administrador y chat según disponibilidad, sin horario fijo.
- No cambia la prueba continua de cartel por evidencias puntuales.
- No convierte decisiones pendientes, cotizaciones o hipótesis de proveedor en hechos.
- Incluye fuentes que permiten comprobar cada conclusión crítica.

Termina el trabajo con el informe y su lista de decisiones. En esta fase no se encarga programar la aplicación, abrir cuentas, contratar, contactar entidades ni mover dinero. La siguiente fase se decidirá después de revisar este resultado.

