# SelectParfums — React + Vite


## Comandos
```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera /dist
```

## Dónde cambiar cosas
- **WhatsApp:** `src/config.js`
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
