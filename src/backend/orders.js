// Registro del pedido ANTES de abrir WhatsApp. Lógica sin React: se prueba con `npm test`.
// Garantías:
//  · El servidor (función SQL create_order) revalida precios/disponibilidad y devuelve la copia histórica.
//  · Idempotente: el mismo carrito reutiliza el mismo client_request_id (doble clic, recarga, reintento) → mismo pedido y código.
//  · Nunca marca nada como confirmado ni pagado: el estado inicial es "iniciado".
//  · Si el servidor falla, NO se afirma que se registró: se devuelve un error tipificado.
import { rpc, BackendError } from "./http.js";

export const CHECKOUT_KEY = "selectparfums:checkout:v1";
export const REQUEST_TTL_MS = 2 * 60 * 60 * 1000; // pasado este tiempo, el mismo carrito genera un pedido nuevo
const CODE_RE = /^SP-\d{6}-[2-9A-HJ-NP-Z]{4}$/;

/** Firma estable del contenido del carrito: ids + presentación + cantidad, ordenados. */
export const cartSignature = (lines) =>
  lines.filter((l) => l.status === "ok").map((l) => `${l.id}:${l.sizeKey}:${l.qty}`).sort().join("|");

export function newUuid() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16); c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const safeStorage = (s) => { try { return s ?? globalThis.localStorage ?? null; } catch { return null; } };

/** Devuelve el client_request_id vigente para este carrito (lo reutiliza si la firma coincide y no ha caducado). */
export function requestIdFor(signature, { storage, now = Date.now(), uuid = newUuid } = {}) {
  const st = safeStorage(storage);
  try {
    const saved = JSON.parse(st?.getItem(CHECKOUT_KEY) || "null");
    if (saved && saved.sig === signature && typeof saved.id === "string" && now - saved.at < REQUEST_TTL_MS) return saved.id;
  } catch { /* se genera uno nuevo */ }
  const id = uuid();
  try { st?.setItem(CHECKOUT_KEY, JSON.stringify({ sig: signature, id, at: now })); } catch { /* sin almacenamiento: sigue funcionando */ }
  return id;
}
export function clearCheckoutState(storage) { try { safeStorage(storage)?.removeItem(CHECKOUT_KEY); } catch { /* nada */ } }

/** Validación defensiva de la respuesta de create_order (no se confía en lo que llegue de la red). */
export function validateOrderResponse(o) {
  if (!o || typeof o !== "object") return false;
  if (typeof o.code !== "string" || !CODE_RE.test(o.code)) return false;
  if (typeof o.status !== "string" || !Array.isArray(o.items) || o.items.length === 0) return false;
  let sum = 0;
  for (const i of o.items) {
    if (!Number.isInteger(i.product_id) || !["5", "10", "full"].includes(i.presentation_kind)) return false;
    if (!Number.isInteger(i.quantity) || i.quantity < 1 || !Number.isInteger(i.unit_price_cop) || i.unit_price_cop < 1) return false;
    if (i.subtotal_cop !== i.unit_price_cop * i.quantity) return false;
    if (typeof i.name !== "string" || typeof i.brand !== "string" || typeof i.presentation_label !== "string") return false;
    sum += i.subtotal_cop;
  }
  return Number(o.total_cop) === sum;
}

/** ¿Lo que registró el servidor coincide con lo que el cliente veía? (mismas líneas, cantidades y precios) */
export function compareWithCart(summary, order) {
  const mine = summary.lines.filter((l) => l.status === "ok");
  if (mine.length !== order.items.length || Number(order.total_cop) !== summary.total) return false;
  const key = (id, kind) => `${id}:${kind}`;
  const server = new Map(order.items.map((i) => [key(i.product_id, i.presentation_kind), i]));
  return mine.every((l) => { const s = server.get(key(l.id, l.sizeKey)); return s && s.quantity === l.qty && s.unit_price_cop === l.unitPrice; });
}

/** Resumen con la forma que espera buildMessage, construido con los datos del SERVIDOR (copia histórica). */
export function summaryFromOrder(order) {
  return {
    lines: order.items.map((i) => ({
      status: "ok", id: i.product_id, sizeKey: i.presentation_kind, qty: i.quantity, unitPrice: i.unit_price_cop, subtotal: i.subtotal_cop,
      name: `${i.brand} ${i.name}`.trim(), presentation: i.presentation_label, product: { disponibilidad: i.availability },
    })),
    total: Number(order.total_cop),
    units: order.items.reduce((n, i) => n + i.quantity, 0), orderableUnits: order.items.reduce((n, i) => n + i.quantity, 0), blocked: 0, missing: 0,
  };
}

const REASONS = {
  agotado: "está agotado", no_existe: "ya no está en el catálogo", presentacion_inactiva: "ya no se ofrece en esa presentación", sin_precio: "no tiene precio para esa presentación",
};
/** Mensaje claro para la persona que compra. */
export function describeError(err, summary) {
  switch (err?.kind) {
    case "unavailable": {
      const l = summary?.lines.find((x) => x.id === err.productId && x.sizeKey === err.presentation);
      return `${l ? `«${l.name}» (${l.presentation})` : "Un artículo del pedido"} ${REASONS[err.reason] || "ya no está disponible"}. Quítalo del pedido para continuar.`;
    }
    case "network": return "No pudimos conectar con el servidor para registrar tu pedido. Revisa tu conexión.";
    case "timeout": return "El servidor tardó demasiado en responder.";
    case "rate_limited": return "Hay demasiadas solicitudes seguidas. Espera un momento e inténtalo de nuevo.";
    case "config": return "El registro de pedidos aún no está disponible.";
    case "bad_response": return "El servidor respondió algo inesperado y no podemos confirmar que el pedido se registrara.";
    default: return "No se pudo registrar el pedido.";
  }
}

/**
 * Registra el pedido. → { ok: true, order, matches } | { ok: false, kind, message, error }
 * `matches`=false indica que los precios/cantidades del servidor difieren de lo que veía el cliente: NO se debe abrir WhatsApp sin que lo revise.
 */
export async function registerOrder(summary, cfg, deps = {}) {
  const lines = summary.lines.filter((l) => l.status === "ok");
  if (!lines.length) return { ok: false, kind: "empty", message: "El pedido está vacío." };
  const requestId = requestIdFor(cartSignature(summary.lines), deps);
  const items = lines.map((l) => ({ product_id: l.id, kind: l.sizeKey, quantity: l.qty }));
  try {
    const order = await rpc("create_order", { p_client_request_id: requestId, p_items: items }, { ...cfg, fetchImpl: deps.fetchImpl });
    if (!validateOrderResponse(order)) throw new BackendError("bad_response", "Respuesta inválida del servidor");
    return { ok: true, order, matches: compareWithCart(summary, order), requestId };
  } catch (e) {
    const err = e instanceof BackendError ? e : new BackendError("network", String(e?.message || e));
    return { ok: false, kind: err.kind, message: describeError(err, summary), error: err };
  }
}
