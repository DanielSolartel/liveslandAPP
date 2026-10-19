# Instrucciones para Claude en este repositorio

Proyecto LIVE: documentación de definición y viabilidad, y un experimento técnico en `experimentos/directo-movil/`. La aplicación de producción no está implementada.

## Antes de trabajar

1. Lee [docs/estado/PLAN-POR-FASES.md](docs/estado/PLAN-POR-FASES.md) y [docs/estado/ESTADO-PROYECTO.md](docs/estado/ESTADO-PROYECTO.md).
2. Comprueba rama, HEAD y `git status`, y contrástalos con el SHA base del encargo. Conserva los cambios ajenos que encuentres.
3. Identifica la fase activa y la entrega activa. Trabaja solo en esa entrega; si el encargo no la identifica, pregunta antes de empezar.

## Alcance

- Solo hay una fase activa y una entrega activa. Las entregas son pequeñas; no se construye una fase completa en un solo cambio.
- La fase siguiente empieza solo con un encargo explícito del usuario, después del cierre de la anterior. Solo se admite una excepción si el plan la registra expresamente y su encargo la autoriza; la excepción no cierra ni sustituye la fase que queda en espera.
- Ante un obstáculo material, registra la decisión necesaria. No elimines el requisito ni saltes de fase.
- La definición v0.33 es la base de producto y sus decisiones siguen vigentes. Cambiar el orden de construcción no autoriza a retirar funciones, y un cambio de proceso no crea una nueva versión del producto.
- No modifiques los originales de `docs/producto/` y `docs/encargos/` ni los informes de LIVE-001 en `docs/investigacion/`.
- Registra por separado las decisiones del usuario, las propuestas técnicas y las confirmaciones de terceros. No inventes calendario, presupuesto, citas ni respuestas de terceros.
- Las pruebas previas al piloto usan contenido neutral, datos y saldos ficticios y entornos de prueba; sin cobros, apuestas ni pagos reales.

## Entrega y publicación manual

- No ejecutes `git add`, `git commit`, `git push`, creación de PR, merges ni modificaciones remotas. No publiques mediante herramientas API, scripts o procesos en segundo plano.
- Los permisos de escritura o las instrucciones antiguas de un encargo no autorizan esas operaciones. La regla sigue vigente hasta que el usuario la cambie expresamente. No reescribas el historial publicado.
- No cambies la rama predeterminada, el nombre de rama, los permisos de GitHub, los correos ni la identidad Git.
- Entrega un parche contra el SHA base que incluya los archivos nuevos, generado sin staging ni commits temporales, y un paquete descargable con las copias finales, un manifiesto con tamaño y SHA-256 de cada archivo y del parche, y el registro de comprobaciones hechas y no hechas.
- Al terminar, comprueba que HEAD y el remoto no cambiaron por tu trabajo.
- Una auditoría vale para el contenido exacto entregado. Si el parche cambia, sube la versión del paquete y vuelve a someterlo a auditoría.
- Un paquete descargable no está publicado. La publicación la hace el usuario después de la auditoría de ChatGPT.
