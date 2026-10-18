# Plan por fases y flujo de entrega — v1.5

| Campo | Valor |
| --- | --- |
| Versión | 1.5 |
| Fase activa | **FASE-02, viabilidad y decisiones del piloto** |
| Entrega activa | LIVE-FASE02-E04 v1.1, preparación de consultas del piloto: [validaciones del piloto](../expedientes/LIVE-FASE02-E04-validaciones-piloto.md) (única entrega activa). Borradores preparados; pendiente de auditoría y publicación manual. Ningún envío autorizado |
| Definición de producto | [v0.33](../producto/proyecto-live-definicion-v0.33.md), base original conservada como referencia histórica |
| Registro de decisiones | [v1.1](../producto/REGISTRO-DECISIONES.md), RD-001 a RD-010; prevalece sobre la v0.33 solo en sus cambios explícitos |
| Síntesis de investigación | [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md) |
| Estado del proyecto | [ESTADO-PROYECTO](ESTADO-PROYECTO.md) |

Historial del plan:

| Versión | Entrega | Base | Cambio |
| --- | --- | --- | --- |
| 1.0 | LIVE-FASE01-E01 v1.0, encargo del 17-10-2026 (America/Bogota), apartados 1 a 5. El encargo ejecutable no se copia en el repositorio | `7184f7ca87d51bdba5e21c8e4d29df14025e6b46` | Creación del plan |
| 1.1 | LIVE-FASE02-E01 v1.0, encargo del 17-10-2026; publicada en `bc5f14617f68a334cffb4f5dfaf10de4f4f9ced4` | `95bc81cb94d28c3b9d03e8696be454898749e5f0` | Solo metadatos y estados: FASE-01 cerrada; FASE-02 activa con LIVE-FASE02-E01 como única entrega activa |
| 1.2 | LIVE-FASE02-E01 v1.1, encargo del 17-10-2026; cerrada y publicada en `65378a49c17453aa768ca871819abe6748a03908` el 18-10-2026 | `bc5f14617f68a334cffb4f5dfaf10de4f4f9ced4` | Alcance del primer piloto según el [registro de decisiones](../producto/REGISTRO-DECISIONES.md) (RD-001): casino no obligatorio para el piloto; FASE-02 centrada en el piloto de directos y su economía; FASE-09 diferida; excepción de secuencia para FASE-11 y FASE-12. Entrega activa: E01 v1.1 |
| 1.3 | LIVE-FASE02-E02, encargo del 18-10-2026; preparación v1.0 ajustada a v1.1 tras la revisión R01 (18-10-2026). v1.1 publicada en `14926d2575acf492afdbfb60a8777eabfa077fcd` el 18-10-2026; preparación terminada | `65378a49c17453aa768ca871819abe6748a03908` | Solo metadatos, historial y seguimiento: E01 v1.1 cerrada y publicada; E02 como única entrega activa, en su v1.1. Sin cambios en fases, criterios, dependencias ni orden |
| 1.4 | LIVE-FASE02-E03 v1.0, encargo del 18-10-2026; cerrada y publicada en `8128802bbeca0349755776a0383e79853ff8c4b8` el 18-10-2026 | `14926d2575acf492afdbfb60a8777eabfa077fcd` | Respuestas A1, B2, C1, D1 y E1 del promotor a E02 trasladadas al [registro de decisiones](../producto/REGISTRO-DECISIONES.md) (RD-006 a RD-010). Dependencias ajustadas: FASE-03 sin las pruebas exclusivas del cartel QR; FASE-07 con el contenido exclusivo y sin «Cercanos»; FASE-08 sin aportes directos; FASE-10 diferida y fuera de los prerrequisitos de FASE-11 y FASE-12; validación previa y piloto referidos a los componentes incluidos. Entrega activa: E03 v1.0 |
| 1.5 | LIVE-FASE02-E04, encargo recibido el 18-10-2026; preparación v1.0 ajustada a v1.1 tras la revisión R01 (18-10-2026) | `8128802bbeca0349755776a0383e79853ff8c4b8` | Solo metadatos, historial y estado de FASE-02: E03 cerrada y publicada; E04 como única entrega activa, en su v1.1. Sin cambios en fases, objetivos, criterios, dependencias ni excepciones |

## 1. Cambio de forma de trabajo

El usuario ha pedido trabajar una fase a la vez, con entregas acotadas y publicación manual después de la auditoría de ChatGPT. Esta decisión reemplaza las instrucciones previas de hacer commit y push automáticamente.

El encargo LIVE-002 entregado anteriormente queda **pausado**. No se inicia ni se continúa en paralelo. Tampoco se ejecutan ahora LIVE-005 o LIVE-006. Sus borradores se conservan como entradas de fases posteriores.

Esta reorganización no cambia el producto: contenido adulto, usos de monedas y ganancias, países elegidos, funcionamiento de salas y demás decisiones de la v0.33 se mantienen como requisitos sujetos a su viabilidad. Cambiar el orden de construcción no autoriza a retirar funciones.

**Alcance del primer piloto (v1.2).** El promotor decidió el 17-10-2026 que la prioridad del primer piloto son las transmisiones en vivo y que los juegos con monedas no son obligatorios para él: quedan para una etapa posterior, sin retirarse ([registro de decisiones](../producto/REGISTRO-DECISIONES.md), RD-001 y RD-002). Es un cambio de alcance registrado; su efecto en la secuencia se explica en §2. Las v1.0 y v1.1 de este plan mencionaban el casino como imprescindible en el lanzamiento real; esa mención es histórica. Los usos de monedas y ganancias propios de los juegos se conservan para esa etapa, sin decisión nueva.

## 2. Hoja de ruta

Las fases agrupan objetivos. Cada fase tendrá entregas pequeñas, con alcance propio. No se construye una fase completa en un único cambio.

| Fase | Objetivo | Alcance | Criterio de cierre | Estado |
| --- | --- | --- | --- | --- |
| FASE-01 | Cierre de investigación documental | Congelar la v1.2 como síntesis de esta etapa, trasladar los pendientes externos y ordenar el trabajo. | Paquete de cierre auditado, aplicado y publicado manualmente por el usuario. No exige demostrar viabilidad legal. | Cerrada el 17-10-2026; publicada manualmente en `95bc81cb94d28c3b9d03e8696be454898749e5f0` |
| FASE-02 | Viabilidad y decisiones del piloto | Resolver, para el piloto de directos y su economía, el circuito económico, empresa, pagos, territorios, recursos y operación con respuestas profesionales o contractuales concretas. Las cuestiones exclusivas de los juegos con monedas (ruta del casino, territorio y retiro de los jugadores, monedas en los juegos, anfitriones) quedan diferidas con FASE-09, sin borrarse. | Ruta documentada del piloto de directos y su economía, y decisión del usuario: viable, requiere cambios o bloqueada. No se inventa aceptación para avanzar. Las cuestiones exclusivas de los juegos no bloquean este cierre para ese piloto. | ACTIVA: entrega LIVE-FASE02-E04 v1.1. E01 y E03 cerradas y publicadas en `65378a4` y `8128802`; E02 publicada en `14926d2`, con su preparación terminada. Sin viabilidad aprobada |
| FASE-03 | Prueba técnica móvil | Comprobar captura, multistream, chat/regalos, reconexión y transición a exclusivo con contenido neutral. Las pruebas exclusivas del cartel QR no bloquean esta fase para el primer piloto; se conservan para la etapa del módulo QR (RD-008). | Resultados reproducibles en equipos y cuentas autorizados, con límites y fallos conocidos; los obstáculos vuelven a una decisión explícita. | Pendiente |
| FASE-04 | Diseño funcional y experiencia | Concretar pantallas, reglas de intervalos, perfiles, devoluciones, permisos y contratos entre módulos. | Prototipo y reglas de aceptación revisados; detalles propuestos diferenciados de decisiones confirmadas. | Pendiente |
| FASE-05 | Base técnica y seguridad | Preparar arquitectura, proyecto, datos, cuentas, roles, verificación y registro de operaciones. | Base ejecutable y controles esenciales comprobados; integraciones de prueba donde corresponda. | Pendiente |
| FASE-06 | Directos y salas | Construir emisión interna, chat, moderación, contadores, reconexión, grabación y paso a exclusivo. | Flujos de directo comprobados con saldos ficticios; sin cobros reales. | Pendiente |
| FASE-07 | Perfiles y comunidad | Contenido exclusivo, suscripciones, compras, mensajes de texto, seguidores, descubrimiento y avisos. Incluye el contenido exclusivo elegido para el primer piloto (RD-007): fotos y videos, compras individuales, suscripciones y publicación de grabaciones. «Cercanos» se difiere (RD-009); el resto del descubrimiento se conserva. | Recorridos y permisos comprobados con datos de prueba. | Pendiente |
| FASE-08 | Economía y pagos | Libro de saldos, recargas, regalos, accesos, ingresos y solicitudes de retiro de creadores. El componente de aportes directos independientes se difiere para después del primer piloto (RD-006); el resto de la economía se conserva. | Conciliación, devoluciones y controles verificados en entornos de prueba, con proveedores y condiciones identificados. | Pendiente |
| FASE-09 | Juegos con monedas (antes «Casino») | Módulo diferido de juegos con monedas y anfitrión, para una etapa posterior al primer piloto (RD-001, RD-002). Reglas, implementación, arquitectura y clasificación jurídica pendientes; no se presume exención por usar monedas o desarrollo propio. | Integración y certificaciones aplicables comprobadas en pruebas, conforme a la ruta jurídicamente validada. Se revisará al reactivar la fase. | Diferida: sin fecha ni activación autorizada. No es prerrequisito de FASE-11 ni de FASE-12 |
| FASE-10 | Promoción mediante QR | Tareas, evidencias continuas, captación, bonos y remuneración. Módulo diferido para después del primer piloto (RD-008), sin eliminarse. | Recorridos y controles comprobados en pruebas, con las condiciones de operación definidas. | Diferida: sin fecha ni activación autorizada. No es prerrequisito de FASE-11 ni de FASE-12 |
| FASE-11 | Validación previa al piloto | Integración entre módulos, seguridad, cargas, privacidad, moderación, soporte y recuperación de los componentes incluidos en el primer piloto; las partes diferidas no se exigen. | Criterios de lanzamiento superados y condiciones jurídicas, contractuales y operativas vigentes documentadas. | Pendiente |
| FASE-12 | Piloto web controlado | Operar gradualmente con usuarios reales bajo el alcance aprobado. | Métricas y revisión del piloto; capacidad objetivo de 5 creadores y 50 espectadores internos totales y actividad superior a 8 h/día. | Pendiente |
| FASE-13 | Aplicación de tienda | Preparar Android compatible con la tienda y definir después la posible etapa de iOS. | Alcance compatible y revisión de publicación; no se presume equivalencia con la web. | Posterior al piloto |

Reglas de secuencia:

- Solo hay una fase activa y una entrega activa.
- Una dependencia resuelta parcialmente no equivale a una fase superada.
- Si aparece un obstáculo material, se registra la decisión necesaria; no se elimina el requisito ni se salta de fase.
- La fase siguiente comienza con un encargo explícito del usuario después del cierre de la anterior.
- Si el usuario quiere cambiar el orden, se actualiza este plan y se explica la dependencia afectada antes de ejecutar.
- **Excepción de secuencia autorizada por el promotor (RD-001).** FASE-09 queda diferida, sin fecha ni activación autorizada. No es prerrequisito de FASE-11 ni de FASE-12: la validación previa y el piloto web se refieren al piloto de directos, sin el módulo de juegos. FASE-09 solo se reactiva con un encargo explícito del usuario. Esta excepción no activa otras fases ni cambia otras dependencias.
- **Excepción de secuencia autorizada por el promotor (RD-008).** FASE-10 queda diferida para después del primer piloto, sin fecha ni activación autorizada. No es prerrequisito de FASE-11 ni de FASE-12 y solo se reactiva con un encargo explícito del usuario. Las pruebas exclusivas del cartel QR no bloquean la prueba técnica de FASE-03 para este piloto: se conservan para la etapa del módulo QR, sin modificar el borrador de LIVE-002. La excepción de FASE-09 no cambia.
- **Componentes incluidos y diferidos (RD-006, RD-007 y RD-009).** FASE-07 incluye el contenido exclusivo elegido y difiere «Cercanos». FASE-08 difiere solo los aportes directos. La validación previa (FASE-11) y el piloto (FASE-12) se refieren a los componentes incluidos: las partes diferidas (juegos, aportes directos, campañas QR y «Cercanos») no se exigen para cerrarlas. Estos ajustes no activan fases ni cambian otras prioridades, criterios o dependencias.
- Los informes generales de IA quedan cerrados como actividad de FASE-01. FASE-02 requiere respuestas concretas, dictámenes, condiciones y decisiones; no otra ronda abierta de informes sobre el mismo modelo.
- “Cierre documental” no significa “modelo legalmente aprobado”. Las cuestiones jurídicas y contractuales que la v1.2 identifica pasan a FASE-02; las exclusivas de los juegos quedan diferidas con FASE-09 (RD-001). La v1.2 estudió el circuito con casino: no evaluó ni aprobó el piloto de directos sin juegos.
- Las pruebas previas al piloto usan contenido neutral, datos y saldos ficticios y entornos de prueba. Los cobros, apuestas y pagos reales dependen de las condiciones aprobadas para FASE-12.
- No hay calendario ni presupuesto inventados. Se estiman al abrir cada fase.

Los códigos funcionales existentes `LIVE-F01` a `LIVE-F15` no son fases y se conservan. Las fases usan `FASE-01` a `FASE-13`; las nuevas entregas, por ejemplo, `LIVE-FASE01-E01`. LIVE-001 a LIVE-007 conservan su identidad histórica y sus dependencias.

## 3. Flujo de entrega y publicación

1. **Encargo acotado:** ChatGPT y el usuario concretan objetivo, base, archivos previstos y aceptación.
2. **Preparación por Claude:** cambios locales y comprobaciones necesarias; entrega de parche y paquete descargable.
3. **Auditoría por ChatGPT:** revisión del parche exacto, archivos nuevos, coherencia y evidencia. Puede quedar conforme o necesitar correcciones.
4. **Aplicación por el usuario:** sobre su copia local del repositorio, tras comprobar base, integridad y aplicación del parche.
5. **Commit y push del usuario:** publicación manual del contenido revisado.
6. **Verificación del resultado publicado:** comprobar el SHA y el estado; cerrar la entrega y, si cumple sus criterios, la fase.

Claude no ejecuta `git add`, `git commit`, `git push`, creación de PR, merges ni modificaciones remotas. Tampoco publica mediante herramientas API, scripts o procesos en segundo plano. ChatGPT no publica en nombre del usuario.

Los permisos de escritura o instrucciones antiguas de un encargo no autorizan esas operaciones. Esta regla sigue vigente hasta que el usuario la cambie expresamente. No se reescribe el historial ya publicado.

No se cambian ahora la rama predeterminada, el nombre de rama, permisos de GitHub, correos o identidad Git. Su eventual organización será una entrega separada.

Una revisión vale para el contenido exacto entregado: si el parche cambia después, se vuelve a auditar la revisión afectada antes de publicarla. Si cambia la base, se comprueba de nuevo su compatibilidad.

## 4. Versiones y registro

- Cada entrega identifica fase, ID, versión del paquete y SHA base.
- Una corrección del mismo objetivo incrementa la versión del paquete; no crea una fase nueva ni exige repetir toda la auditoría.
- La definición v0.33 sigue siendo la base de producto. Una actualización del proceso no crea silenciosamente la v0.34 del producto.
- Los cambios explícitos de requisitos se anotan en el [registro de decisiones](../producto/REGISTRO-DECISIONES.md), que prevalece sobre la v0.33 solo en esos cambios.
- Los resultados v1.0, v1.1 y v1.2 de LIVE-001 permanecen como archivos existentes; no se crea una v1.3 para esta reorganización.
- El estado diferencia: preparación, pendiente de auditoría, conforme, publicado y cerrado. No se llama publicado a un paquete descargable ni cerrado a un trabajo que no cumple su criterio.
- Las decisiones del usuario, propuestas técnicas y confirmaciones de terceros se registran por separado.

## 5. Contribuciones de GitHub

Hacer el push no basta para atribuir un commit a una cuenta. Importan el correo asociado al autor y la presencia del commit en una rama que cuente, además de los demás criterios de GitHub. El usuario hará sus commits con su configuración verificada; no se inventa un correo ni se cambia la autoría de los commits anteriores.

Referencia oficial, consultada el 17-10-2026: [GitHub — Troubleshooting missing contributions](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions). La consulta consta en el encargo LIVE-FASE01-E01; Claude no ha leído esa página.
