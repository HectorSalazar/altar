# ALTAR Comunidad Cristiana

Sitio informativo de ALTAR con una página principal y vistas propias de Yo Elijo la Pureza, CREE, Comparte, Viajes misioneros y Casas de Vida. Utiliza HTML, CSS y JavaScript sin compilación ni dependencias de instalación. La base es **Resonance Main One Page**, de Bestlooker; la identidad visual se adapta al material oficial de ALTAR 2026.

[Ver la landing en GitHub Pages](https://hectorsalazar.github.io/altar/)

## Ver la propuesta

Ejecuta:

```sh
npm run dev
```

La vista local estará disponible en `http://127.0.0.1:4173`. Las páginas completas están en `/`, `/yoelijolapureza/`, `/cree/`, `/comparte/`, `/viajes-misioneros/` y `/casas-de-vida/`. Se pueden abrir los archivos `index.html` directamente. Los accesos `yoelijolapureza.html`, `cree.html`, `comparte.html`, `viajes-misioneros.html` y `casas-de-vida.html` llevan a las páginas correspondientes. Los enlaces de YELP, CREE, Comparte y Viajes misioneros en la página principal abren una pestaña nueva.

Para comprobar recursos, enlaces internos y referencias accesibles:

```sh
npm run check
```

La comprobación estática verifica las páginas, anclas, archivos enlazados, dependencias CSS y cabeceras de los PDF descargables. La actualización del 10 de noviembre de 2026 pasa esta comprobación. Falta completar una nueva revisión visual de escritorio y móvil de esta versión; las capturas anteriores de `.qa/` no certifican el diseño actualizado.

## Identidad y efectos

Montserrat variable y Lora Regular proceden de la carpeta de fuentes oficial facilitada para el proyecto y se sirven localmente en WOFF2, con sus licencias. Montserrat se utiliza como familia principal y Lora en frases y destacados. La referencia también menciona Neutrif Pro, pero esa fuente no se incluyó en el paquete; queda pendiente su incorporación si se facilita el archivo autorizado.

El encabezado compartido combina el isotipo oficial con los textos ALTAR y Comunidad Cristiana en Montserrat. El subtítulo mide 11 px y el conjunto ocupa 234 px en escritorio y 207 px en móvil. La barra mide 85 px en escritorio y 78 px en móvil. Al desplazarse se aclara, pasa a 70 px y muestra el isotipo oscuro con una transición de 0,5 segundos. Los estilos se comparten en `assets/css/altar-navbar.css`.

El pie de las seis páginas públicas usa la plantilla de `scripts/footer.mjs` y los estilos de `assets/css/altar-footer.css`. Ejecuta `npm run sync:footer` después de editar la plantilla o los valores base del pie en el catálogo del CMS. El comando actualiza los HTML que se publican y `npm run check` verifica que estén sincronizados.

La portada usa el fondo de montañas y bruma con el encuadre y velo gris del video de CREE. El titular y el botón principal toman su marfil `#e4dacf`. Las fotografías superpuestas se muestran a color y mantienen sus efectos de entrada y movimiento.

## Estructura

- `index.html`: página principal, identidad institucional, agenda y cinco sedes.
- `yoelijolapureza/index.html`: página completa de YELP.
- `cree/index.html`: página de CREE con espacio para video, galería y testimonios.
- `comparte/index.html` y `viajes-misioneros/index.html`: páginas de evangelismo, servicio y viajes de ALTAR.
- `casas-de-vida/index.html`: página sobre los grupos de encuentro entre semana y cómo participar.
- `yoelijolapureza.html`, `cree.html`, `comparte.html`, `viajes-misioneros.html` y `casas-de-vida.html`: accesos alternativos con redirección relativa y enlace de respaldo.
- `assets/css/altar.css` y `assets/css/altar-main.css`: estructura y composición de la página principal.
- `assets/css/altar-identity.css`: identidad ALTAR 2026, encabezado y portada.
- `assets/css/yelp.css` y `assets/css/cree.css`: estilos de las páginas propias.
- `assets/fonts/altar-brand.css`: fuentes locales Montserrat y Lora.
- `assets/js/content.js` y `assets/js/altar.js`: contenido de formación, diálogos y comportamiento de la página principal.
- `assets/js/cree-content.js` y `assets/js/cree.js`: contenido base y reproductor de CREE.
- `assets/cms-schema.json` y `assets/js/cms.js`: catálogo de campos y carga del contenido publicado desde la intranet.
- `assets/images/`: logos, fotografías, gráficas de sedes y recursos de los eventos.
- `assets/downloads/`: PDF públicos de YELP y El camino del discípulo.
- `assets/vendor/resonance/`: recursos originales de la plantilla.
- `docs/`: fuentes, decisiones de contenido y pendientes editoriales.

## Contenido disponible

La página principal incluye Sobre nosotros, visión, misión, ADN, liderazgo, mensajes, Carisma, El camino del discípulo, Casas de Vida, agenda, libros y sedes. La agenda utiliza los nombres **Sector H**, **Valiente** y **Matrimonios**. Visión, misión y valores permanecen visibles. Café con Romanos y Café con Gálatas quedan temporalmente comentados en el HTML de la portada.

El camino del discípulo presenta los doce capítulos del manual facilitado para el proyecto. Su PDF se puede descargar desde la tarjeta de formación y desde el diálogo del curso. No se han definido duración en semanas, precio, certificado ni convocatoria.

YELP reproduce la composición de la portada oficial con las imágenes originales y el video de presentación local en 1080p. Incluye expositores, dieciocho temas, material histórico, contactos y los PDF **Pequeños Valientes** y **Escape** en `assets/downloads/`. La siguiente fecha sigue por anunciar. [Página oficial de YELP](https://www.familiaccp.com/yoelijolapureza) · [Recursos](docs/YELP-RECURSOS.md)

CREE 2026 se presenta como un evento celebrado. Su página tiene preparada la incorporación de un video, imágenes y testimonios aprobados. El resumen audiovisual del aniversario de treinta años es una opción adecuada para ese contexto; no se utiliza como presentación general de ALTAR. El acceso al recurso de Drive no permitió verificar una URL reproducible y el video permanece pendiente. No se han inventado testimonios. Consulta las indicaciones en [CREE.md](docs/CREE.md).

Comparte presenta las salidas de evangelismo y servicio. Viajes misioneros recoge el trabajo de ALTAR en Pucallpa. Los testimonios de cada iniciativa se editan en la sección correspondiente de `comparte/index.html` y `viajes-misioneros/index.html`. Las páginas enlazan a WhatsApp para coordinar la participación y consultar cómo auspiciar estas iniciativas.

Casas de Vida tiene una página propia que explica los encuentros entre semana para compartir la fe y hacer comunidad, con un contacto para consultar cómo integrarse a un grupo.

Los horarios dominicales fueron actualizados por indicación del responsable el **10 de noviembre de 2026** y coinciden con las cinco gráficas oficiales incluidas:

| Sede | Domingos |
| --- | --- |
| San Isidro | 11:00 a. m. y 5:00 p. m. |
| Chorrillos | 10:00 a. m. y 5:00 p. m. |
| San Martín de Porres | 10:30 a. m. |
| Reynoso | 10:30 a. m. |
| Mirones | 5:30 p. m. |

Las sedes usan acordeones HTML con una bienvenida inspirada en los afiches, dirección, horario, mapa y redes. Los mapas abren una búsqueda de Google Maps por dirección. Las imágenes, fuentes y descargas se sirven localmente; los enlaces a videos, redes y mapas necesitan conexión. La web no recoge formularios ni procesa pagos.

## Publicación futura en cPanel

Esta entrega actualiza los archivos locales; no se ha desplegado en cPanel. Para publicar el sitio estático, incluye `index.html`, `assets/`, las carpetas `yoelijolapureza/`, `cree/`, `comparte/`, `viajes-misioneros/` y `casas-de-vida/`, y los accesos `yoelijolapureza.html`, `cree.html`, `comparte.html`, `viajes-misioneros.html` y `casas-de-vida.html`. Conserva su estructura relativa. No hace falta ejecutar Node en el hosting.

No es necesario publicar `docs/`, `scripts/`, `.qa/`, `package.json` ni los originales de trabajo. Antes de publicar, completa el dominio para las URL absolutas de metadatos y revisa los contenidos pendientes. Los recursos de Resonance pertenecen a la compra del proyecto; conserva sus términos de licencia.

El editor **Sitio público** de la intranet guarda borradores y publica cambios para las seis páginas. El contenido publicado se carga desde `/api/public/pages/{slug}` en el mismo dominio. La publicación aplica los campos editados sobre el contenido base de cada página. El pie de la portada muestra el enlace **Intranet** cuando `/api/health` confirma que hay una cuenta ROOT activa. La vista estática y los metadatos de origen siguen disponibles cuando se abre el HTML localmente o cuando la API está fuera de servicio.

Para que una página pueda usar un campo nuevo, agrega su definición a `assets/cms-schema.json` y la referencia correspondiente `data-cms-*` al HTML. Las claves de los campos identifican los cambios ya guardados. Las imágenes, enlaces y textos editados mantienen el marcado de accesibilidad y los efectos existentes. Los robots que leen el HTML estático reciben los metadatos originales.
