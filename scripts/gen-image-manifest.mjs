// Lista las imágenes reales de public/assets/images en src/data/imageManifest.js.
// El carrusel usa esa lista para mostrar solo las fotos que existen (sin pedir archivos inexistentes).
// Corre solo antes de `npm run dev` y `npm run build` (hooks predev/prebuild).
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "public", "assets", "images");
const IMG = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name.startsWith("icons-svg") ? [] : walk(full);
    return IMG.test(e.name) ? [full] : [];
  });

const files = existsSync(base)
  ? walk(base).map((f) => "/assets/images/" + path.relative(base, f).split(path.sep).join("/")).sort()
  : [];
const body = `// GENERADO por scripts/gen-image-manifest.mjs — no editar a mano.\nexport const IMAGE_MANIFEST = new Set(${JSON.stringify(files, null, 2)});\n`;
writeFileSync(path.join(root, "src", "data", "imageManifest.js"), body);
console.log(`[manifest] ${files.length} imágenes registradas`);
