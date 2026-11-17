# Fondo institucional de ALTAR

El fondo de la portada toma como referencia estética el banner de CREE compartido por el responsable del proyecto: montañas, bruma y diagonales en grises. El archivo de montañas se creó con ImageGen en una entrega anterior; no es una fotografía de una sede ni una pieza oficial publicada por la iglesia.

La portada usa el mismo encuadre al 70 % y el mismo velo gris que el fondo de video de CREE. El titular y el botón principal toman el marfil `#e4dacf` de esa referencia. Montserrat y Lora completan la identidad tipográfica.

El símbolo oficial de ALTAR se superpone con baja opacidad. Las fotos de la portada se muestran con sus colores originales.

El encuadre del fondo es fijo para mantener visibles las montañas a distintas alturas de pantalla. En móvil se agrega un velo suave en la parte alta para mejorar el contraste bajo el texto. Las fotos superpuestas usan sus efectos de entrada y movimiento.

## Archivos

- `assets/images/altar-mountains-mist-source.png`: resultado original generado.
- `assets/images/altar-mountains-mist.webp`: copia optimizada para la web.
- `assets/css/altar-main.css`: estructura y encuadre del fondo.
- `assets/css/altar-identity.css`: velo gris, marfil y tratamiento de las fotografías.

Los archivos fuente oficiales de CREE se conservan como referencia. Sus copias web optimizadas se utilizan en la página propia de CREE. La revisión estática de recursos pasa, pero aún falta una nueva revisión visual de la portada completa en escritorio y móvil.

## Prompt histórico de generación

Este prompt documenta la creación original del archivo. La petición de una zona clara para texto negro corresponde a aquella composición; la presentación actual oscurece el fondo mediante CSS y utiliza texto blanco.

```text
Use case: ads-marketing.
Asset type: a finished photographic background asset for the homepage hero of ALTAR Comunidad Cristiana, a Peruvian Christian church. This is a NEW background image, not a website mockup or an edited screenshot.
Reference image: the supplied YouTube screenshot is a STYLE REFERENCE ONLY for its CREE banner at the top: grayscale mountain ridges, drifting mist, metallic silver-to-charcoal atmosphere and translucent diagonal geometry. Ignore the rest of the screenshot.
Primary request: create an original, elegant, cinematic mountain-and-mist background belonging to the ALTAR visual world. Wide 16:9 landscape composition, high detail and realistic rocky Andean-style mountain silhouettes. Keep the upper half and the LEFT 55 percent luminous pale silver / off-white with soft haze and quiet negative space, because BLACK website text will be placed there in real HTML. Place the more defined rocky mountain ridgeline in the lower third and across the right half, with multiple atmospheric layers, drifting clouds and fine natural rock detail. Add a few broad, very subtle translucent diagonal geometric planes, reminiscent of the angular construction of the ALTAR identity, integrated behind the mountains, with elegant restraint. Let the mountains remain clearly perceptible at the lower edge and right side.
Color palette: strictly neutral grayscale, pearl white, pale silver, stone gray, graphite and charcoal; no sepia, beige, blue or colored light.
Mood: peaceful, reverent, contemporary, hopeful, refined. Soft diffused light and natural photographic atmosphere.
Critical constraints: NO text of any kind; NO CREE, NO ALTAR lettering, NO dates or numbers, NO logos, NO watermarks, NO interface, NO framed cards, NO people, NO buildings, NO religious objects, NO crosses. The official ALTAR logo will be placed independently with code to preserve its exact geometry. This should be one continuous background image filling the full rectangular canvas, not a collage, not a banner within a larger page.
```
