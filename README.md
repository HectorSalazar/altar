# ALTAR Comunidad Cristiana · sitio público

Sitio informativo de ALTAR con **nueve páginas** y un formulario de bienvenida que se integra con la intranet. Utiliza HTML, CSS y JavaScript sin compilación. La base es Resonance Main One Page, de Bestlooker, adaptada a la identidad de ALTAR.

La referencia vigente es la lista de 26 puntos de la revisión del 24 de noviembre de 2026. Consulta [su estado y pendientes](docs/REVISION-2026-11-24.md).

## Vista local y comprobación

Desde la carpeta de la landing:

```sh
npm run dev
npm run check
```

La vista local abre en [el servidor de la landing](http://127.0.0.1:4173/) y conecta el formulario con Docker en el puerto `8180`. Si usas otro puerto o la vista PHP portátil, define `ALTAR_DEV_ORIGIN` con su origen local antes de ejecutar `npm run dev`. El editor y el aula se abren desde el servidor integrado.

El formulario también funciona desde Live Server de VS Code en `127.0.0.1:5500` o `localhost:5500` con Docker local en el puerto `8180`. La conexión se habilita para esas dos direcciones mediante la configuración local de Docker.

`npm run check` verifica HTML, recursos, enlaces, anclas, referencias accesibles, catálogo del CMS, PDF y sincronización del pie. Después de modificar la plantilla compartida del pie o sus valores base, ejecuta `npm run sync:footer`.

## Páginas y archivos

| Ruta | Archivo |
| --- | --- |
| Inicio | `index.html` |
| `/yoelijolapureza/` | `yoelijolapureza/index.html` |
| `/cree/` | `cree/index.html` |
| `/comparte/` | `comparte/index.html` |
| `/viajes-misioneros/` | `viajes-misioneros/index.html` |
| `/casas-de-vida/` | `casas-de-vida/index.html` |
| `/nuestro-legado/` | `nuestro-legado/index.html` |
| `/pastores/` | `pastores/index.html` |
| `/libreria/` | `libreria/index.html` |

Cada página secundaria conserva un acceso alternativo `.html` con redirección relativa y enlace de respaldo. Los destinos a eventos, legado y pastores desde Inicio abren una pestaña nueva.

- `assets/css/altar-navbar.css`: encabezado compartido con fondo oscuro y claro al 90 % de opacidad.
- `assets/css/altar-home-revision.css`: franja del ADN, cursos, Misiones, historias y composición de bienvenida.
- `assets/js/content.js` y `assets/js/altar.js`: contenido y diálogos de los cursos.
- `assets/js/altar-family-video.js`: reproducción de la presentación con diálogo accesible.
- `assets/js/visitor-registration.js` y `assets/css/visitor-registration.css`: formulario de bienvenida.
- `assets/js/yelp.js` y `assets/css/yelp.css`: pestañas y efectos de YELP.
- `assets/js/secondary-pages.js` y `assets/css/secondary-pages.css`: legado, equipo pastoral y librería.
- `assets/cms-schema.json` y `assets/js/cms.js`: catálogo y carga del contenido publicado desde la intranet.
- `scripts/footer.mjs` y `assets/css/altar-footer.css`: pie compartido de las nueve páginas.
- `assets/images/`, `assets/downloads/` y `assets/fonts/`: imágenes, PDF y fuentes públicos.

## Contenido y comportamiento

La portada mantiene «Cristo es nuestro altar» sin la cita de Hebreos y utiliza las frases «Juntos en su presencia, juntos en su propósito», «Encuentro → Rendición → Envío» y «Dios es bueno, todo el tiempo». En Viajes misioneros se añade «Y en todo lugar». Los textos próximos al video son breves. El ADN aparece en una franja con fotografía a la izquierda y parallax moderado. El movimiento se reduce según la preferencia del usuario. Los textos alternativos y los controles de teclado se conservan.

La franja dominical representa a las cinco sedes y enlaza la enseñanza existente de Guiados. Todas las sedes comienzan colapsadas. Domingos en familia también queda compacto para dar espacio a la bienvenida. Las propuestas de estructura y de la frase institucional de los puntos 2 y 7 siguen pendientes de validación editorial.

Charisma y El camino del discípulo utilizan los recursos oficiales disponibles, un encuadre homogéneo y un botón negro por tarjeta. Ambos abren un diálogo; Charisma enlaza al aula y El camino del discípulo ofrece contacto por WhatsApp. La etiqueta es **Escuela bíblica**. No se han creado grabaciones de invitación de los pastores.

YELP presenta únicamente a Danny y Daniela Príncipe, Miluska Príncipe de Guevara y Nélida Ossio de Montes. Sus dieciocho temas se organizan en pestañas de Jóvenes, Padres y pastores, y Preadolescentes. Las imágenes y los fondos mantienen efectos suaves y respetan movimiento reducido.

Librería reúne los cuatro libros disponibles: **El amor vino y se quedó**, **Semillas de sanidad**, **Pequeños Valientes** y **Escape**, con sus recursos locales. El catálogo puede ampliarse cuando se entreguen títulos e imágenes; no se han inventado precios, stock ni una compra con carrito.

Nuestro legado dispone de una enseñanza identificada de Hernán Paredes y espacio para un segundo video autorizado. Pastores ofrece diez fichas editables, con la presentación confirmada de Danny y Daniela y espacios pendientes de nombres, sedes, fotos y reseñas. Los espacios de testimonios no contienen relatos inventados.

## Registro de bienvenida e intranet

El formulario está desplegado en `#bienvenido` y tiene accesos desde la portada y el menú de Inicio. Solicita nombre y apellido, edad, cumpleaños, distrito, correo, estado civil y si tiene hijos. Las edades de los hijos son opcionales. El consentimiento permite usar los datos para contactar a la persona y acompañar su integración.

Con la API activa, solicita un token de sesión a `/api/public/visitor-form` y entrega el registro a `/api/public/visitors`. Conserva el identificador del intento para evitar duplicados. La vista de GitHub Pages muestra los campos y ofrece contacto por WhatsApp.

En la intranet, **Integrantes** muestra las fichas y el seguimiento. El aula de Charisma requiere una cuenta habilitada y cursos asignados.

## Recursos y pendientes editoriales

Las fuentes Montserrat y Lora se sirven localmente con sus licencias. Los logos de los cursos proceden del material facilitado; se conserva su identidad sin redibujarlos.

`assets/images/altar-estudio-laptop-conceptual.webp` fue generada con la herramienta integrada `image_gen` como imagen conceptual para el curso. No representa a un alumno, pastor o sede reales. [El registro de recursos](docs/recursos-2026-11-24.json) contiene el prompt literal y la procedencia de las portadas recuperadas.

Siguen pendientes:

- Fotografías recientes y autorizadas de distintas sedes. Los cinco afiches de horarios disponibles no se presentan como fotografías nuevas de congregaciones.
- Una fotografía actual de Comparte; se mejoró el encuadre de la imagen disponible, sin atribuirle otra fecha o procedencia.
- Fotografías y biografías de los fundadores, el segundo video de su legado y los datos completos del equipo pastoral.
- Testimonios autorizados y futuras incorporaciones al catálogo de libros.
- El texto definitivo y el enfoque editorial de los puntos 2 y 7.
- La portada de La Autoridad del Creyente (2-2) y los recursos complementarios que no aparecen en el material revisado.

El punto 15, grabaciones de invitación, está fuera de la tarea de implementación. El punto 24, Google Analytics, queda diferido hasta configurar la cuenta y el identificador de medición. No se activa un seguimiento con un identificador ficticio.

## Editor y preparación de publicación

El CMS cubre las nueve páginas. Para agregar un campo editable, incorpora su definición en `assets/cms-schema.json` y su referencia `data-cms-*` en el HTML. Las claves identifican las ediciones guardadas; los textos, imágenes y alternativas accesibles deben mantenerse coherentes.

Publicar un borrador en el CMS actualiza la base servida por la API; no despliega archivos en otro hosting. Una publicación estática usa el contenido base del HTML y los assets incluidos. El editor, el registro en base de datos y el aula requieren la API y su base. El enlace de intranet se habilita cuando la API confirma su configuración.

GitHub Pages publica la raíz de `main`. Conserva las rutas relativas de las nueve páginas y sus recursos para que funcionen bajo `/altar/`. [Sitio público de ALTAR](https://hectorsalazar.github.io/altar/)
