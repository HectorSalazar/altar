# Completar la página de CREE

La página está en `cree/index.html`, accesible desde `cree/`. El archivo `cree.html` redirige a esa ruta. El arte de CREE 2026 procede de los archivos oficiales facilitados para el proyecto.

Edita `assets/js/cree-content.js` para añadir contenido aprobado:

- **Video local:** copia un MP4 o WebM a `assets/videos/` y completa `video.src` con su ruta relativa a la raíz del proyecto, por ejemplo `assets/videos/cree-2026.mp4`. Puede añadirse una descripción y una imagen de portada.
- **Video de YouTube:** completa `video.youtubeUrl` con el enlace HTTPS. Se admiten los enlaces de YouTube y youtu.be. El reproductor usa el dominio de privacidad mejorada de YouTube. Deja `video.src` vacío si usas YouTube.
- **Galería del evento:** completa `gallery` con objetos que contengan `src`, `alt` y, opcionalmente, `caption`. Las imágenes deben estar en `assets/`. Al añadir fotos de CREE, se sustituye la galería inicial de la comunidad y se oculta su nota provisional.
- **Testimonios:** completa `testimonials` con `quote`, `name` y, opcionalmente, `detail`. Solo se muestran los testimonios que tengan texto y nombre.

No se han inventado testimonios ni atribuido al evento las fotografías generales de la comunidad. Mientras falte el video o los testimonios, se muestran mensajes públicos de próxima publicación. No hay un botón de reproducción sin destino.

No hace falta compilar. Para publicar, incluye `cree.html`, `cree/` y todos sus recursos dentro de `assets/`, además de los archivos de la web principal.

## Criterio de selección del video

La reunión menciona un **video resumen de los 30 años** alojado en el repositorio central de la iglesia (41:47–42:23). Ese es el material que corresponde buscar para esta página. El video de presentación general de ALTAR, los pastores sentados en un sillón y las piezas de invitación son materiales distintos; no deben presentarse como resumen de CREE sin verificar su contenido.

La revisión del material público previamente recopilado confirmó que los posts de Instagram `De7HbNvlKWb` (aniversario) y `De5ltNIkcLt` (tercer día de CREE) son carruseles de fotografías, no videos. La pieza local de invitación al aniversario tampoco es un resumen. El reproductor queda preparado a la espera del archivo correcto.
