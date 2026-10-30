// Búsqueda, filtros y orden del catálogo: lógica PURA (sin React ni DOM), probada con `npm test`.
import { isSoldOut, isValidPrice, sizeOptions } from "./pricing.js";

/** Minúsculas y sin acentos: "Árabe" y "arabe" coinciden. */
export const normalize = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const flatNotes = (n) => (n && typeof n === "object" ? Object.values(n).flat().filter((x) => typeof x === "string") : []);

/** Texto indexable del perfume (tolera campos ausentes). */
export const searchText = (p) =>
  normalize([p.nombre, p.marca, p.categoria, p.descripcion, ...(p.generos || []), ...flatNotes(p.notas)].join(" "));

/** Todas las palabras de la búsqueda deben aparecer (en cualquier orden). */
export const matchesQuery = (p, query) => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const text = searchText(p);
  return tokens.every((t) => text.includes(t));
};

/** Precio de entrada: el menor de los formatos con precio (o null si todos son "Consultar"). */
export const entryPrice = (p) => {
  const prices = sizeOptions(p).map((o) => o.price).filter(isValidPrice);
  return prices.length ? Math.min(...prices) : null;
};

export const CATS = ["Todos", "Hombre", "Mujer", "Unisex"];
export const AVAILABILITY = ["Preventa", "Disponible", "Agotado"];
// "Precio de entrada" = el formato más económico con precio; los "Consultar" van al final
export const SORTS = {
  "price-asc": (a, b) => (entryPrice(a) ?? Infinity) - (entryPrice(b) ?? Infinity),
  "price-desc": (a, b) => (entryPrice(b) ?? -1) - (entryPrice(a) ?? -1),
  "name-asc": (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  "name-desc": (a, b) => b.nombre.localeCompare(a.nombre, "es"),
};

/** Filtra y ordena. Sin orden elegido: orden de la tienda con los agotados al final (sort estable). */
export function filterProducts(products, { search = "", cat = "Todos", brand = "", availability = "", sort = "" } = {}) {
  const r = products.filter((p) =>
    matchesQuery(p, search) &&
    (cat === "Todos" || p.categoria === cat) &&
    (!brand || p.marca === brand) &&
    (!availability || p.disponibilidad === availability)
  );
  if (SORTS[sort]) return [...r].sort(SORTS[sort]);
  return [...r].sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)));
}
