// Integridad del catálogo + búsqueda/filtros/orden.  npm test
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTOS } from "../src/data/products.js";
import { sizeOptions, isValidPrice, isSoldOut, formatCOP, formatPrice, defaultSizeKey, presentationName } from "../src/pricing.js";
import { normalize, matchesQuery, entryPrice, filterProducts, SORTS, AVAILABILITY } from "../src/catalogQuery.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (p) => path.join(root, "public", p);
const label = (p) => `${p.id} ${p.marca} ${p.nombre}`;

/* ───────── Integridad de datos ───────── */
test("ids y slugs únicos; slugs aptos para URL", () => {
  assert.equal(new Set(PRODUCTOS.map((p) => p.id)).size, PRODUCTOS.length, "ids duplicados");
  assert.equal(new Set(PRODUCTOS.map((p) => p.slug)).size, PRODUCTOS.length, "slugs duplicados");
  for (const p of PRODUCTOS) assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, label(p));
});

test("no hay perfumes duplicados por marca + nombre", () => {
  const key = (p) => normalize(p.marca + p.nombre).replace(/[^a-z0-9]/g, "");
  assert.equal(new Set(PRODUCTOS.map(key)).size, PRODUCTOS.length);
});

test("disponibilidad definida y válida en todos los productos", () => {
  for (const p of PRODUCTOS) assert.ok(AVAILABILITY.includes(p.disponibilidad), `${label(p)} → ${p.disponibilidad}`);
});

test("precios: enteros COP válidos o null (Consultar); nunca 0, negativos, texto o undefined", () => {
  for (const p of PRODUCTOS) for (const k of ["precioDecant5", "precioDecant10", "precioFrasco"]) {
    const v = p[k];
    assert.ok(v === null || (Number.isSafeInteger(v) && v >= 1000), `${label(p)} ${k}=${v}`);
  }
});

test("precios coherentes: decant 5 < decant 10 < frasco cuando existen", () => {
  for (const p of PRODUCTOS) {
    const [a, b, c] = [p.precioDecant5, p.precioDecant10, p.precioFrasco];
    if (a && b) assert.ok(a < b, `${label(p)}: 5 ml ≥ 10 ml`);
    if (b && c) assert.ok(b < c, `${label(p)}: 10 ml ≥ frasco`);
    if (a && c) assert.ok(a < c, `${label(p)}: 5 ml ≥ frasco`);
  }
});

test("todo producto no agotado tiene al menos un precio y una imagen que existe", () => {
  for (const p of PRODUCTOS.filter((x) => !isSoldOut(x))) {
    assert.ok(sizeOptions(p).some((o) => isValidPrice(o.price)), `${label(p)} sin ningún precio`);
    assert.ok(p.imagen, `${label(p)} sin imagen`);
    assert.ok(existsSync(pub(p.imagen)), `${label(p)}: no existe ${p.imagen}`);
  }
});

test("tamaño de frasco y descripción presentes", () => {
  for (const p of PRODUCTOS) {
    assert.match(p.tamanoFrasco, /^\d+ ?ml$/i, label(p));
    assert.ok(p.descripcion && p.descripcion.length >= 30, `${label(p)} descripción ausente/corta`);
    assert.ok(["Hombre", "Mujer", "Unisex"].includes(p.categoria), `${label(p)} categoría ${p.categoria}`);
  }
});

test("tarjeta y detalle usan la MISMA fuente de presentaciones y precios (sizeOptions)", () => {
  for (const p of PRODUCTOS) {
    const o = sizeOptions(p);
    assert.deepEqual(o.map((x) => x.key), ["5", "10", "full"], label(p));
    assert.equal(o[0].price ?? null, p.precioDecant5 ?? null);
    assert.equal(o[1].price ?? null, p.precioDecant10 ?? null);
    assert.equal(o[2].price ?? null, p.precioFrasco ?? null);
    assert.ok(o.some((x) => x.key === defaultSizeKey(p)), `${label(p)}: presentación por defecto inexistente`);
    assert.match(presentationName(p, "full"), /^Frasco completo/);
  }
});

test("formato COP", () => {
  assert.equal(formatCOP(1234567), "1.234.567");
  assert.equal(formatPrice(190000), "$190.000");
  assert.equal(formatPrice(null), "Consultar");
  assert.equal(formatPrice(0), "Consultar");
  assert.equal(formatPrice(-5), "Consultar");
  assert.equal(formatPrice("190000"), "Consultar");
  assert.equal(formatPrice(NaN), "Consultar");
});

test("el manifiesto de imágenes coincide con los archivos reales (si no, corre `npm run dev/build`)", async () => {
  const { IMAGE_MANIFEST } = await import("../src/data/imageManifest.js");
  const base = pub("assets/images");
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name.startsWith("icons-svg") ? [] : walk(path.join(d, e.name))) : /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(e.name) ? [path.join(d, e.name)] : []);
  const real = new Set(walk(base).map((f) => "/assets/images/" + path.relative(base, f).split(path.sep).join("/")));
  assert.deepEqual([...IMAGE_MANIFEST].sort(), [...real].sort());
});

test("las variantes -card/-800 siempre tienen foto original (sin huérfanas)", async () => {
  const { IMAGE_MANIFEST } = await import("../src/data/imageManifest.js");
  for (const f of IMAGE_MANIFEST) if (/-(card|800)\.jpg$/.test(f)) assert.ok(IMAGE_MANIFEST.has(f.replace(/-(card|800)\.jpg$/, ".jpg")) || IMAGE_MANIFEST.has(f.replace(/-(card|800)\.jpg$/, ".jpeg")), `huérfana: ${f}`);
});

/* ───────── Búsqueda ───────── */
const find = (q, extra) => filterProducts(PRODUCTOS, { search: q, ...extra }).map((p) => p.slug);

test("búsqueda: ignora mayúsculas y acentos", () => {
  assert.deepEqual(find("KHAMRAH"), find("khamrah"));
  assert.equal(normalize("  ÁMBAR Vainilla "), "ambar vainilla");
  assert.ok(find("ambar").length >= find("ÁMBAR").length && find("ambar").length > 0);
});
test("búsqueda por marca, por nombre y por varias palabras (en cualquier orden)", () => {
  const lattafa = PRODUCTOS.filter((p) => p.marca === "Lattafa").map((p) => p.slug);
  assert.ok(lattafa.length > 0 && lattafa.every((s) => find("lattafa").includes(s)), "buscar la marca devuelve todos sus perfumes");
  assert.ok(find("lattafa khamrah").includes("khamrah"));
  assert.deepEqual(find("khamrah lattafa"), find("lattafa khamrah"));
  assert.equal(find("lattafa 9pm").length, 0);
});
test("búsqueda: vacía devuelve todo; sin coincidencias devuelve vacío; tolera campos ausentes", () => {
  assert.equal(find("").length, PRODUCTOS.length);
  assert.equal(find("   ").length, PRODUCTOS.length);
  assert.equal(find("zzzzzz").length, 0);
  assert.equal(matchesQuery({ nombre: "X", marca: "Y" }, "x"), true);
  assert.equal(matchesQuery({}, "x"), false);
});
test("búsqueda no interpreta HTML ni regex (caracteres especiales)", () => {
  for (const q of ["<script>", ".*", "(", "[a-z]", "\\", "%00", "'; DROP TABLE"]) assert.doesNotThrow(() => find(q));
  assert.equal(find(".*").length, 0);
});

/* ───────── Filtros y orden ───────── */
test("filtros por categoría, marca y disponibilidad se combinan", () => {
  const h = filterProducts(PRODUCTOS, { cat: "Hombre" }); assert.ok(h.length && h.every((p) => p.categoria === "Hombre"));
  const a = filterProducts(PRODUCTOS, { brand: "Armaf" }); assert.ok(a.length && a.every((p) => p.marca === "Armaf"));
  const both = filterProducts(PRODUCTOS, { cat: "Hombre", brand: "Armaf" }); assert.ok(both.every((p) => p.categoria === "Hombre" && p.marca === "Armaf"));
  assert.ok(both.length <= Math.min(h.length, a.length));
  const sold = filterProducts(PRODUCTOS, { availability: "Agotado" }); assert.ok(sold.length >= 1 && sold.every(isSoldOut));
  assert.equal(filterProducts(PRODUCTOS, { cat: "Mujer", brand: "Lattafa", availability: "Agotado", search: "zzz" }).length, 0);
});
test("orden por defecto: agotados al final y orden relativo estable", () => {
  const r = filterProducts(PRODUCTOS, {}); const firstSold = r.findIndex(isSoldOut);
  assert.ok(firstSold === -1 || r.slice(firstSold).every(isSoldOut));
  const live = PRODUCTOS.filter((p) => !isSoldOut(p)).map((p) => p.id);
  assert.deepEqual(r.filter((p) => !isSoldOut(p)).map((p) => p.id), live);
});
test("orden por precio: ascendente/descendente por precio de entrada; 'Consultar' al final", () => {
  const asc = filterProducts(PRODUCTOS, { sort: "price-asc" }).map(entryPrice);
  const valid = asc.filter((v) => v !== null);
  assert.deepEqual(valid, [...valid].sort((x, y) => x - y));
  assert.ok(asc.slice(valid.length).every((v) => v === null));
  const desc = filterProducts(PRODUCTOS, { sort: "price-desc" }).map(entryPrice).filter((v) => v !== null);
  assert.deepEqual(desc, [...desc].sort((x, y) => y - x));
});
test("orden por nombre y orden inválido (se ignora, no rompe)", () => {
  const n = filterProducts(PRODUCTOS, { sort: "name-asc" }).map((p) => p.nombre);
  assert.deepEqual(n, [...n].sort((a, b) => a.localeCompare(b, "es")));
  assert.equal(filterProducts(PRODUCTOS, { sort: "hack" }).length, PRODUCTOS.length);
  assert.ok(SORTS["price-asc"] && !SORTS["hack"]);
});
test("el filtrado no muta el catálogo original", () => {
  const before = PRODUCTOS.map((p) => p.id).join(); filterProducts(PRODUCTOS, { sort: "name-desc" }); filterProducts(PRODUCTOS, { sort: "price-asc" });
  assert.equal(PRODUCTOS.map((p) => p.id).join(), before);
});
