# Panel de administración — SelectParfums

## Cómo usarlo
1. Copia el contenido de esta carpeta (`src/…`) encima de tu proyecto (reemplaza los 6 archivos existentes y agrega los nuevos).
2. `npm run dev` → abre **http://localhost:5173/admin**
3. Crea / edita / cambia estado / elimina. En tu navegador la tienda ya muestra los cambios.
4. Para publicar: **Exportar products.js** → reemplaza `src/data/products.js`.
   Si subiste imágenes desde el panel, se descargan también; guárdalas en `public/assets/images/uploads/`.
5. `git push` → Netlify redespliega. Luego pulsa **Descartar cambios** en el panel para volver a leer del código.

## Seguridad (importante)
- Por defecto `/admin` **solo existe en `npm run dev`**; el build de producción NO incluye el panel.
- Si lo quieres también online: variable en Netlify `VITE_ENABLE_ADMIN=true` y, opcionalmente, `VITE_ADMIN_PIN=tu-pin`.
  Es un sitio estático: el PIN queda dentro del JavaScript, así que frena curiosos pero no es seguridad real.

## Limitación
Sin backend, los cambios viven en el localStorage del navegador del admin; los visitantes solo ven lo desplegado.
Para editar desde cualquier dispositivo y que se vea al instante, hay que migrar `catalogService.js` a Supabase/Firebase
(es el único archivo que habla con el almacenamiento).

## Archivos
Nuevos: `services/catalogService.js`, `context/CatalogContext.jsx`, `admin/{AdminPage,AdminGate,ProductTable,ProductAdminForm,BrandModal,DeleteConfirmModal,Modal,NoteMultiSelect,ImageManager}.jsx`, `admin/admin.css`
Modificados: `main.jsx`, `App.jsx`, `pages/{Catalog,PerfumeDetail,Brands,Home}.jsx` (leen de `useCatalog()` en vez de importar `products.js`)
