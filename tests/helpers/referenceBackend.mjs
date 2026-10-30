// Servidor de REFERENCIA en memoria. Replica las reglas de supabase/migrations/0001_init.sql (create_order, estados).
// ⚠ NO es Supabase: es una réplica de NUESTRO diseño para probar el cliente y la interfaz sin red.
//    Lo que valida la base de datos real es supabase/tests/selftest.sql (se ejecuta en un proyecto de prueba).
import { PRODUCTOS } from "../../src/data/products.js";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const KIND_LABEL = (kind, size) => (kind === "5" ? "Decant de 5 ml" : kind === "10" ? "Decant de 10 ml" : `Frasco completo (${size})`);

export class SqlError extends Error { constructor(code, message) { super(message); this.code = code; } }

/** Base en memoria sembrada desde el catálogo real (igual que la semilla SQL). */
export function makeDb(products = PRODUCTOS) {
  const db = { products: new Map(), orders: [], byRequest: new Map(), seq: 0, faults: null, calls: [], rng: Math.random };
  for (const p of products) {
    db.products.set(p.id, {
      id: p.id, slug: p.slug, brand: p.marca, name: p.nombre, bottle_size: p.tamanoFrasco, status: "published", availability: p.disponibilidad,
      presentations: { "5": { enabled: true, price: p.precioDecant5 }, "10": { enabled: true, price: p.precioDecant10 }, full: { enabled: true, price: p.precioFrasco } },
    });
  }
  return db;
}

function genCode(db, now) {
  const bogota = new Date(now.getTime() - 5 * 3600 * 1000); // America/Bogota = UTC-5 (sin horario de verano)
  const yymmdd = `${String(bogota.getUTCFullYear()).slice(2)}${String(bogota.getUTCMonth() + 1).padStart(2, "0")}${String(bogota.getUTCDate()).padStart(2, "0")}`;
  for (let i = 0; i < 20; i++) {
    const code = `SP-${yymmdd}-${Array.from({ length: 4 }, () => ALPHABET[Math.floor(db.rng() * ALPHABET.length)]).join("")}`;
    if (!db.orders.some((o) => o.code === code)) return code;
  }
  throw new SqlError("55000", "no se pudo generar el código");
}

const toJson = (o) => ({ order_id: o.id, code: o.code, status: o.status, total_cop: o.total_cop, created_at: o.created_at, items: o.items.map((i) => ({ ...i })) });

/** Misma lógica que public.create_order(): validar TODO primero, insertar después; idempotente por client_request_id. */
export function createOrder(db, requestId, items, now = new Date()) {
  if (!requestId) throw new SqlError("22023", "client_request_id requerido");
  if (!Array.isArray(items) || items.length === 0 || items.length > 40) throw new SqlError("22023", "items inválidos");
  if (db.byRequest.has(requestId)) return toJson(db.byRequest.get(requestId));
  const grouped = new Map();
  for (const it of items) {
    const key = `${it.product_id}|${it.kind}`;
    grouped.set(key, { product_id: it.product_id, kind: it.kind, quantity: (grouped.get(key)?.quantity || 0) + Number(it.quantity) });
  }
  const lines = [...grouped.values()].sort((a, b) => a.product_id - b.product_id || (a.kind < b.kind ? -1 : 1));
  const built = []; let total = 0;
  for (const l of lines) {
    if (!Number.isInteger(l.product_id) || !["5", "10", "full"].includes(l.kind) || !Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 20) throw new SqlError("22023", "línea inválida");
    const p = db.products.get(l.product_id);
    if (!p || p.status !== "published") throw new SqlError("P0001", `ITEM_UNAVAILABLE:${l.product_id}:${l.kind}:no_existe`);
    if (p.availability === "Agotado") throw new SqlError("P0001", `ITEM_UNAVAILABLE:${l.product_id}:${l.kind}:agotado`);
    const pres = p.presentations[l.kind];
    if (!pres || !pres.enabled) throw new SqlError("P0001", `ITEM_UNAVAILABLE:${l.product_id}:${l.kind}:presentacion_inactiva`);
    if (pres.price === null || pres.price === undefined) throw new SqlError("P0001", `ITEM_UNAVAILABLE:${l.product_id}:${l.kind}:sin_precio`);
    built.push({ line_no: built.length + 1, product_id: p.id, brand: p.brand, name: p.name, slug: p.slug, presentation_kind: l.kind, presentation_label: KIND_LABEL(l.kind, p.bottle_size),
      availability: p.availability, quantity: l.quantity, unit_price_cop: pres.price, subtotal_cop: pres.price * l.quantity });
    total += pres.price * l.quantity;
  }
  const order = { id: `00000000-0000-4000-8000-${String(++db.seq).padStart(12, "0")}`, code: genCode(db, now), client_request_id: requestId, status: "iniciado", total_cop: total, created_at: now.toISOString(), items: built };
  db.orders.push(order); db.byRequest.set(requestId, order);
  return toJson(order);
}

/** Manejador HTTP estilo PostgREST: POST /rest/v1/rpc/create_order. → { status, body }  (o lanza "network"). */
export function handle(db, { method, url, headers = {}, body }, anonKey) {
  db.calls.push({ method, url });
  const f = db.faults;
  if (f?.mode === "down") throw new TypeError("Failed to fetch");
  if (f?.mode === "500") return { status: 500, body: { message: "internal error" } };
  if (f?.mode === "garbage") return { status: 200, raw: "<html>no es json</html>" };
  if (f?.mode === "bad_shape") return { status: 200, body: { code: "XX", items: [] } };
  if (headers.apikey !== anonKey) return { status: 401, body: { message: "Invalid API key" } };
  const m = /\/rest\/v1\/rpc\/(\w+)$/.exec(new URL(url, "http://x").pathname);
  if (method !== "POST" || !m) return { status: 404, body: { message: "not found" } };
  if (m[1] !== "create_order") return { status: 404, body: { code: "PGRST202", message: "function not found" } };
  const args = typeof body === "string" ? JSON.parse(body) : body;
  try { return { status: 200, body: createOrder(db, args.p_client_request_id, args.p_items) }; }
  catch (e) { if (e instanceof SqlError) return { status: e.code === "42501" ? 403 : 400, body: { code: e.code, message: e.message } }; throw e; }
}

/** fetch simulado para pruebas unitarias. */
export function fetchFor(db, anonKey, { delayMs = 0 } = {}) {
  return async (url, init = {}) => {
    if (delayMs) await new Promise((r, rej) => { const t = setTimeout(r, delayMs); init.signal?.addEventListener("abort", () => { clearTimeout(t); rej(Object.assign(new Error("aborted"), { name: "AbortError" })); }); });
    const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    const r = handle(db, { method: init.method || "GET", url, headers, body: init.body }, anonKey);
    return new Response(r.raw ?? JSON.stringify(r.body), { status: r.status, headers: { "Content-Type": "application/json" } });
  };
}
