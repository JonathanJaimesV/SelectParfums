# SelectParfums — React + Vite


## Comandos
```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera /dist
```

## Dónde cambiar cosas
- **WhatsApp, dominio y perfume de la portada:** `src/config.js` (si cambias el dominio, actualízalo también en `index.html` y `public/robots.txt`)
- **Perfumes y marcas:** `src/data/products.js`
- **Imágenes:** `public/assets/images/<MARCA>/archivo.jpg` y se referencian como `/assets/images/<MARCA>/archivo.jpg`
- **Colores:** variables `:root` en `src/styles.css`

## Estructura
```
src/
  main.jsx · App.jsx (rutas) · config.js · utils.js
  components/  Header, Layout (footer + botón flotante), PageBanner, ProductCard, Reveal, Icons
  pages/       Home, Catalog, Brands, Decants, HowToOrder
  data/        products.js
```

## Publicar en Netlify
Conecta el repo (o sube la carpeta): `netlify.toml` ya trae build `npm run build`, carpeta `dist` y la regla SPA para `/catalogo`, `/marcas`, etc.

## SEO
- `src/seo.js` aplica título, descripción, canonical, Open Graph y datos estructurados (Product/Offer, solo con precios reales) por ruta.
- `npm run build` ahora ejecuta `scripts/postbuild.mjs`, que genera `dist/sitemap.xml` desde `src/data/products.js`.
- Para elegir los destacados del inicio, agrega `"destacado": true` a un perfume en `products.js` (si ninguno lo tiene, se usan los primeros con foto que no estén agotados).

## Pendiente de confirmar por el propietario
- Dominio definitivo (`selectparfumscol.netlify.app` vs `selectparfums.netlify.app`, que era el que figuraba en `index.html`).
- Textos que afirman autenticidad/originalidad de los perfumes y "pago seguro": confirmar que se pueden sustentar.
- Política de envíos, cambios y devoluciones, términos, tratamiento de datos y datos del vendedor (razón social/NIT): hoy el sitio no los publica.
- Plazos y significado de "Preventa" (tiempo estimado de entrega).
- Fotos adicionales: `*-2.jpg` y `*-3.jpg` referenciadas en `products.js` no existen; la ficha solo muestra las fotos que sí existen.

## Carrito y pedido por WhatsApp
- **Cómo funciona:** el cliente elige perfume + presentación (decant 5 ml, decant 10 ml o frasco), la agrega desde la tarjeta o la ficha (con cantidad), revisa en `/carrito` y pulsa **Finalizar pedido por WhatsApp**, que abre `wa.me` con el mensaje armado. No hay pasarela de pago: el pedido no está confirmado hasta que el vendedor responde.
- **Precios por presentación:** se configuran en `src/data/products.js` (o desde el panel admin): `precioDecant5`, `precioDecant10`, `precioFrasco` (COP, enteros). `null` = "Consultar": esa presentación **no** se puede agregar. No se calcula ningún precio a partir de otro.
- **Número de WhatsApp:** `src/config.js` (`WHATSAPP_NUMBER`, formato `57` + 10 dígitos, sin signos) o la variable pública `VITE_WHATSAPP_NUMBER` en Netlify. Si es inválido, el checkout se desactiva y avisa; no se genera ningún enlace.
- **Persistencia:** `localStorage` (`selectparfums:cart:v1`) guarda solo `{id, size, qty}`; nombres y precios se leen siempre del catálogo vigente. Datos corruptos/antiguos se descartan con aviso; perfumes borrados se quitan avisando; agotados o sin precio quedan marcados y bloquean el checkout hasta quitarlos.
- **Código:** lógica pura en `src/cart/cartLogic.js` y `src/pricing.js` (probada con `npm test`); estado en `src/cart/CartContext.jsx`; UI en `src/cart/*` y `src/pages/Cart.jsx`.
- **Límite de seguridad:** al ser 100 % frontend, los totales calculados en el navegador **no** son una validación comercial; el vendedor confirma disponibilidad y valor final.
- **Pruebas:** `npm test` (Node ≥ 20, sin dependencias extra).
- **Fotos adicionales del carrusel:** junto a la foto principal agrega `-2` y `-3` (ej. `lattafa-khamrah.jpg` → `lattafa-khamrah-2.jpg`, `lattafa-khamrah-3.jpg`) y haz build. `npm run images:optimize` (requiere `npm i -D sharp`) reduce su peso.

## Notas de despliegue (Netlify)
- `netlify.toml` fija `NODE_VERSION = "22"`; el build ejecuta `prebuild` (manifiesto de imágenes) → `vite build` → `postbuild` (sitemap). Revisa en el log: `[manifest] N imágenes` y `[postbuild] OK`.
- Si defines `VITE_WHATSAPP_NUMBER` en Netlify, el build sincroniza también el enlace del `<noscript>`.
- Las rutas de imágenes distinguen mayúsculas/minúsculas en Netlify (Linux): copia los nombres exactos de `products.js`.

## Seguridad
- `netlify.toml` define CSP (scripts solo propios, sin inline), `X-Frame-Options`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`. **Si agregas analítica, chat, mapas u otro servicio externo, añade su dominio a la CSP** o el navegador lo bloqueará. `npm test` verifica que la CSP siga permitiendo las fuentes de Google que carga `index.html`.
- `.gitignore` excluye `.env*`, logs y archivos del sistema. Las variables `VITE_*` son **públicas** (quedan en el JavaScript): nunca pongas claves o contraseñas ahí. `VITE_ADMIN_PIN` no protege nada real; el panel admin solo existe si compilas con `VITE_ENABLE_ADMIN=true` y solo edita datos locales.
- El carrito y el mensaje de WhatsApp se calculan en el navegador: el cliente podría alterar su propio mensaje. **El vendedor debe confirmar siempre productos, precios y disponibilidad** antes de aceptar un pedido.
- Dependencias: ejecuta `npm audit` (requiere internet) y activa Dependabot en GitHub; en esta auditoría no se pudo verificar.

## Rendimiento y fotos
- Orden recomendado al agregar fotos: `npm run images:optimize` (reduce y limita a 1200 px) → `npm run images:thumbs` (crea `-card.jpg` para tarjetas y `-800.jpg` para móviles) → `npm run build`. Ambos scripts requieren `npm i -D sharp` una vez. Si no generas las variantes, el sitio usa la foto original (nunca queda rota).
- Las tarjetas usan un recorte 4:5; si cambias esa proporción en `styles.css`, ajusta `W`/`H` en `scripts/make-thumbs.mjs` y regenera.

## Pruebas (`npm test`, sin dependencias extra)
Cubren: precios por presentación, carrito (cantidades, persistencia, datos corruptos, productos borrados/agotados), mensaje de WhatsApp y su codificación, integridad del catálogo (ids, slugs, precios, imágenes), búsqueda/filtros/orden, configuración de Netlify/CSP/robots/sitemap y el generador de HTML por ruta (incluido contra datos maliciosos).

## Vista previa al compartir (opcional, recomendado)
Hoy los enlaces de producto compartidos por WhatsApp/Facebook muestran la tarjeta genérica de la tienda, porque esos rastreadores no ejecutan JavaScript. Para que cada perfume muestre su nombre, foto y precio:
1. En Netlify → *Site configuration → Environment variables* agrega `PRERENDER_META=1` y despliega primero en una **vista previa de despliegue** (Deploy Preview).
2. Verifica: `curl -s https://<preview>/perfume/asad | grep -o '<title>[^<]*'` debe mostrar el nombre del perfume, y `curl -sI https://<preview>/perfume/asad` debe responder `200` (no `301`/`404`). Prueba también `/catalogo` y una ficha desde el navegador.
3. Si todo está bien, actívalo en producción. Si algo falla, borra la variable: vuelve a la SPA de siempre.

## Analítica (no instalada; recomendación)
No hay analítica. Para un negocio de este tamaño conviene una herramienta sin cookies (Plausible, Umami o similar) con eventos proporcionales: `ver_producto`, `buscar`, `elegir_presentacion`, `agregar_al_pedido`, `abrir_whatsapp_pedido` (equivale a "inicio de checkout", **no** a pedido confirmado) y `clic_contacto`. Un pedido solo debe contarse como "confirmado" cuando el vendedor lo confirme (p. ej. registrándolo a mano). Evita enviar nombres de clientes o el contenido del mensaje. Recuerda ajustar la CSP al agregarla.

## Fase 2 — Backend, pedidos y administración (en curso)
Guía completa en **`docs/ADMIN-SETUP.md`**. Resumen del estado: migración SQL, políticas RLS, semilla del catálogo, cliente de pedidos y checkout con registro de pedido **implementados**; **la migración todavía no se ha ejecutado contra un PostgreSQL real** (hazlo con `npm run test:sql` en un proyecto de PRUEBAS); el panel `/admin` y el catálogo vivo **aún no existen**. Sin variables `VITE_SUPABASE_*` la tienda funciona como siempre. Variables: ver `.env.example` (⛔ nunca la clave `service_role`).
