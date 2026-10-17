# Plan por fases y flujo de entrega — v1.0

| Campo | Valor |
| --- | --- |
| Versión | 1.0 |
| Origen | Entrega LIVE-FASE01-E01 v1.0, encargo del 17-10-2026 (America/Bogota), apartados 1 a 5. El encargo ejecutable no se copia en el repositorio |
| Base comprobada | `7184f7ca87d51bdba5e21c8e4d29df14025e6b46` |
| Definición de producto | [v0.33](../producto/proyecto-live-definicion-v0.33.md) |
| Síntesis de investigación | [LIVE-001-resultado-v1.2](../investigacion/LIVE-001-resultado-v1.2.md) |
| Fase activa | **FASE-01, cierre de investigación documental** |
| Estado del proyecto | [ESTADO-PROYECTO](ESTADO-PROYECTO.md) |

## 1. Cambio de forma de trabajo

El usuario ha pedido trabajar una fase a la vez, con entregas acotadas y publicación manual después de la auditoría de ChatGPT. Esta decisión reemplaza las instrucciones previas de hacer commit y push automáticamente.

El encargo LIVE-002 entregado anteriormente queda **pausado**. No se inicia ni se continúa en paralelo. Tampoco se ejecutan ahora LIVE-005 o LIVE-006. Sus borradores se conservan como entradas de fases posteriores.

Esta reorganización no cambia el producto: casino imprescindible en el lanzamiento real, contenido adulto, usos de monedas y ganancias, países elegidos, funcionamiento de salas y demás decisiones de la v0.33 se mantienen como requisitos sujetos a su viabilidad. Cambiar el orden de construcción no autoriza a retirar funciones.

## 2. Hoja de ruta

Las fases agrupan objetivos. Cada fase tendrá entregas pequeñas, con alcance propio. No se construye una fase completa en un único cambio.

| Fase | Objetivo | Alcance | Criterio de cierre | Estado |
| --- | --- | --- | --- | --- |
| FASE-01 | Cierre de investigación documental | Congelar la v1.2 como síntesis de esta etapa, trasladar los pendientes externos y ordenar el trabajo. | Paquete de cierre auditado, aplicado y publicado manualmente por el usuario. No exige demostrar viabilidad legal. | ACTIVA: en cierre |
| FASE-02 | Viabilidad y decisiones del piloto | Resolver el circuito económico, la ruta del casino, empresa, pagos, territorios, recursos y operación con respuestas profesionales o contractuales concretas. | Ruta documentada y decisión del usuario: viable, requiere cambios o bloqueada. No se inventa aceptación para avanzar. | Pendiente |
| FASE-03 | Prueba técnica móvil | Comprobar captura, multistream, chat/regalos, reconexión y transición a exclusivo con contenido neutral. | Resultados reproducibles en equipos y cuentas autorizados, con límites y fallos conocidos; los obstáculos vuelven a una decisión explícita. | Pendiente |
| FASE-04 | Diseño funcional y experiencia | Concretar pantallas, reglas de intervalos, perfiles, devoluciones, permisos y contratos entre módulos. | Prototipo y reglas de aceptación revisados; detalles propuestos diferenciados de decisiones confirmadas. | Pendiente |
| FASE-05 | Base técnica y seguridad | Preparar arquitectura, proyecto, datos, cuentas, roles, verificación y registro de operaciones. | Base ejecutable y controles esenciales comprobados; integraciones de prueba donde corresponda. | Pendiente |
| FASE-06 | Directos y salas | Construir emisión interna, chat, moderación, contadores, reconexión, grabación y paso a exclusivo. | Flujos de directo comprobados con saldos ficticios; sin cobros reales. | Pendiente |
| FASE-07 | Perfiles y comunidad | Contenido exclusivo, suscripciones, compras, mensajes de texto, seguidores, descubrimiento y avisos. | Recorridos y permisos comprobados con datos de prueba. | Pendiente |
| FASE-08 | Economía y pagos | Libro de saldos, recargas, regalos, accesos, aportes directos y solicitudes de retiro de creadores. | Conciliación, devoluciones y controles verificados en entornos de prueba, con proveedores y condiciones identificados. | Pendiente |
| FASE-09 | Casino | Integrar los juegos y el anfitrión conforme a la ruta jurídicamente validada. | Integración y certificaciones aplicables comprobadas en pruebas; el casino sigue siendo imprescindible para el lanzamiento real. | Pendiente |
| FASE-10 | Promoción mediante QR | Tareas, evidencias continuas, captación, bonos y remuneración. | Recorridos y controles comprobados en pruebas, con las condiciones de operación definidas. | Pendiente |
| FASE-11 | Validación previa al piloto | Integración entre módulos, seguridad, cargas, privacidad, moderación, soporte y recuperación. | Criterios de lanzamiento superados y condiciones jurídicas, contractuales y operativas vigentes documentadas. | Pendiente |
| FASE-12 | Piloto web controlado | Operar gradualmente con usuarios reales bajo el alcance aprobado. | Métricas y revisión del piloto; capacidad objetivo de 5 creadores y 50 espectadores internos totales y actividad superior a 8 h/día. | Pendiente |
| FASE-13 | Aplicación de tienda | Preparar Android compatible con la tienda y definir después la posible etapa de iOS. | Alcance compatible y revisión de publicación; no se presume equivalencia con la web. | Posterior al piloto |

Reglas de secuencia:

- Solo hay una fase activa y una entrega activa.
- Una dependencia resuelta parcialmente no equivale a una fase superada.
- Si aparece un obstáculo material, se registra la decisión necesaria; no se elimina el requisito ni se salta de fase.
- La fase siguiente comienza con un encargo explícito del usuario después del cierre de la anterior.
- Si el usuario quiere cambiar el orden, se actualiza este plan y se explica la dependencia afectada antes de ejecutar.
- Los informes generales de IA quedan cerrados como actividad de FASE-01. FASE-02 requiere respuestas concretas, dictámenes, condiciones y decisiones; no otra ronda abierta de informes sobre el mismo modelo.
- “Cierre documental” no significa “modelo legalmente aprobado”. Las cuestiones jurídicas y contractuales que la v1.2 identifica pasan a FASE-02.
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
- Los resultados v1.0, v1.1 y v1.2 de LIVE-001 permanecen como archivos existentes; no se crea una v1.3 para esta reorganización.
- El estado diferencia: preparación, pendiente de auditoría, conforme, publicado y cerrado. No se llama publicado a un paquete descargable ni cerrado a un trabajo que no cumple su criterio.
- Las decisiones del usuario, propuestas técnicas y confirmaciones de terceros se registran por separado.

## 5. Contribuciones de GitHub

Hacer el push no basta para atribuir un commit a una cuenta. Importan el correo asociado al autor y la presencia del commit en una rama que cuente, además de los demás criterios de GitHub. El usuario hará sus commits con su configuración verificada; no se inventa un correo ni se cambia la autoría de los commits anteriores.

Referencia oficial, consultada el 17-10-2026: [GitHub — Troubleshooting missing contributions](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions). La consulta consta en el encargo LIVE-FASE01-E01; Claude no ha leído esa página.
