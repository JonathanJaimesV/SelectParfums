// Reduce el peso de las fotos de producto SIN cambiar sus nombres ni rutas.
// Uso:  npm i -D sharp   (una sola vez)   →   npm run images:optimize
// Redimensiona a 1200 px de ancho máx. y recomprime JPG (calidad 80). Solo sobrescribe si el resultado pesa menos.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

let sharp;
try { sharp = (await import("sharp")).default; }
catch { console.error("Falta 'sharp'. Instálalo con:  npm i -D sharp"); process.exit(1); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "public", "assets", "images");
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name.startsWith("icons") ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);

let before = 0, after = 0, n = 0;
for (const f of walk(base)) {
  if (!/\.jpe?g$/i.test(f)) continue;
  const buf = readFileSync(f); before += buf.length;
  const out = await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();
  if (out.length < buf.length * 0.95) { writeFileSync(f, out); after += out.length; n++; } else after += buf.length;
}
console.log(`[optimize] ${n} imágenes reducidas: ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
