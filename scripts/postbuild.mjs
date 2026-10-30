// Genera dist/sitemap.xml a partir del catálogo real (src/data/products.js).
// Funciona en Windows, macOS y Linux. Si falla NO rompe el despliegue, pero lo dice en voz alta.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SITE_URL = process.env.SITE_URL || "https://selectparfumscol.netlify.app"; // mantener igual que src/config.js
const root = process.env.PROJECT_ROOT ? path.resolve(process.env.PROJECT_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // PROJECT_ROOT: solo para pruebas (new URL().pathname rompe en Windows)
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, "dist"); // DIST_DIR: solo para pruebas

const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


/* ───────── HTML por ruta (OPCIONAL: PRERENDER_META=1) ─────────
   Los rastreadores de redes sociales (WhatsApp, Facebook, X) NO ejecutan JavaScript: sin esto, cualquier enlace de
   producto compartido muestra la tarjeta genérica de la tienda. Con PRERENDER_META=1 se generan archivos
   dist/perfume/<slug>.html (y catalogo.html, marcas.html, ...) = el index.html con título, descripción, Open Graph,
   canonical y JSON-LD propios de cada ruta, más reglas "200!" en dist/_redirects que los sirven en la URL normal.
   La app sigue siendo la misma (se carga y toma el control). Si algo falla se omite todo y queda la SPA de siempre. */
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const count = (h, re) => (h.match(re) || []).length;

function withHead(base, { title, description, path: route, image, jsonLd }, siteUrl) {
  const url = siteUrl + (route === "/" ? "" : route);
  const img = image ? (/^https?:/.test(image) ? image : siteUrl + image) : `${siteUrl}/assets/images/og-cover.jpg`;
  let h = base.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  let add = "";
  for (const [attr, key, val] of [["name", "description", description], ["property", "og:title", title], ["property", "og:description", description], ["property", "og:url", url], ["property", "og:image", img], ["name", "twitter:title", title], ["name", "twitter:description", description], ["name", "twitter:image", img], ["name", "robots", "index, follow"]]) {
    const re = new RegExp(`<meta ${attr}="${key}"[^>]*>`);
    const tag = `<meta ${attr}="${key}" content="${esc(val)}" />`;
    if (re.test(h)) h = h.replace(re, tag); else add += `  ${tag}\n`;
  }
  add += `  <link rel="canonical" href="${esc(url)}" />\n`;
  if (jsonLd) add += `  <script type="application/ld+json" data-seo="static">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n`;
  h = h.replace("</head>", add + "</head>");
  // sanidad: nada duplicado
  for (const re of [/<title>/g, /name="description"/g, /property="og:title"/g, /property="og:image"/g, /rel="canonical"/g]) if (count(h, re) !== 1) throw new Error(`HTML por ruta inválido (duplicado: ${re})`);
  return h;
}

async function prerender(PRODUCTOS, urls) {
  const { STATIC_SEO, productSeo, slugOf } = await import(pathToFileURL(path.join(root, "src", "seoData.js")).href);
  const base = readFileSync(path.join(dist, "index.html"), "utf8");
  const rules = [];
  const emit = (route, file, seo) => {
    const out = path.join(dist, file);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, withHead(base, seo, SITE_URL));
    rules.push(`${route} /${file.split(path.sep).join("/")} 200!`);
  };
  for (const [route, seo] of Object.entries(STATIC_SEO)) if (route !== "/") emit(route, `${route.slice(1)}.html`, seo);
  for (const p of PRODUCTOS) emit(`/perfume/${slugOf(p)}`, `perfume/${slugOf(p)}.html`, productSeo(p, SITE_URL));
  writeFileSync(path.join(dist, "_redirects"), `# Generado por scripts/postbuild.mjs (PRERENDER_META=1). La regla SPA general sigue en netlify.toml.\n${rules.join("\n")}\n`);
  console.log(`[postbuild] HTML por ruta: ${rules.length} páginas + dist/_redirects`);
}

try {
  if (!existsSync(dist)) throw new Error(`no existe ${dist} (¿corrió vite build?)`);
  const { PRODUCTOS } = await import(pathToFileURL(path.join(root, "src", "data", "products.js")).href);
  const staticRoutes = ["/", "/catalogo", "/marcas", "/decants", "/como-pedir"];
  const productRoutes = PRODUCTOS.map((p) => `/perfume/${p.slug || slugify(p.nombre)}`);
  const urls = [...staticRoutes, ...productRoutes];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE_URL}${u === "/" ? "" : u}</loc></url>`).join("\n") + `\n</urlset>\n`;
  writeFileSync(path.join(dist, "sitemap.xml"), xml);
  console.log(`[postbuild] OK: dist/sitemap.xml con ${urls.length} URLs`);

  // El <noscript> de index.html trae el número por defecto; si en Netlify se define VITE_WHATSAPP_NUMBER, se sincroniza aquí.
  const envNumber = String(process.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (envNumber) {
    const file = path.join(dist, "index.html");
    const html = readFileSync(file, "utf8");
    const next = html.replace(/wa\.me\/\d+/g, `wa.me/${envNumber}`);
    writeFileSync(file, next);
    console.log(`[postbuild] noscript: número de WhatsApp sincronizado con VITE_WHATSAPP_NUMBER`);
  }

  if (process.env.PRERENDER_META === "1") {
    try { await prerender(PRODUCTOS, urls); }
    catch (e) { console.error("[postbuild] ⚠ HTML por ruta omitido (la tienda funciona igual):", e.message); }
  }
} catch (e) {
  console.error("\n[postbuild] ⚠ NO se generó sitemap.xml:", e.message);
  console.error("[postbuild]   Se publicará el public/sitemap.xml estático (puede estar desactualizado).\n");
}
