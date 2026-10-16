# LIVE-001-R01 — Verificación y corrección del informe — v1.0

Base del producto: Proyecto LIVE v0.33.
Documento de partida: docs/investigacion/LIVE-001-resultado-v1.0.md.
Rama reportada: claude/new-session-tzsjwj.
Resultado solicitado: LIVE-001-resultado-v1.1 y un registro breve de correcciones.
Tipo de trabajo: revisión documental con fuentes completas.
Idioma: español.

Actúa como investigador y revisor del informe que acabas de entregar. El resumen identifica posibles incompatibilidades relevantes, pero declaraste que investigaste únicamente mediante extractos del buscador. La siguiente tarea es verificar las afirmaciones que deciden la viabilidad antes de modificar los requisitos o encargar implementación.

Esta revisión procede del resumen compartido; el informe completo todavía no ha sido auditado por ChatGPT. Comprueba si cada observación ya está atendida en el archivo y conserva los análisis respaldados.

## 1. Estado de base y alcance

Identifica repositorio, rama y SHA del commit que contiene el informe v1.0. Comprueba el estado de trabajo antes de editar y conserva los cambios ajenos.

La v0.33 sigue siendo la base de requisitos. Separar el casino, permitir retiros al jugador o impedir usar sus ganancias en regalos/contenido son propuestas de cambio que aún no ha elegido el promotor.

Preserva estos requisitos para evaluar la situación actual:

- Web móvil inicialmente, con contenido sexual explícito; app compatible con tiendas posteriormente.
- Casino imprescindible desde el lanzamiento con clientes reales: dados/juegos rápidos, tragamonedas y ruleta.
- El jugador no retira sus ganancias a su banco; puede volver a apostar, regalar y pagar intervalos, publicaciones y suscripciones.
- Los creadores sí pueden retirar ingresos de regalos y contenido. Residencias del piloto: Colombia, Estados Unidos, España y Venezuela. El primer mercado económico es Colombia; esas residencias no amplían automáticamente el territorio de jugadores.
- Recargas de dinero para monedas; compra de contenido y suscripciones solo con saldo interno. Aportes directos con dinero mediante un pago independiente.
- Solicitudes de retiro de creadores diarias, con mínimo pendiente; esto no promete pago bancario diario.
- Monedas publicitarias utilizables en casino, regalos y acceso. Remuneración inicial elegible en dinero o monedas; tareas en Bogotá y Medellín y cartel con video en vivo continuo durante toda la tarea.
- Multistream desde un solo celular, sin PC, hacia BuzzCast, TikTok Live y Bigo Live, con consulta de chat y regalos. Finalizar las emisiones externas al pasar a sala exclusiva.
- Hasta 5 creadores y 50 espectadores internos totales simultáneos. Más de 8 horas de actividad diaria; escenarios de 12/24 horas y ocupación máxima son supuestos, no previsiones.
- Un único administrador y revisor de reportes del piloto; chat humano según disponibilidad, sin horario fijo. Moderadores designados de cada sala conservan sus funciones.
- Pausa de contadores al salir y durante desconexión del creador; 1 minuto para reconectar. Al cerrar: devolver proporcionalmente en monedas el tiempo pagado no consumido, con financiación compartida por plataforma y creador y fórmula pendiente; el excedente de regalos no usado vence como regalo. Al expulsar: devolución salvo infracción comprobada por la plataforma revisando pruebas.
- US$3.000 mensuales aparte de Claude es una referencia anterior, no un límite de diseño. Capital inicial y fondos de campaña sin definir.

El resto de requisitos se conserva en la base original. Esta revisión verifica las conclusiones críticas; no redefine el producto ni ejecuta los encargos LIVE-002 a LIVE-004.

## 2. Evidencia y acceso

Abre y lee las fuentes completas pertinentes. Registra URL, entidad, documento, versión/fecha, artículo o sección, fecha de consulta, alcance y estado del acceso.

Si el contenedor bloquea un dominio:

1. Usa una copia oficial en otro portal institucional, comprobando que sea el mismo documento.
2. Distingue texto íntegro recuperado mediante el buscador de un extracto breve.
3. Para el texto pendiente, registra el documento exacto y el acceso o copia que falta.
4. Conserva esa conclusión como pendiente cuando el contexto completo sea imprescindible. No afirmes haber leído un documento solo porque esté indexado.

Una réplica oficial puede estar desactualizada. Revisa las modificaciones y disposiciones posteriores de cada artículo que sustente una decisión.

Evita nuevas búsquedas generales repetidas si ya conoces el documento necesario. Prioriza recuperar y contrastar esa evidencia.

## 3. Verificaciones requeridas

### R01-A. Vigencia de los juegos por internet

Se localizó esta publicación oficial de Coljuegos: “Acuerdo 01 (07 de mayo de 2026)”, que anuncia una modificación del título 1 del Acuerdo 08 de 2020. Su ficha está publicada el 8 de mayo de 2026:

https://www.coljuegos.gov.co/publicaciones/307323/acuerdo-01-07-de-mayo-de-2026-por-el-cual-se-modifica-el-titulo-1-acuerdo-08-de-16-de-septiembre-de-2020/

En la revisión preliminar pudo abrirse la ficha, pero falló el acceso al anexo. Todavía no se atribuye ningún cambio concreto a ese acuerdo.

Obtén el texto íntegro, comprueba publicación y vigencia e identifica qué artículos modifica y cuáles mantiene. Revisa también las modificaciones relevantes de 2021 y 2023 y cualquier otra posterior. Distingue versiones definitivas de proyectos de consulta pública.

Entrega una tabla por artículo relevante: texto/regla examinada, modificación aplicable, versión vigente comprobada, relación con el modelo y evidencia pendiente. Explica si la actualización afecta realmente a retiros, transferencias, unidad monetaria o únicamente a otro aspecto. No deduzcas que todos los artículos cambiaron porque cambió el título 1.

Fuente institucional adicional consultada:
https://normograma.superservicios.gov.co/NORMOGRAMA/compilacion/docs/acuerdo_coljuegos_0008_2020.htm

### R01-B. Retiros, transferencias y monedas

Verifica los artículos 1.4.2, 1.5.9 y 1.5.10 del reglamento y su vigencia, además de la definición legal del juego aplicable.

Delimita la prohibición de transferencias ENTRE CUENTAS DE JUEGO de distintos jugadores. Separa:

- Transferencia entre esas cuentas.
- Compra de una publicación o suscripción al creador.
- Regalo que genera un ingreso pagable al creador.
- Aporte independiente con dinero.
- Remuneración del anfitrión y fondos publicitarios.

Para cada movimiento explica si hay una prohibición directamente documentada, una inferencia jurídica o una duda pendiente de revisión profesional. No amplíes automáticamente una regla a toda cuenta de la plataforma ni supongas que una compra a un creador queda autorizada.

Documenta las condiciones y alcance del retiro al jugador: solicitud, orden de pago, verificación, límites y trato de depósitos frente a premios. Distingue ordenar el pago de recibirlo en el banco.

Analiza la unidad monetaria y los créditos de participación. Si propones representar saldo con monedas visuales, justifica la clasificación y equivalencia; cambiar el nombre o separar tablas no demuestra admisibilidad.

Revisa cuenta de depósitos, cobertura de premios y controles de disposición de fondos en los artículos 1.1.4 y 1.1.8. Identifica consecuencias para operador propio frente a socio autorizado, incluida la operación administrativa individual del piloto.

Entrega un diagrama del circuito completo hasta el banco del creador. El requisito “sin retiro al propio jugador” requiere una conclusión específica, separada de la conclusión sobre regalos y contenido.

### R01-C. Derechos de explotación, capital y fiscalidad

Verifica la base del componente variable: el texto institucional consultado distingue ingresos brutos y premios pagados. Aclara cualquier uso ambiguo de “15 % de los ingresos del juego”.

Contrasta el componente anual, administración y calendario de pago con:

- Artículo 38 de la Ley 643 de 2001 y sus modificaciones.
- Artículos correspondientes del reglamento vigente.
- Requisitos, coberturas y garantías actuales de concesión.

Fuente institucional de la ley:
https://compilacionjuridica.shd.gov.co/compilacion/docs/ley_0643_2001.htm

Comprueba el salario mínimo que utilizaste, su norma y situación a la fecha de cálculo. Se consultó el Decreto 159 de 2026, artículo 1, con una fijación transitoria de COP 1.750.905:
https://normativa.colpensiones.gov.co/compilacion/docs/decreto_0159_2026.htm

Bajo ese valor y un componente de 811 SMLMV, la multiplicación es COP 1.419.983.955. Verifica la aplicabilidad de ambos factores; la aritmética no prueba por sí sola vigencia.

El resumen convierte esa suma en aproximadamente US$438.000. Identifica tasa, fecha y fuente; si era un supuesto, etiquétalo o elimina la conversión. No agregues auxilio de transporte al salario mínimo usado como unidad.

Separa: gasto anual, equivalente mensual contable, efectivo exigido para arrancar, capital/patrimonio, garantías/cobertura, depósitos de respaldo, fondos de campaña y liquidez para creadores. No presentes un equivalente mensual como permiso para pagar mensualmente.

Revisa impuestos y retenciones aplicables a la ruta concreta con vigencia comprobada. Señala importes pendientes de cotización o interpretación profesional. Identifica quién asume cada obligación en la alternativa de socio autorizado; no uses el costo de operador propio como costo inevitable de cualquier integración.

### R01-D. Pagos y cobertura internacional

Revisa las políticas completas, productos y territorios aplicables de los proveedores mencionados: Stripe, Payoneer, Wise y Bold.

En la revisión preliminar se consultaron:
https://stripe.com/legal/restricted-businesses
https://wise.com/gb/legal/acceptable-use-policy

La segunda URL es una política británica; identifica cuál correspondería a nuestra entidad y cada producto. Evalúa por separado cobro de monedas, aporte directo, custodia/saldo y pago al creador, así como contenido adulto, casino y combinación de actividades.

Sustituye generalizaciones de mercado por una tabla de alcance: proveedor/producto/país/actividad, prohibición o aprobación condicionada, fuente exacta, fecha y dato contractual pendiente.

“No se identificó aceptación pública del modelo completo” es una conclusión distinta de “no existe ningún proveedor”. No necesitas probar existencia ni inexistencia universal: informa candidatos investigados y límites.

Busca opciones especializadas solo cuando puedas documentar qué tramo cubren. La aceptación de un tramo no legitima todo el circuito. No propongas ocultar actividades, categorías comerciales incorrectas ni usar intermediarios para eludir restricciones.

Mantén separadas residencia, nacionalidad y país bancario del creador. Cobertura real para Colombia, Estados Unidos, España y Venezuela pendiente de producto/contrato concreto.

### R01-E. Moderación y carga de una persona

Revisa la sección 9.4.1 de Security Rules and Procedures, Merchant Edition de Mastercard; la edición consultada es del 4 de agosto de 2026:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf

Distingue el requisito documentado sobre control de la plataforma y capacidad de supervisión/retirada en tiempo real de las condiciones de dotación que exija el adquirente. No afirmes que el texto establece una cantidad concreta de moderadores u horas sin su respaldo.

Justifica las 200–620 horas mensuales que faltan según el resumen: actividad, creadores simultáneos, capacidad de revisión por persona, cobertura requerida y horas disponibles del administrador. Estas últimas no fueron confirmadas por el usuario. Usa escenarios explícitos si necesitas estimarlas.

Evalúa verificación, revisión de contenido cargado, directos, reportes, pruebas continuas de cartel y soporte como trabajos distintos. No des por suficiente una herramienta automática sin evidencia de aceptación y capacidad operativa. Equipo o proveedores adicionales son propuestas con costos.

### R01-F. Multistream y costo de video

La documentación oficial de BIGO consultada explica el envío con URL/clave y OBS:
https://www.bigo.tv/bigo-streamer/obs/

Eso aporta evidencia de ingestión, pero no demuestra el piloto completo desde un teléfono. Para cada destino mantén separados: envío de video, cuenta elegible, panel de chat, eventos de regalos, condiciones de contenido y cierre externo.

Clasifica el requisito desde un solo celular como probado, viable bajo condiciones o no comprobado, con motivo. No presentes una guía de PC como prueba móvil. La prueba de concepto detallada queda para LIVE-002.

Reconstruye el intervalo US$1.100–1.700 mensual de video: proveedor y producto, políticas de contenido, precios/fecha, minutos u horas cobrados, entrada, salida, transcodificación, grabación, almacenamiento y tráfico externo. Si es una sensibilidad hipotética, identifícala.

Con 12 horas/día y 30 días a ocupación máxima son 18.000 horas de espectador interno y 1.800 horas de creador; con 24 horas son 36.000 y 3.600 respectivamente. Los 50 espectadores son totales. Identifica cuáles de esas unidades factura cada proveedor y qué volumen adicional queda abierto.

Pruebas publicitarias y jugadores sin video se dimensionan por separado. No fijes la ocupación media ni tarifas ausentes.

## 4. Conclusión y entregables

Conserva el informe v1.0 e incorpora una revisión v1.1, preferiblemente en docs/investigacion/LIVE-001-resultado-v1.1.md. Entrega:

1. Tabla de auditoría: afirmación original, estado anterior, fuente completa, hallazgo, corrección y efecto en la decisión.
2. Matriz normativa con vigencia y límites; matriz de proveedores por producto/territorio.
3. Cálculos de derechos de explotación, tipo de cambio, costos de video y carga humana que permitan reproducir cada cifra.
4. Conclusión por requisito: incompatibilidad documentada, ruta condicionada o evidencia insuficiente. Mantén separadas esas categorías.
5. Alternativas de operación, con requisitos del usuario que cambiarían, responsables, contratos pendientes y costos. Separar el casino no se incorpora como decisión del promotor.
6. Registro breve de cambios v1.0 → v1.1; supuestos y fuentes inaccesibles.
7. Repositorio, rama, SHA inicial, archivos modificados y estado final. Si existe un commit nuevo, incluye su SHA completo; declara lo que realmente ejecutaste.

Las preguntas de cambio de producto deben apoyarse en esta verificación. Prioriza corregir la evidencia antes de repetir el cuestionario de 8 decisiones.

La investigación no sustituye la validación profesional de interpretaciones jurídicas ni la aceptación escrita de proveedores. Identifica qué consulta concreta falta y qué decisión habilitaría.

Finaliza con la revisión documental. La programación, publicación web, contratación y contacto con terceros quedan para encargos posteriores.

