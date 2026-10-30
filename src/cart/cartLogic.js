// Lógica PURA del carrito (sin React ni DOM): se prueba con `npm test`.
// Principio: lo que se guarda son solo { id, size, qty }. Nombres, presentaciones y PRECIOS se leen siempre del
// catálogo vigente (resolveCart), así nunca se muestra ni se envía un precio viejo como si estuviera confirmado.
// OJO: al ser una tienda 100 % frontend, estos cálculos NO son una validación comercial del lado del servidor;
// el vendedor confirma disponibilidad y valor final por WhatsApp.
import { isValidPrice, formatCOP, sizeOptions, presentationName, isSoldOut } from "../pricing.js";

export const MAX_QTY = 20;          // unidades máximas por artículo (producto + presentación)
export const MAX_WA_URL = 3800;     // largo práctico máximo del enlace wa.me ya codificado
export const STORAGE_KEY = "selectparfums:cart:v1";
export const SIZE_KEYS = ["5", "10", "full"];

export const lineKey = (id, size) => `${id}:${size}`;
export const clampQty = (q) => {
  const n = Math.floor(Number(q));
  return Number.isFinite(n) ? Math.min(MAX_QTY, Math.max(1, n)) : 1;
};

/* ── Operaciones sobre la lista [{ id, size, qty }] (inmutables) ── */
export const addItem = (items, id, size, qty = 1) => {
  const key = lineKey(id, size);
  if (items.some((i) => lineKey(i.id, i.size) === key)) {
    return items.map((i) => (lineKey(i.id, i.size) === key ? { ...i, qty: clampQty(i.qty + clampQty(qty)) } : i));
  }
  return [...items, { id, size, qty: clampQty(qty) }];
};
export const removeItem = (items, key) => items.filter((i) => lineKey(i.id, i.size) !== key);
export const setQty = (items, key, qty) =>
  !(Number(qty) >= 1) ? removeItem(items, key) : items.map((i) => (lineKey(i.id, i.size) === key ? { ...i, qty: clampQty(qty) } : i));

/* ── Persistencia ── */
export const serialize = (items) => JSON.stringify({ v: 1, items: items.map(({ id, size, qty }) => ({ id, size, qty })) });

/** Lee lo guardado con tolerancia total: JSON corrupto, formato viejo (array suelto), tipos raros, duplicados. */
export function parseStored(raw) {
  if (raw == null || raw === "") return { items: [], dropped: 0 };
  let data;
  try { data = JSON.parse(raw); } catch { return { items: [], dropped: 1 }; }
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
  if (!list) return { items: [], dropped: 1 };
  let items = [];
  let dropped = 0;
  for (const e of list) {
    const id = Number(e?.id);
    const size = String(e?.size ?? "");
    const qty = Math.floor(Number(e?.qty));
    if (!Number.isSafeInteger(id) || id < 1 || !SIZE_KEYS.includes(size) || !Number.isFinite(qty) || qty < 1) { dropped++; continue; }
    items = addItem(items, id, size, qty); // fusiona duplicados
  }
  return { items, dropped };
}

/**
 * Cruza el carrito con el catálogo ACTUAL. Cada línea queda con status:
 *  ok       → se puede pedir (precio válido y no agotado)
 *  soldout  → el perfume está agotado
 *  noprice  → esa presentación ya no tiene precio válido ("Consultar")
 *  missing  → el perfume ya no existe en el catálogo
 */
export function resolveCart(items, catalog) {
  const byId = new Map(catalog.map((p) => [String(p.id), p]));
  const lines = items.map((it) => {
    const key = lineKey(it.id, it.size);
    const p = byId.get(String(it.id));
    if (!p) return { key, id: it.id, sizeKey: it.size, qty: it.qty, status: "missing", product: null, name: "", presentation: "", unitPrice: null, subtotal: 0 };
    const opt = sizeOptions(p).find((o) => o.key === it.size);
    const validPrice = Boolean(opt) && isValidPrice(opt.price);
    const status = isSoldOut(p) ? "soldout" : !validPrice ? "noprice" : "ok";
    const unitPrice = validPrice ? opt.price : null;
    return {
      key, id: p.id, sizeKey: it.size, qty: it.qty, status, product: p,
      name: `${p.marca} ${p.nombre}`.trim(), presentation: presentationName(p, it.size),
      unitPrice, subtotal: status === "ok" ? unitPrice * it.qty : 0, // enteros COP: sin errores de coma flotante
    };
  });
  const okLines = lines.filter((l) => l.status === "ok");
  return {
    lines,
    units: lines.filter((l) => l.product).reduce((s, l) => s + l.qty, 0), // los perfumes que ya no existen no cuentan
    orderableUnits: okLines.reduce((s, l) => s + l.qty, 0),
    total: okLines.reduce((s, l) => s + l.subtotal, 0),
    blocked: lines.filter((l) => l.status === "soldout" || l.status === "noprice").length,
    missing: lines.filter((l) => l.status === "missing").length,
  };
}

/* ── WhatsApp ── */
export const isValidWaNumber = (n) => /^[1-9]\d{9,14}$/.test(String(n ?? ""));
export const money = (v) => `$${formatCOP(v)} COP`;

/** Mensaje del pedido. Solo incluye líneas "ok" (checkout bloquea si hay otras). */
export function buildMessage(summary, { code } = {}) {
  const ok = summary.lines.filter((l) => l.status === "ok");
  const blocks = ok.map((l, i) => [
    `${i + 1}. ${l.name}`,
    `   - Presentación: ${l.presentation}`,
    ...(l.product.disponibilidad === "Preventa" ? ["   - Disponibilidad: Preventa"] : []),
    `   - Cantidad: ${l.qty}`,
    `   - Precio unitario: ${money(l.unitPrice)}`,
    `   - Subtotal: ${money(l.subtotal)}`,
  ].join("\n"));
  return [
    "Hola, Select Parfums Colombia. Quiero realizar el siguiente pedido:",
    "",
    "MI PEDIDO",
    ...(code ? [`Código del pedido: ${code}`] : []),
    "",
    blocks.join("\n\n"),
    "",
    `TOTAL DEL PEDIDO: ${money(summary.total)}`,
    "",
    "Quedo atento a la confirmación de disponibilidad y a las indicaciones para continuar con la compra.",
    "",
    "Gracias.",
  ].join("\n");
}

/**
 * Valida y prepara el checkout. Nunca recorta el pedido en silencio:
 *  { ok:true, url, message } | { ok:false, reason: "empty" | "blocked" | "no-number" | "too-long", ... }
 */
export function prepareCheckout(summary, number, { code } = {}) {
  if (!summary.lines.length || summary.orderableUnits === 0) return { ok: false, reason: "empty" };
  if (summary.blocked || summary.missing) return { ok: false, reason: "blocked" };
  if (!isValidWaNumber(number)) return { ok: false, reason: "no-number" };
  const message = buildMessage(summary, { code });
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  if (url.length > MAX_WA_URL) return { ok: false, reason: "too-long", message, chatUrl: `https://wa.me/${number}` };
  return { ok: true, url, message };
}
