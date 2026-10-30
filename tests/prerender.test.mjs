// HTML por ruta opcional (PRERENDER_META=1) y sitemap: se ejecuta scripts/postbuild.mjs de verdad sobre un dist temporal.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTOS } from "../src/data/products.js";
import { productSeo, STATIC_SEO } from "../src/seoData.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://selectparfumscol.netlify.app";
function build(env = {}) {
  const dist = mkdtempSync(path.join(tmpdir(), "sp-dist-"));
  copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
  const out = execFileSync(process.execPath, [path.join(root, "scripts", "postbuild.mjs")], { env: { ...process.env, DIST_DIR: dist, PRERENDER_META: "", VITE_WHATSAPP_NUMBER: "", ...env }, encoding: "utf8" });
  return { dist, out };
}
const read = (dist, f) => readFileSync(path.join(dist, f), "utf8");
const n = (h, re) => (h.match(re) || []).length;

test("por defecto (sin PRERENDER_META): solo sitemap; no se generan HTML por ruta ni _redirects", () => {
  const { dist, out } = build();
  assert.match(out, /sitemap\.xml con 24 URLs/);
  assert.ok(existsSync(path.join(dist, "sitemap.xml")));
  assert.ok(!existsSync(path.join(dist, "perfume")) && !existsSync(path.join(dist, "_redirects")));
  const sm = read(dist, "sitemap.xml");
  assert.equal(n(sm, /<loc>/g), 5 + PRODUCTOS.length);
  assert.ok(sm.includes(`<loc>${SITE}</loc>`) && sm.includes(`<loc>${SITE}/catalogo</loc>`));
});

test("PRERENDER_META=1: una página por perfume y por ruta estática, con reglas 200! en _redirects", () => {
  const { dist } = build({ PRERENDER_META: "1" });
  for (const p of PRODUCTOS) assert.ok(existsSync(path.join(dist, "perfume", `${p.slug}.html`)), p.slug);
  for (const r of Object.keys(STATIC_SEO).filter((x) => x !== "/")) assert.ok(existsSync(path.join(dist, `${r.slice(1)}.html`)), r);
  const rules = read(dist, "_redirects").split("\n").filter((l) => l && !l.startsWith("#"));
  assert.equal(rules.length, PRODUCTOS.length + 4);
  for (const l of rules) assert.match(l, /^\/[a-z0-9\-\/]+ \/[a-z0-9\-\/]+\.html 200!$/);
  assert.ok(rules.includes(`/perfume/${PRODUCTOS[0].slug} /perfume/${PRODUCTOS[0].slug}.html 200!`));
  assert.ok(!rules.some((l) => /carrito|admin/.test(l)), "carrito/admin no se prerrenderizan");
});

test("cada HTML de producto: metadatos propios, sin duplicados, canonical = og:url, JSON-LD válido y coherente con el catálogo", () => {
  const { dist } = build({ PRERENDER_META: "1" });
  for (const p of PRODUCTOS) {
    const h = read(dist, `perfume/${p.slug}.html`); const seo = productSeo(p, SITE);
    for (const re of [/<title>/g, /name="description"/g, /property="og:title"/g, /property="og:description"/g, /property="og:image"/g, /rel="canonical"/g, /property="og:url"/g]) assert.equal(n(h, re), 1, `${p.slug} ${re}`);
    assert.ok(h.includes(`<title>${p.marca} ${p.nombre} — frasco y decants`), `${p.slug} título`);
    const og = h.match(/property="og:url" content="([^"]+)"/)[1]; const can = h.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(og, `${SITE}/perfume/${p.slug}`); assert.equal(can, og);
    const img = h.match(/property="og:image" content="([^"]+)"/)[1];
    assert.ok(img.startsWith(`${SITE}/assets/images/`), `${p.slug} og:image absoluta: ${img}`);
    const ld = JSON.parse(h.match(/<script type="application\/ld\+json" data-seo="static">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(ld, JSON.parse(JSON.stringify(seo.jsonLd)));
    assert.equal(ld["@type"], "Product"); assert.ok(!("aggregateRating" in ld) && !("review" in ld));
    assert.ok(h.includes('id="root"') && h.includes("/src/main.jsx"), "conserva el arranque de la app");
  }
  const t = new Set(PRODUCTOS.map((p) => read(dist, `perfume/${p.slug}.html`).match(/<title>([^<]+)/)[1])); assert.equal(t.size, PRODUCTOS.length, "títulos únicos");
});

test("datos HOSTILES en el catálogo (comillas, </title>, <script>) no inyectan HTML ni rompen el JSON-LD", () => {
  const proj = mkdtempSync(path.join(tmpdir(), "sp-proj-")); cpSync(path.join(root, "src"), path.join(proj, "src"), { recursive: true });
  const evil = { id: 1, slug: "xss", marca: 'Mar"ca<b>', nombre: 'Nom</title><script>alert(1)</script>', descripcion: 'Desc "x" & <img src=x onerror=alert(1)> </script><script>alert(2)</script> fin',
    tamanoFrasco: "100 ml", precioDecant5: 20000, precioDecant10: 30000, precioFrasco: 200000, disponibilidad: "Preventa", imagen: "/assets/images/x.jpg", categoria: "Unisex", generos: ["Unisex"] };
  writeFileSync(path.join(proj, "src", "data", "products.js"), `export const PRODUCTOS = ${JSON.stringify([evil])};\n`);
  const dist = mkdtempSync(path.join(tmpdir(), "sp-dist-")); copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
  execFileSync(process.execPath, [path.join(root, "scripts", "postbuild.mjs")], { env: { ...process.env, PROJECT_ROOT: proj, DIST_DIR: dist, PRERENDER_META: "1", VITE_WHATSAPP_NUMBER: "" }, encoding: "utf8" });
  const h = read(dist, "perfume/xss.html");
  assert.equal(n(h, /<title>/g), 1, "un solo <title>");
  assert.equal(n(h, /<script>alert/g), 0, "ningún <script> inyectado");
  assert.equal(n(h, /<img src=x/g), 0, "ninguna etiqueta inyectada");
  assert.ok(h.includes("&lt;") && h.includes("&quot;") && h.includes("&amp;"), "se escapa < \" &");
  const desc = h.match(/<meta name="description" content="([^"]*)"/)[1];                         // el atributo no se rompe con comillas
  assert.ok(desc.includes("&quot;x&quot;") && !desc.includes("<"));
  const body = h.match(/data-seo="static">([\s\S]*?)<\/script>/)[1];
  assert.ok(!body.includes("</"), "el JSON-LD no puede cerrar el <script>");
  const ld = JSON.parse(body);                                                                   // y sigue siendo JSON válido con el dato ORIGINAL
  assert.equal(ld.name, 'Mar"ca<b> Nom</title><script>alert(1)</script>');
  assert.ok(ld.description.includes("</script><script>alert(2)</script>"));
});

test("el número de WhatsApp de VITE_WHATSAPP_NUMBER también llega al <noscript> de las páginas generadas", () => {
  const { dist } = build({ PRERENDER_META: "1", VITE_WHATSAPP_NUMBER: "573009998877" });
  assert.match(read(dist, "index.html"), /wa\.me\/573009998877/);
  assert.match(read(dist, "perfume/asad.html"), /wa\.me\/573009998877/);
  assert.doesNotMatch(read(dist, "perfume/asad.html"), /wa\.me\/573156504121/);
});

test("el catálogo de rutas del sitemap incluye todos los perfumes y ninguna ruta privada", () => {
  const { dist } = build();
  const sm = read(dist, "sitemap.xml");
  for (const p of PRODUCTOS) assert.ok(sm.includes(`/perfume/${p.slug}</loc>`));
  assert.doesNotMatch(sm, /carrito|admin/);
});
