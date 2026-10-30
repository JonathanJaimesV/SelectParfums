# Auditoría y optimización de SelectParfums

Fecha: 30/10/2026 · Stack: React 19 + Vite 8 + react-router-dom (sin dependencias nuevas).

> **Estado de la verificación (leer primero).** El entorno donde se hizo esta auditoría **no pudo ejecutar el build de Vite ni abrir un navegador**: el `node_modules` del proyecto se instaló en Windows (solo trae `@rolldown/binding-win32-x64-msvc`) y no había red para instalar el binario de Linux. Por eso **no hay métricas de Lighthouse ni capturas móviles**, y **el build de producción y la revisión visual están pendientes de ejecutarse en tu equipo** (ver sección G). Lo que sí se ejecutó: `node --test` (80/80 pruebas pasan antes y después), balance de llaves en todos los CSS y un escaneo estático de clases/imports/exports.

## A. Problemas encontrados

| # | Problema | Dónde | Por qué corregirlo |
|---|----------|-------|--------------------|
| 1 | Botones, buscador, chips y selectores con radio de 2 px (casi cuadrados). El buscador del catálogo era solo una línea inferior. | `styles.css` (`--radius-btn`), `catalog.css` (`.cat-chip`, `.cat-filtbtn`, `.cat-sort select`, `.cat-search__input`) | Estética distinta a la pedida; radios hardcodeados que ignoraban el token. |
| 2 | "Fragancias destacadas" mostraba en móvil: subtítulo, contador, flechas, miniaturas con marca+nombre+precio, descripción de 4 líneas, marca, nombre, etiqueta, formato, precio y dos acciones. | `FeaturedShowcase.jsx` / `featured.css` | Demasiada información compitiendo; mucha altura vertical. |
| 3 | La portada y el banner del catálogo cargaban PNG de **1,9 MB** (1672 px) y **4,1 MB** (3344 px). | `Home.jsx`, `Catalog.jsx` | Mayor peso de la página en conexiones móviles. |
| 4 | En el catálogo, el banner está oculto con `display:none` en móvil, pero su `<img>` no tenía `loading="lazy"`: **se descargaba 1,9 MB sin mostrarse**. | `Catalog.jsx` (`.cat-hero__img`, visible solo ≥ 900 px) | Descarga inútil en móvil. |
| 5 | Los textos y botones del hero tardaban ~2–3 s en aparecer en móvil (delays de animación de hasta 2,1 s + 1 s de duración). | `hero.css` | La primera pantalla tardaba en ser útil. |
| 6 | `--section-padding` de 88 px en móvil (120 px desde 768 px). | `styles.css` | Espacios verticales excesivos en teléfono. |
| 7 | CSS muerto: bloque `.hero*` anterior al hero actual (`.cine-hero`), barra de catálogo antigua (`.catalog-toolbar/-bar/-chips/-chip/-filters/-filter-toggle/-meta/-count/-clear/-search__wrap/__input`, `.catalog-section__header`), keyframes `fadeInUp` y dos reglas sueltas. | `styles.css` | Peso y confusión con las reglas vigentes (`.cine-hero*`, `.cat-*`). |
| 8 | Código JS sin uso: import `isValidPrice` en `utils.js`, exports `useTitle`, `perfumeAbsUrl`, `absUrl` y constante `HERO_SLUG`. | `utils.js`, `config.js` | Código huérfano. |

## B. Cambios realizados

**Archivos modificados:** `src/styles.css`, `src/catalog.css`, `src/featured.css`, `src/hero.css`, `src/cart/cart.css`, `src/utils.js`, `src/config.js`, `src/pages/Home.jsx`, `src/pages/Catalog.jsx`, `src/data/imageManifest.js` (regenerado por `scripts/gen-image-manifest.mjs`, el mismo que corre en `predev`/`prebuild`).
**Archivos nuevos:** `public/assets/images/hero/hero-campaign-828.webp`, `hero-campaign.webp`, `hero-campaign-2x.webp`, y este documento.

- **Botones y controles (todas las vistas):** `--radius-btn` 2 px → **8 px**; `--radius-card` 4 px → **6 px**; `--radius-sm` 3 → 4 px; nuevo `--radius-tag` (4 px) para etiquetas informativas pequeñas (insignia de disponibilidad, etiqueta del carrito). Se aplica a botones principales/secundarios, botón del carrito, comprar, selectores de formato, chips de filtro, selector de orden y botón de filtros. El badge numérico del carrito usa 9 px (redondo, por su tamaño de 18 px). Sin píldoras.
- **Buscador del catálogo:** de línea inferior a campo con borde, fondo sutil y radio 8 px; estado `:focus-visible` con borde dorado; 16 px de fuente (evita el zoom de iOS).
- **Estados:** se conservan los `:hover` (solo con puntero fino), `:active` (escala 0,97) y el `*:focus-visible` global dorado ya existentes.
- **"Fragancias destacadas" (solo < 640 px):** se ocultan subtítulo, descripción, contador y los textos bajo las miniaturas (que pasan a ser miniaturas de 64 px); flechas de 40 px; precio y títulos más compactos; el botón de agregar ocupa todo el ancho. Queda: imagen → marca → nombre → precio (con selector de formato) → agregar / ver ficha. **Desde 640 px y en escritorio la presentación no cambia.** Los elementos ocultos siguen en el DOM; la ficha del producto conserva toda la información.
- **Móvil general:** `--section-padding` 88 px → 64 px (el valor de ≥ 768 px no cambia); entrada del hero en ~1 s en lugar de ~3 s (≤ 700 px).
- **Rendimiento:** hero y banner pasan a WebP (calidad 80); el `srcset` del hero añade una variante de 828 px para móviles; el banner del catálogo ahora lleva `loading="lazy"`.
- **Limpieza:** ver sección D.

## C. Justificación

- Los radios se cambiaron en los **tokens**, así que una sola edición mantiene la coherencia en todo el sitio; se evitó llevarlo a píldora para conservar el carácter editorial.
- En móvil, la vitrina prioriza lo que decide una compra (imagen, marca, nombre, precio, acción) y reduce la altura; la información secundaria vive en la ficha.
- Servir WebP y una variante pequeña reduce el peso sin cambiar la imagen; el `lazy` evita una descarga que nunca se veía.
- Retirar CSS/JS sin uso reduce el código que hay que mantener y elimina reglas que parecían activas pero no lo estaban.

## D. Elementos eliminados (todos verificados)

Método: búsqueda de cada clase/identificador en `src/`, `tests/`, `scripts/` e `index.html`, incluyendo construcciones dinámicas (`houses--${variant}`, `adm-modal--${size}`, `adm-status--${...}`).

- `styles.css`: bloque `.hero`, `.hero__grid/__content/__label/__title/__title-dot/__text/__buttons/__visual/__bottle`, `.hero__visual-link`, `.hero__bottle-img` — la portada usa `.cine-hero*` (`hero.css`). `.hero__title-dot` que aún usa `Home.jsx` está estilado desde `hero.css`.
- `styles.css`: `.catalog-toolbar/-bar/-search/-search__wrap/-search__input/-filter-toggle*/-chips/-chip/-filters/-meta/-count/-clear`, `.catalog-section__header*` — el catálogo usa `.cat-*` (`catalog.css`). Referencias residuales en `.catalog-clear .icon` y `.catalog-filters select:focus` también retiradas.
- `styles.css`: `@keyframes fadeInUp` (solo la usaba `.catalog-filters.is-open`) y un comentario huérfano.
- `utils.js`: import `isValidPrice`; exports `useTitle`, `perfumeAbsUrl`, `absUrl`; import `SITE_URL` que quedó sin uso. `config.js`: `HERO_SLUG`. Ninguno aparece en `src/`, `tests/` ni `scripts/`.

## E. Elementos conservados

- `.catalog-section`, `.catalog-search__icon` (el `SearchIcon` de `Icons.jsx` lo usa y `catalog.css` lo sobrescribe), `.catalog-empty*` (estado "sin resultados" de `Catalog.jsx`).
- `.houses--row` y `.houses--grid`: el escáner los marca sin uso, pero `HouseShowcase.jsx` los construye con `houses--${variant}`. Conservados.
- `.adm-modal--*` y `.adm-status--*` (panel admin): construidos dinámicamente.
- Exports que solo usan las pruebas o el propio archivo (`orderStatus.js`, `orders.js`, `cartLogic.js`, `catalogService.js`, `seoData.js`, `notes.js`, `backendConfigCore.js`, `http.js`): no se tocaron; además, carrito, pedido, backend, filtros, rutas, autenticación y fuentes de datos quedaron intactos.
- Los PNG originales del hero y los `hero-campaign*.jpg` (son otra imagen, versión anterior): se conservan en la carpeta; ya no los referencia el código. **Pendiente de decidir por ti** si se borran.
- Sección "Descubre por casa": diseño sin cambios (solo hereda los nuevos radios de tarjeta).
- Dependencias: `react`, `react-dom`, `react-router-dom` se usan; no hay nada que quitar.

## F. Rendimiento

Medido (tamaños de archivo reales):

| Recurso | Antes | Después |
|---------|-------|---------|
| Hero 1672 px | PNG 1.935.520 B | WebP 102.222 B |
| Hero 3344 px | PNG 4.112.026 B | WebP 230.788 B |
| Hero móvil | (no existía) | WebP 828 px: 34.666 B |
| Banner del catálogo en móvil | 1.935.520 B descargados sin verse | 0 B (lazy + oculto) |
| `styles.css` (fuente) | 52.634 B / 834 líneas | 44.414 B / 710 líneas |
| `featured.css` / `hero.css` (fuente) | 8.466 / 7.766 B | 9.699 / 8.316 B (+ reglas móviles) |

Pruebas: `node --test` → 80 de 80 pasan, antes y después.

**No medido:** CSS/JS minificado del build, Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO), LCP/CLS y capturas por ancho. No se incluyen estimaciones.
Observación sin cambios: las fuentes de Google ya usan `preconnect` y `display=swap`.

## G. Verificación pendiente en tu equipo

1. `npm run build` y `npm run preview`.
2. Revisar en 360, 390 y 430 px: portada, "Fragancias destacadas", catálogo (buscador, chips, filtros), ficha, carrito; confirmar que no hay scroll horizontal ni errores de consola.
3. Probar agregar al carrito desde la vitrina con cada formato y desde las tarjetas.
4. Lighthouse móvil de `/` y `/catalogo`, y anotar aquí los resultados reales.
5. Si algún botón pequeño (insignias, etiquetas) se ve mejor con otro radio, se ajusta en `--radius-tag` / `--radius-btn`.

## H. Hallazgos sin tocar (por no poder verificarlos)

- Las tarjetas del catálogo en móvil y el resto de vistas (ficha, carrito, cómo pedir) no se rediseñaron: sin navegador no se pudo evaluar su aspecto real, y se prefirió no tocarlas a ciegas.
- Convertir las fotos de perfumes (`uploads`, 2,1 MB, y marcas) a WebP/AVIF requiere decidir el flujo con `scripts/optimize-images.mjs` y `make-thumbs.mjs`; no se hizo.
