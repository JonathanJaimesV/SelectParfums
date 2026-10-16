/**
 * catalogService.js — Capa de datos del catálogo
 * ───────────────────────────────────────────────
 * - Semilla: lo que hay en data/products.js + data/notes.js (la "fuente de verdad" del código).
 * - Cambios del panel admin: se guardan en localStorage SOLO en el navegador del admin.
 *   Los visitantes nunca escriben en localStorage, así que siempre ven el catálogo desplegado.
 * - Para publicar los cambios: "Exportar products.js" y reemplazar src/data/products.js.
 *
 * Todo el acceso a datos pasa por este archivo: si más adelante migras a Supabase/Firebase,
 * solo cambias loadState/saveState/buildExport (el resto de la app no se entera).
 */
import { PRODUCTOS as SEED_PRODUCTS, MARCAS as SEED_BRANDS } from "../data/products";
import { NOTAS as SEED_NOTAS, NOTE_MAP } from "../data/notes";
import { slugify } from "../utils";

export const GENEROS = ["Hombre", "Mujer", "Unisex"];
export const ESTADOS = ["Disponible", "Agotado", "Preventa"];
export const NOTE_STAGES = [
  { key: "salida", label: "Notas de salida" },
  { key: "corazon", label: "Notas de corazón" },
  { key: "fondo", label: "Notas de fondo" },
];

/**
 * Etiquetas de género de un producto. Reglas:
 *  - "Unisex" marca las 3 a la vez (Hombre + Mujer + Unisex).
 *  - Hombre + Mujer juntas también activan Unisex.
 *  - Quitar Hombre o Mujer desactiva Unisex.
 * Acepta productos viejos que solo tienen `categoria` (string).
 */
export const normalizeGeneros = (raw) => {
  const set = new Set(raw);
  if (set.has("Unisex")) GENEROS.forEach((g) => set.add(g));
  else if (set.has("Hombre") && set.has("Mujer")) set.add("Unisex");
  return GENEROS.filter((g) => set.has(g));
};
export const generosOf = (p) => {
  const raw = Array.isArray(p.generos) ? p.generos : p.categoria ? [p.categoria] : [];
  const out = normalizeGeneros(raw.filter((g) => GENEROS.includes(g)));
  return out.length ? out : [...GENEROS]; // sin dato → Unisex (las 3)
};

const STORAGE_KEY = "selectparfums:catalog:v1";

/**
 * @typedef {Object} Producto
 * @property {number} id
 * @property {string} slug
 * @property {string} marca              Nombre de la marca (igual que en products.js)
 * @property {string} nombre
 * @property {"Hombre"|"Mujer"|"Unisex"} categoria   Derivada de `generos` (compatibilidad)
 * @property {("Hombre"|"Mujer"|"Unisex")[]} generos  Etiquetas marcadas (Unisex = las 3)
 * @property {string} descripcion
 * @property {string} [imagen]           = imagenes[0]
 * @property {(string|null)[]} [imagenes] [principal, adicional 1, adicional 2]
 * @property {string} tamanoFrasco       Ej. "100 ml"
 * @property {number|null} precioFrasco  null → "Consultar"
 * @property {number|null} precioDecant5
 * @property {number|null} precioDecant10
 * @property {"Disponible"|"Agotado"|"Preventa"} disponibilidad
 * @property {{salida:string[], corazon:string[], fondo:string[]}} notas
 */

// ───────────── helpers ─────────────
const toPrice = (v) => {
  if (v === "" || v == null) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const uniqNotes = (list = []) => {
  const seen = new Set();
  return list.map((n) => String(n).trim()).filter((n) => {
    const k = slugify(n);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const IMAGE_ALIASES = {
  "/assets/images/uploads/hawas-kobra-1.jpg": "/assets/images/RASASI/KOBRA/rasasi-hawas-kobra.jpg",
  "/assets/images/uploads/hawas-ice-1.jpg": "/assets/images/RASASI/ICE/rasasi-ice.jpg",
  "/assets/images/uploads/hawas-tropical-1.jpg": "/assets/images/RASASI/TROPICAL/rasasi-tropical.jpg",
  "/assets/images/uploads/khamrah-1.jpg": "/assets/images/LATTAFA/KHAMRAH/lattafa-khamrah.jpg",
  "/assets/images/uploads/asad-1.jpg": "/assets/images/LATTAFA/ASAD/lattafa-asad.jpg",
  "/assets/images/uploads/bourbon-1.jpg": "/assets/images/LATTAFA/BOURBON/lattafa-bourbon.jpg",
  "/assets/images/uploads/art-of-universe-1.jpg": "/assets/images/LATTAFA/ART-OF-UNIVERSE/lattafa-aou.jpg",
  "/assets/images/uploads/qahwa-1.jpg": "/assets/images/LATTAFA/QAHWA/lattafa-qahwa.jpg",
  "/assets/images/uploads/nebras-elixir-1.jpg": "/assets/images/LATTAFA/NEBRAS-ELIXIR/lattafa-NElixir.jpg",
  "/assets/images/uploads/yum-yum-1.jpg": "/assets/images/ARMAF/YUM-YUM/armaf-yumyum.jpg",
};

export const resolveImagePath = (src) => {
  if (!src) return "";
  return IMAGE_ALIASES[src] || src;
};

/** Garantiza que todo producto tenga TODOS los campos con el tipo correcto (evita crashes en Catalog/Detail). */
export function normalizeProduct(p) {
  const generos = generosOf(p);
  const out = {
    id: p.id,
    slug: p.slug || slugify(p.nombre || ""),
    marca: String(p.marca || "").trim(),
    nombre: String(p.nombre || "").trim(),
    categoria: generos.includes("Unisex") ? "Unisex" : generos[0],
    generos,
    descripcion: String(p.descripcion || "").trim(),
    tamanoFrasco: String(p.tamanoFrasco || "100 ml").trim(),
    precioFrasco: toPrice(p.precioFrasco),
    precioDecant5: toPrice(p.precioDecant5),
    precioDecant10: toPrice(p.precioDecant10),
    disponibilidad: ESTADOS.includes(p.disponibilidad) ? p.disponibilidad : "Disponible",
    notas: {
      salida: uniqNotes(p.notas?.salida),
      corazon: uniqNotes(p.notas?.corazon),
      fondo: uniqNotes(p.notas?.fondo),
    },
  };
  if (Array.isArray(p.imagenes)) {
    out.imagenes = [0, 1, 2].map((i) => resolveImagePath(p.imagenes[i]) || null);
    out.imagen = out.imagenes[0] || resolveImagePath(p.imagen) || "";
  } else if (p.imagen) {
    out.imagen = resolveImagePath(p.imagen);
  }
  return out;
}

const seedState = () => ({
  productos: SEED_PRODUCTS.map((p) => normalizeProduct({ ...p, notas: p.notas || SEED_NOTAS[p.id] })),
  marcas: SEED_BRANDS.map(({ fragancias, ...m }) => ({ ...m })),
  modified: false, // true = hay cambios del admin guardados en este navegador
});

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (Array.isArray(s.productos) && Array.isArray(s.marcas)) {
        return { productos: s.productos.map(normalizeProduct), marcas: s.marcas, modified: true };
      }
    }
  } catch { /* datos corruptos → semilla */ }
  return seedState();
}

/** @returns {string|null} mensaje de error, o null si guardó bien */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ productos: state.productos, marcas: state.marcas }));
    return null;
  } catch (e) {
    return e?.name === "QuotaExceededError"
      ? "No hay espacio en el navegador (imágenes muy pesadas). Usa rutas de imagen en vez de subir archivos."
      : "No se pudo guardar en este navegador.";
  }
}
export const clearStoredState = () => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ } };

// ───────────── reglas de negocio ─────────────
const uniqueSlug = (productos, base, selfId) => {
  let slug = base || "perfume", n = 2;
  while (productos.some((p) => p.slug === slug && p.id !== selfId)) slug = `${base}-${n++}`;
  return slug;
};
export const nextId = (productos) => productos.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;

export const isDuplicateName = (productos, marca, nombre, selfId) =>
  productos.some((p) => p.id !== selfId && p.marca.toLowerCase() === marca.trim().toLowerCase() &&
    slugify(p.nombre) === slugify(nombre));

export const isDuplicateBrand = (marcas, nombre) =>
  marcas.some((m) => slugify(m.nombre) === slugify(nombre));

/** Todas las notas conocidas: diccionario + las usadas en productos (sin duplicados ni variantes de acentos). */
export function collectNotes(productos) {
  const map = new Map();
  const add = (n) => { const k = slugify(n); if (k && !map.has(k)) map.set(k, String(n).trim()); };
  Object.values(NOTE_MAP).forEach((v) => add(v.es));
  Object.values(SEED_NOTAS).forEach((st) => Object.values(st).flat().forEach(add));
  productos.forEach((p) => Object.values(p.notas || {}).flat().forEach(add));
  return [...map.values()].sort((a, b) => a.localeCompare(b, "es"));
}

// ───────────── reducer ─────────────
export function catalogReducer(state, action) {
  switch (action.type) {
    case "HYDRATE": return action.state;
    case "RESET": return seedState();
    case "ADD_BRAND": {
      const nombre = action.brand.nombre.trim();
      if (isDuplicateBrand(state.marcas, nombre)) return state;
      const marca = { id: slugify(nombre), nombre, descripcion: action.brand.descripcion.trim() };
      return { ...state, modified: true, marcas: [...state.marcas, marca] };
    }
    case "ADD_PRODUCT": {
      const id = nextId(state.productos);
      const base = normalizeProduct({ ...action.product, id, slug: "" });
      const p = { ...base, slug: uniqueSlug(state.productos, slugify(base.nombre), id) };
      return { ...state, modified: true, productos: [...state.productos, p] };
    }
    case "UPDATE_PRODUCT": {
      const base = normalizeProduct({ ...action.product, slug: "" });
      const p = { ...base, slug: uniqueSlug(state.productos, slugify(base.nombre), base.id) };
      return { ...state, modified: true, productos: state.productos.map((x) => (x.id === p.id ? p : x)) };
    }
    case "SET_STATUS":
      return { ...state, modified: true,
        productos: state.productos.map((x) => (x.id === action.id ? { ...x, disponibilidad: action.status } : x)) };
    case "DELETE_PRODUCT":
      return { ...state, modified: true, productos: state.productos.filter((x) => x.id !== action.id) };
    default: return state;
  }
}

// ───────────── exportar a products.js ─────────────
const extOf = (dataUrl) => (dataUrl.match(/^data:image\/(\w+)/)?.[1] || "jpeg").replace("jpeg", "jpg");

/**
 * Genera el contenido de src/data/products.js.
 * Las imágenes subidas desde el panel (data:...) no caben en el código: se reemplazan por
 * /assets/images/uploads/<slug>-<n>.<ext> y se devuelven aparte para guardarlas en public/.
 */
export function buildExport(state) {
  const files = [];
  const productos = state.productos.map((p) => {
    if (!p.imagenes) return p;
    const imagenes = p.imagenes.map((src, i) => {
      if (!src || !src.startsWith("data:")) return src;
      const name = `${p.slug}-${i + 1}.${extOf(src)}`;
      files.push({ name, dataUrl: src });
      return `/assets/images/uploads/${name}`;
    });
    return { ...p, imagenes, imagen: imagenes[0] || "" };
  });
  const marcas = state.marcas.map((m) => ({ ...m, fragancias: 0 }));
  const code = `/**
 * products.js — Catálogo de fragancias (exportado desde el panel /admin)
 * ──────────────────────────────────────────────────────────────────────
 * Las notas olfativas van dentro de cada producto (campo \`notas\`).
 * Usa \`null\` en cualquier precio para que se muestre como "Consultar".
 */

export const MARCAS = ${JSON.stringify(marcas, null, 2)};

export const PRODUCTOS = ${JSON.stringify(productos, null, 2)};

// Calcular cantidad de fragancias por marca
MARCAS.forEach((m) => {
  m.fragancias = PRODUCTOS.filter(
    (p) => p.marca.toLowerCase() === m.nombre.toLowerCase()
  ).length;
});
`;
  return { code, files };
}
