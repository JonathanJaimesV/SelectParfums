// Genera variantes ligeras de cada foto de producto:
//   <foto>-card.jpg → 520×650, recorte 4:5 centrado (~35 KB), para las tarjetas del catálogo y del carrito.
//   <foto>-800.jpg  → 800 px de ancho, misma proporción (~40 KB), para móviles en el hero y la ficha (srcset).
// Las tarjetas usan object-fit: cover con proporción 4/5, así que la miniatura es el MISMO recorte que ya se veía,
// pero pesa ~60 % menos (el catálogo en móvil descarga 19 imágenes). La ficha del perfume sigue usando la foto completa.
// Uso:  npm i -D sharp   (una sola vez)   →   npm run images:thumbs   (después de agregar o cambiar fotos)
// Si CAMBIAS la proporción de las tarjetas en styles.css (.product-card__media aspect-ratio), ajusta W/H aquí y regenera.
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

let sharp;
try { sharp = (await import(process.env.SHARP_PATH || "sharp")).default; }
catch { console.error("Falta 'sharp'. Instálalo con:  npm i -D sharp"); process.exit(1); }

const W = 520, H = 650, VERT = 0.55; // VERT = object-position vertical del CSS (50% 55%)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "public", "assets", "images");
const skipDir = (n) => n === "notes" || n.startsWith("icons");
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (skipDir(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);

let made = 0, kept = 0, bytes = 0;
for (const f of walk(base)) {
  if (!/\.jpe?g$/i.test(f) || /-(card|800)\.jpe?g$/i.test(f) || /og-cover/i.test(f)) continue;
  const out = f.replace(/\.jpe?g$/i, "-card.jpg"), out800 = f.replace(/\.jpe?g$/i, "-800.jpg");
  if (existsSync(out) && existsSync(out800) && statSync(out).mtimeMs >= statSync(f).mtimeMs && statSync(out800).mtimeMs >= statSync(f).mtimeMs) { kept++; continue; }
  const img = sharp(f); const { width, height } = await img.metadata();
  if (width > 800) { const b8 = await sharp(f).resize({ width: 800 }).jpeg({ quality: 76, mozjpeg: true, progressive: true }).toBuffer(); writeFileSync(out800, b8); bytes += b8.length; }
  // mismo recorte que object-fit: cover con object-position 50% 55%
  let cw = width, ch = Math.round(width * H / W);
  if (ch > height) { ch = height; cw = Math.round(height * W / H); }
  const left = Math.round((width - cw) / 2), top = Math.round((height - ch) * VERT);
  const buf = await img.extract({ left, top, width: cw, height: ch }).resize(W, H).jpeg({ quality: 74, mozjpeg: true, progressive: true }).toBuffer();
  writeFileSync(out, buf); made++; bytes += buf.length;
}
console.log(`[thumbs] ${made} fotos procesadas (card + 800) (${(bytes / 1024).toFixed(0)} KB), ${kept} ya estaban al día`);
