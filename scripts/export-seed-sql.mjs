// Genera supabase/seed/0002_catalog_seed.sql a partir del catálogo REAL (src/data/products.js).
//   node scripts/export-seed-sql.mjs          → escribe el archivo
//   node scripts/export-seed-sql.mjs --check  → falla (código 1) si el archivo no coincide con products.js
// Reglas de seguridad de la migración de datos:
//  · Conserva id, slug, marca, nombre, descripción, precios e imágenes TAL CUAL (no inventa ni cambia precios).
//  · Valida antes de generar (ids/slugs únicos, precios enteros válidos, categorías, rutas de imagen que existen).
//  · Idempotente: `on conflict … do nothing`. Volver a ejecutarlo NUNCA pisa cambios hechos después desde el panel.
//  · No contiene datos de prueba (esos viven en supabase/tests, que se revierten solos).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "supabase", "seed", "0002_catalog_seed.sql");
const { PRODUCTOS } = await import(pathToFileURL(path.join(root, "src", "data", "products.js")).href);
const { NOTAS } = await import(pathToFileURL(path.join(root, "src", "data", "notes.js")).href);

// Rutas antiguas de imagen (uploads/…) → ruta organizada. Mismo mapa que usa la tienda (catalogService.js).
const catalogService = readFileSync(path.join(root, "src", "services", "catalogService.js"), "utf8");
const IMG_ALIAS = Object.fromEntries([...catalogService.matchAll(/"(\/assets\/images\/uploads\/[^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
const img = (p) => (p ? IMG_ALIAS[p] || p : null);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const errors = [];
const ids = new Set(), slugs = new Set(), pendingPhotos = [];

const rows = PRODUCTOS.map((p, index) => {
  const t = `${p.id} ${p.marca} ${p.nombre}`;
  if (!Number.isInteger(p.id) || p.id < 1) errors.push(`id inválido: ${t}`);
  if (ids.has(p.id)) errors.push(`id duplicado: ${t}`); ids.add(p.id);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || "")) errors.push(`slug inválido: ${t} → ${p.slug}`);
  if (slugs.has(p.slug)) errors.push(`slug duplicado: ${t}`); slugs.add(p.slug);
  if (!["Hombre", "Mujer", "Unisex"].includes(p.categoria)) errors.push(`categoría inválida: ${t} → ${p.categoria}`);
  if (!["Disponible", "Preventa", "Agotado"].includes(p.disponibilidad)) errors.push(`disponibilidad inválida: ${t} → ${p.disponibilidad}`);
  if (!/^\d+ ?ml$/.test(p.tamanoFrasco || "")) errors.push(`tamaño de frasco inválido: ${t} → ${p.tamanoFrasco}`);
  const prices = { "5": p.precioDecant5, "10": p.precioDecant10, full: p.precioFrasco };
  for (const [k, v] of Object.entries(prices)) if (!(v === null || (Number.isSafeInteger(v) && v > 0))) errors.push(`precio inválido (${k}): ${t} → ${v}`);
  const all = [...new Set([p.imagen, ...(Array.isArray(p.imagenes) ? p.imagenes : [])].filter(Boolean).map(img))];
  const present = (im) => existsSync(path.join(root, "public", im));
  // La foto principal DEBE existir (error). Las adicionales que aún no se han subido se omiten (se agregan luego desde el panel).
  if (p.imagen && !present(img(p.imagen))) errors.push(`imagen principal inexistente: ${t} → ${img(p.imagen)}`);
  const images = all.filter(present).slice(0, 3);
  const skipped = all.filter((im) => !present(im));
  if (skipped.length) pendingPhotos.push(...skipped);
  return { p, prices, images, notes: p.notas || NOTAS[p.id] || {}, index };
});
if (errors.length) { console.error("No se genera la semilla: hay datos inválidos en products.js\n  ✗ " + errors.join("\n  ✗ ")); process.exit(1); }

const productValues = rows.map(({ p, images, notes, index }) =>
  `  (${p.id}, ${q(p.slug)}, ${q(p.marca)}, ${q(p.nombre)}, ${q(p.descripcion || "")}, ${q(p.tamanoFrasco)}, ${q(p.categoria)}, ` +
  `array[${(p.generos || []).map(q).join(", ")}]::text[], ${q(JSON.stringify(notes))}::jsonb, ${q(JSON.stringify(images))}::jsonb, ` +
  `'published', ${q(p.disponibilidad)}, ${p.destacado === true}, ${index})`).join(",\n");
const presValues = rows.flatMap(({ p, prices }) => ["5", "10", "full"].map((k) => `  (${p.id}, ${q(k)}, true, ${prices[k] === null ? "null" : prices[k]})`)).join(",\n");

const sql = `-- ════════════════════════════════════════════════════════════════════════════════
-- Semilla del catálogo REAL de Select Parfums Colombia (${rows.length} perfumes × 3 presentaciones).
-- GENERADO por scripts/export-seed-sql.mjs desde src/data/products.js — no editar a mano.
-- Idempotente: «on conflict do nothing» → volver a ejecutarlo NO pisa precios ni cambios hechos desde el panel.
-- Presentaciones con precio null = "Consultar" (no se pueden pedir). Todas quedan habilitadas, como en la web actual.
-- ════════════════════════════════════════════════════════════════════════════════
insert into public.products
  (id, slug, brand, name, description, bottle_size, category, genders, notes, images, status, availability, featured, sort_order)
values
${productValues}
on conflict (id) do nothing;

insert into public.product_presentations (product_id, kind, enabled, price_cop)
values
${presValues}
on conflict (product_id, kind) do nothing;

-- La secuencia de ids continúa después del mayor id existente (los perfumes nuevos no chocan con los actuales).
select setval(pg_get_serial_sequence('public.products', 'id'), (select max(id) from public.products));
`;

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== sql) { console.error("La semilla NO coincide con src/data/products.js. Ejecuta: npm run db:seed"); process.exit(1); }
  console.log(`Semilla al día (${rows.length} perfumes).`); process.exit(0);
}
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, sql);
console.log(`[seed] ${path.relative(root, OUT)}: ${rows.length} perfumes, ${rows.length * 3} presentaciones.`);
if (pendingPhotos.length) console.log(`[seed] ${pendingPhotos.length} fotos adicionales referenciadas aún no existen y se omitieron (súbelas luego desde el panel).`);
