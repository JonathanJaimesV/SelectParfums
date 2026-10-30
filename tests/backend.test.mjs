// Cliente de pedidos y seguridad del frontend. npm test
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTOS } from "../src/data/products.js";
import { addItem, resolveCart, buildMessage, prepareCheckout } from "../src/cart/cartLogic.js";
import { evaluateBackendConfig } from "../src/backend/backendConfigCore.js";
import { rpc, mapHttpError, BackendError } from "../src/backend/http.js";
import { registerOrder, requestIdFor, cartSignature, clearCheckoutState, validateOrderResponse, compareWithCart, summaryFromOrder, describeError, REQUEST_TTL_MS, CHECKOUT_KEY } from "../src/backend/orders.js";
import { TRANSITIONS, ORDER_STATUSES, canTransition } from "../src/backend/orderStatus.js";
import { makeDb, createOrder, fetchFor, SqlError } from "./helpers/referenceBackend.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(path.join(root, f), "utf8");
const URL_ = "https://abc.supabase.co", KEY = "sb_publishable_testtesttesttest";
const cfg = { url: URL_, key: KEY };
const dune = PRODUCTOS.find((p) => p.slug === "dunescape"), asad = PRODUCTOS.find((p) => p.slug === "asad"), sold = PRODUCTOS.find((p) => p.disponibilidad === "Agotado");
const cart = (...rows) => resolveCart(rows.reduce((it, [p, k, q]) => addItem(it, p.id, k, q), []), PRODUCTOS);
const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }; };
const deps = (db, extra = {}) => ({ storage: memStore(), fetchImpl: fetchFor(db, KEY), ...extra });

/* ───────── Configuración segura ───────── */
test("configuración: acepta solo claves públicas; rechaza service_role / secret / URL insegura", () => {
  const jwt = (role) => `h.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.s`;
  assert.equal(evaluateBackendConfig("", "").problem, "missing");
  assert.equal(evaluateBackendConfig(URL_ + "/", jwt("anon")).configured, true);
  assert.equal(evaluateBackendConfig(URL_, KEY).configured, true);
  assert.equal(evaluateBackendConfig(URL_, jwt("service_role")).problem, "secret_key");
  assert.equal(evaluateBackendConfig(URL_, "sb_secret_abcdefghijklmnopqrstuvwxyz").problem, "secret_key");
  assert.equal(evaluateBackendConfig(URL_, "no-es-una-clave").problem, "unrecognized_key");
  assert.equal(evaluateBackendConfig("http://sitio-remoto.com", jwt("anon")).problem, "bad_url");
  assert.equal(evaluateBackendConfig("javascript:alert(1)", jwt("anon")).problem, "bad_url");
  assert.equal(evaluateBackendConfig("http://127.0.0.1:8899", jwt("anon")).configured, true);   // solo localhost puede ser http
  assert.equal(evaluateBackendConfig(URL_, jwt("service_role")).key, "", "una clave rechazada no se conserva");
});

/* ───────── Cliente HTTP y errores ───────── */
test("http: errores de PostgREST se traducen a tipos claros", () => {
  assert.equal(mapHttpError(400, { code: "P0001", message: "ITEM_UNAVAILABLE:3:5:agotado" }).kind, "unavailable");
  const u = mapHttpError(400, { code: "P0001", message: "ITEM_UNAVAILABLE:3:full:sin_precio" });
  assert.deepEqual([u.productId, u.presentation, u.reason], [3, "full", "sin_precio"]);
  assert.equal(mapHttpError(401, {}).kind, "auth");
  assert.equal(mapHttpError(403, {}).kind, "forbidden");
  assert.equal(mapHttpError(400, { code: "42501", message: "x" }).kind, "forbidden");
  assert.equal(mapHttpError(404, { code: "PGRST202" }).kind, "config");
  assert.equal(mapHttpError(400, { code: "22023", message: "items inválidos" }).kind, "validation");
  assert.equal(mapHttpError(429, {}).kind, "rate_limited");
  assert.equal(mapHttpError(500, {}).kind, "server");
  assert.equal(mapHttpError(503, {}).kind, "server");
});
test("http: red caída, tiempo agotado y respuesta ilegible", async () => {
  const db = makeDb(); db.faults = { mode: "down" };
  await assert.rejects(rpc("create_order", {}, { ...cfg, fetchImpl: fetchFor(db, KEY) }), (e) => e.kind === "network");
  db.faults = { mode: "garbage" };
  await assert.rejects(rpc("create_order", {}, { ...cfg, fetchImpl: fetchFor(db, KEY) }), (e) => e.kind === "bad_response");
  db.faults = null;
  await assert.rejects(rpc("create_order", {}, { ...cfg, timeoutMs: 30, fetchImpl: fetchFor(db, KEY, { delayMs: 300 }) }), (e) => e.kind === "timeout");
  await assert.rejects(rpc("x", {}, { url: "", key: "" }), (e) => e.kind === "config");
});
test("http: envía solo la clave pública (apikey y Authorization con la misma clave anónima)", async () => {
  let seen; const f = async (url, init) => { seen = { url, init }; return new Response("{}", { status: 200 }); };
  await rpc("create_order", { a: 1 }, { ...cfg, fetchImpl: f });
  assert.equal(seen.url, `${URL_}/rest/v1/rpc/create_order`);
  assert.equal(seen.init.headers.apikey, KEY); assert.equal(seen.init.headers.Authorization, `Bearer ${KEY}`);
  assert.equal(seen.init.method, "POST");
});

/* ───────── Registro del pedido ───────── */
test("pedido: se registra con código, estado 'iniciado' (no confirmado ni pagado) y copia de precios del servidor", async () => {
  const db = makeDb(); const s = cart([dune, "5", 2], [dune, "full", 1]);
  const r = await registerOrder(s, cfg, deps(db));
  assert.equal(r.ok, true); assert.equal(r.matches, true);
  assert.match(r.order.code, /^SP-\d{6}-[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(r.order.status, "iniciado");
  assert.notEqual(r.order.status, "confirmado"); assert.notEqual(r.order.status, "pagado");
  assert.equal(r.order.total_cop, 2 * dune.precioDecant5 + dune.precioFrasco);
  assert.equal(db.orders.length, 1);
});
test("pedido: reintentos y doble clic reutilizan el MISMO pedido (sin duplicados)", async () => {
  const db = makeDb(); const s = cart([dune, "5", 2]); const d = deps(db);
  const a = await registerOrder(s, cfg, d);
  const b = await registerOrder(s, cfg, d);                                   // mismo carrito, mismo almacenamiento
  const [c, e] = await Promise.all([registerOrder(s, cfg, d), registerOrder(s, cfg, d)]);   // simultáneas
  assert.equal(new Set([a, b, c, e].map((x) => x.order.code)).size, 1);
  assert.equal(db.orders.length, 1, "solo un pedido en la base");
});
test("pedido: recarga de la página (nuevo cliente, mismo almacenamiento) reutiliza el pedido", async () => {
  const db = makeDb(); const st = memStore(); const s = cart([asad, "full", 1]);
  const a = await registerOrder(s, cfg, { storage: st, fetchImpl: fetchFor(db, KEY) });
  const b = await registerOrder(cart([asad, "full", 1]), cfg, { storage: st, fetchImpl: fetchFor(db, KEY) });
  assert.equal(a.order.code, b.order.code); assert.equal(db.orders.length, 1);
});
test("pedido: si el carrito cambia o caduca la clave, se crea un pedido NUEVO", async () => {
  const db = makeDb(); const st = memStore(); const f = fetchFor(db, KEY);
  const a = await registerOrder(cart([dune, "5", 1]), cfg, { storage: st, fetchImpl: f });
  const b = await registerOrder(cart([dune, "5", 2]), cfg, { storage: st, fetchImpl: f });   // cantidad distinta
  assert.notEqual(a.order.code, b.order.code);
  const t0 = 1_000_000;
  const id1 = requestIdFor("x", { storage: st, now: t0 }); const id2 = requestIdFor("x", { storage: st, now: t0 + 1000 }); const id3 = requestIdFor("x", { storage: st, now: t0 + REQUEST_TTL_MS + 1 });
  assert.equal(id1, id2); assert.notEqual(id1, id3);
  clearCheckoutState(st); assert.equal(st.getItem(CHECKOUT_KEY), null);
});
test("pedido: la firma no depende del orden de las líneas", () => {
  assert.equal(cartSignature(cart([dune, "5", 1], [asad, "full", 1]).lines), cartSignature(cart([asad, "full", 1], [dune, "5", 1]).lines));
  assert.notEqual(cartSignature(cart([dune, "5", 1]).lines), cartSignature(cart([dune, "10", 1]).lines));
});
test("pedido: sin almacenamiento disponible sigue funcionando", async () => {
  const db = makeDb(); const broken = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  const r = await registerOrder(cart([dune, "5", 1]), cfg, { storage: broken, fetchImpl: fetchFor(db, KEY) });
  assert.equal(r.ok, true);
});
test("pedido: el servidor revalida; si el precio cambió, `matches` es false y manda el precio del SERVIDOR", async () => {
  const db = makeDb(); const s = cart([dune, "5", 2]);                       // el cliente veía 23.000
  db.products.get(dune.id).presentations["5"].price = 25000;                 // el vendedor cambió el precio
  const r = await registerOrder(s, cfg, deps(db));
  assert.equal(r.ok, true); assert.equal(r.matches, false);
  assert.equal(r.order.total_cop, 50000);
  const msg = buildMessage(summaryFromOrder(r.order), { code: r.order.code });
  assert.match(msg, /Precio unitario: \$25\.000 COP/); assert.doesNotMatch(msg, /\$23\.000/);
});
test("pedido: rechazos del servidor (agotado, sin precio, presentación inactiva, oculto) → error claro, sin registrar nada", async () => {
  for (const [mutate, reason, text] of [
    [(p) => { p.availability = "Agotado"; }, "agotado", /agotado/],
    [(p) => { p.presentations["5"].price = null; }, "sin_precio", /no tiene precio/],
    [(p) => { p.presentations["5"].enabled = false; }, "presentacion_inactiva", /ya no se ofrece/],
    [(p) => { p.status = "hidden"; }, "no_existe", /ya no está en el catálogo/],
  ]) {
    const db = makeDb(); mutate(db.products.get(dune.id));
    const r = await registerOrder(cart([dune, "5", 1], [asad, "full", 1]), cfg, deps(db));
    assert.equal(r.ok, false, reason); assert.equal(r.kind, "unavailable"); assert.equal(r.error.reason, reason);
    assert.match(r.message, text); assert.match(r.message, /Dunescape/);
    assert.equal(db.orders.length, 0, "no debe quedar un pedido a medias");
  }
});
test("pedido: errores de red / servidor → no se afirma que se registró", async () => {
  for (const [mode, kind] of [["down", "network"], ["500", "server"], ["garbage", "bad_response"], ["bad_shape", "bad_response"]]) {
    const db = makeDb(); db.faults = { mode };
    const r = await registerOrder(cart([dune, "5", 1]), cfg, deps(db));
    assert.equal(r.ok, false, mode); assert.equal(r.kind, kind, mode); assert.ok(r.message.length > 10);
    assert.equal(db.orders.length, 0);
  }
  const db = makeDb(); const r = await registerOrder(cart([dune, "5", 1]), { url: URL_, key: "otra-clave" }, deps(db));
  assert.equal(r.ok, false); assert.equal(r.kind, "auth");
  assert.equal((await registerOrder(resolveCart([], PRODUCTOS), cfg, deps(db))).kind, "empty");
});
test("pedido: una venta no confirmada tras un fallo transitorio no deja duplicados al reintentar", async () => {
  const db = makeDb(); const st = memStore(); const s = cart([dune, "5", 1]);
  db.faults = { mode: "down" }; const bad = await registerOrder(s, cfg, { storage: st, fetchImpl: fetchFor(db, KEY) }); assert.equal(bad.ok, false);
  db.faults = null; const a = await registerOrder(s, cfg, { storage: st, fetchImpl: fetchFor(db, KEY) });
  const b = await registerOrder(s, cfg, { storage: st, fetchImpl: fetchFor(db, KEY) });
  assert.equal(a.ok && b.ok, true); assert.equal(a.order.code, b.order.code); assert.equal(db.orders.length, 1);
});
test("validateOrderResponse rechaza respuestas incoherentes", () => {
  const db = makeDb(); const good = createOrder(db, "11111111-1111-4111-8111-111111111111", [{ product_id: dune.id, kind: "5", quantity: 2 }]);
  assert.equal(validateOrderResponse(good), true);
  const clone = () => JSON.parse(JSON.stringify(good));
  assert.equal(validateOrderResponse(null), false);
  assert.equal(validateOrderResponse({ ...clone(), code: "XX-1" }), false);
  assert.equal(validateOrderResponse({ ...clone(), items: [] }), false);
  assert.equal(validateOrderResponse({ ...clone(), total_cop: good.total_cop + 1 }), false);
  const bad = clone(); bad.items[0].subtotal_cop += 1; assert.equal(validateOrderResponse(bad), false);
  const bad2 = clone(); bad2.items[0].quantity = 0; assert.equal(validateOrderResponse(bad2), false);
});

/* ───────── Mensaje de WhatsApp con el código ───────── */
test("mensaje: incluye el código del pedido y se construye con la copia del servidor", async () => {
  const db = makeDb(); const r = await registerOrder(cart([dune, "5", 2], [dune, "10", 1], [asad, "full", 1]), cfg, deps(db));
  const msg = buildMessage(summaryFromOrder(r.order), { code: r.order.code });
  assert.match(msg, new RegExp(`MI PEDIDO\\nCódigo del pedido: ${r.order.code}\\n\\n1\\. Armaf Dunescape`));
  assert.match(msg, /3\. Lattafa Asad\n   - Presentación: Frasco completo \(100 ml\)/);
  assert.match(msg, new RegExp(`TOTAL DEL PEDIDO: \\$${r.order.total_cop.toLocaleString("es-CO").replace(/\./g, "\\.")} COP`));
  assert.doesNotMatch(msg, /confirmado|pagado/i.replace ? /pedido (ya )?(está )?(confirmado|pagado)/i : /x/);
  const s = cart([dune, "5", 2], [dune, "10", 1], [asad, "full", 1]);
  assert.equal(buildMessage(s), buildMessage(s, {}), "sin código el mensaje es idéntico al de antes");
  assert.doesNotMatch(buildMessage(s), /Código del pedido/);
  const co = prepareCheckout(s, "573001234567", { code: r.order.code });
  assert.equal(co.ok, true); assert.ok(new URL(co.url).searchParams.get("text").includes(`Código del pedido: ${r.order.code}`));
});
test("mensaje: el pedido histórico no cambia aunque cambie el catálogo después", async () => {
  const db = makeDb(); const r = await registerOrder(cart([dune, "5", 2]), cfg, deps(db));
  const before = buildMessage(summaryFromOrder(r.order), { code: r.order.code });
  const p = db.products.get(dune.id); p.name = "OTRO NOMBRE"; p.presentations["5"].price = 99999;
  const again = await registerOrder(cart([dune, "5", 2]), cfg, { ...deps(db), storage: undefined });   // otro cliente: pedido nuevo con precios nuevos
  assert.match(buildMessage(summaryFromOrder(again.order), { code: again.order.code }), /OTRO NOMBRE/);
  assert.equal(buildMessage(summaryFromOrder(r.order), { code: r.order.code }), before, "el primero conserva nombre y precio originales");
});

/* ───────── Guardas contra deriva SQL ↔ JavaScript ───────── */
const sql = read("supabase/migrations/0001_init.sql");
test("estados: la tabla de transiciones de la interfaz = la de la base de datos (SQL)", () => {
  const fn = sql.match(/create or replace function public\.order_transition_allowed[\s\S]*?\$\$;/)[0];
  const fromSql = {};
  for (const m of fn.matchAll(/when '(\w+)'\s+then p_to in \(([^)]*)\)/g)) fromSql[m[1]] = [...m[2].matchAll(/'(\w+)'/g)].map((x) => x[1]).sort();
  for (const s of ORDER_STATUSES) assert.deepEqual((fromSql[s] || []).sort(), [...TRANSITIONS[s]].sort(), `transiciones de ${s}`);
  const enumSql = [...sql.match(/status\s+text not null default 'iniciado' check \(status in\s*\(([^)]*)\)/)[1].matchAll(/'(\w+)'/g)].map((x) => x[1]);
  assert.deepEqual(enumSql, ORDER_STATUSES);
  assert.equal(canTransition("iniciado", "pagado"), false); assert.equal(canTransition("confirmado", "pagado"), true);
  assert.ok(TRANSITIONS.entregado.length === 0 && TRANSITIONS.cancelado.length === 0);
});
test("create_order: motivos de rechazo, etiquetas y formato de código coinciden entre SQL y la réplica", () => {
  const fn = sql.match(/create or replace function public\.create_order[\s\S]*?\$\$;/)[0];
  const sqlReasons = [...fn.matchAll(/ITEM_UNAVAILABLE:%:%:(\w+)/g)].map((m) => m[1]).sort();
  const ref = read("tests/helpers/referenceBackend.mjs");
  const refReasons = [...ref.matchAll(/ITEM_UNAVAILABLE:\$\{l\.product_id\}:\$\{l\.kind\}:(\w+)/g)].map((m) => m[1]).sort();
  assert.deepEqual(sqlReasons, refReasons);
  assert.ok(["agotado", "no_existe", "presentacion_inactiva", "sin_precio"].every((r) => sqlReasons.includes(r)));
  for (const label of ["Decant de 5 ml", "Decant de 10 ml", "Frasco completo ("]) { assert.ok(fn.includes(label), `SQL: ${label}`); assert.ok(ref.includes(label), `réplica: ${label}`); }
  assert.ok(fn.includes("'23456789ABCDEFGHJKLMNPQRSTUVWXYZ'") && ref.includes("23456789ABCDEFGHJKLMNPQRSTUVWXYZ"));
  assert.match(fn, /between|> 20|quantity > 20/); assert.match(fn, /> 40/);
  assert.match(fn, /!~ '\^\[0-9\]\{1,9\}\$'/, "validación de formato de product_id antes de convertir tipos");
  assert.match(fn, /!~ '\^\[0-9\]\{1,4\}\$'/, "validación de formato de quantity antes de convertir tipos");
  assert.match(fn, /'iniciado'|default 'iniciado'|status/);
  // el estado inicial lo fija la tabla, y nunca es confirmado/pagado
  assert.match(sql, /status\s+text not null default 'iniciado'/);
});
test("la réplica rechaza lo mismo que el SQL (cantidades, lista, presentación, ids)", () => {
  const db = makeDb(); const ok = (items) => createOrder(db, crypto.randomUUID(), items);
  const bad = (items, code) => assert.throws(() => ok(items), (e) => e instanceof SqlError && e.code === code);
  bad([], "22023"); bad({}, "22023"); bad(Array(41).fill({ product_id: dune.id, kind: "5", quantity: 1 }), "22023");
  bad([{ product_id: dune.id, kind: "5", quantity: 21 }], "22023"); bad([{ product_id: dune.id, kind: "5", quantity: 0 }], "22023");
  bad([{ product_id: dune.id, kind: "x", quantity: 1 }], "22023");
  for (const q of ["abc", 1.5, null, -3]) bad([{ product_id: dune.id, kind: "5", quantity: q }], "22023");   // cantidades no enteras o negativas
  bad([{ product_id: "x", kind: "5", quantity: 1 }], "22023"); bad([1, "a"], "22023");
  bad([{ product_id: 99999, kind: "5", quantity: 1 }], "P0001"); bad([{ product_id: sold.id, kind: "full", quantity: 1 }], "P0001");
  assert.equal(ok([{ product_id: dune.id, kind: "5", quantity: 1 }, { product_id: dune.id, kind: "5", quantity: 2 }]).items[0].quantity, 3, "agrupa líneas repetidas");
  assert.throws(() => createOrder(db, null, [{ product_id: dune.id, kind: "5", quantity: 1 }]), (e) => e.code === "22023");
});

/* ───────── Seguridad del frontend ───────── */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (["node_modules", "dist", ".git"].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
test("ningún secreto privilegiado en el código ni en los archivos públicos (service_role, sb_secret_, JWT embebidos)", () => {
  const files = [...walk(path.join(root, "src")), path.join(root, "index.html"), ...walk(path.join(root, "public")).filter((f) => /\.(html|js|json|txt|xml|svg|css)$/.test(f)), path.join(root, "netlify.toml"), path.join(root, ".env.example"), path.join(root, "package.json")];
  for (const f of files) {
    const t = readFileSync(f, "utf8"), rel = path.relative(root, f);
    assert.doesNotMatch(t, /sb_secret_[A-Za-z0-9_-]{10,}/, rel);
    assert.doesNotMatch(t, /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/, `${rel}: parece un JWT embebido`);
    // La palabra solo puede aparecer en el detector (backendConfigCore.js) y en avisos de documentación (.env.example, README, docs).
    if (!/backendConfigCore\.js$|\.env\.example$/.test(f)) assert.doesNotMatch(t, /service_role/i, `${rel}: menciona service_role`);
  }
});
test("solo se leen variables VITE_ públicas conocidas; el .env.example no trae valores", () => {
  const known = new Set(["VITE_WHATSAPP_NUMBER", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_ENABLE_ADMIN", "VITE_ADMIN_PIN"]);
  const used = new Set(walk(path.join(root, "src")).flatMap((f) => [...readFileSync(f, "utf8").matchAll(/import\.meta\.env\.(VITE_\w+)/g)].map((m) => m[1])));
  for (const v of used) assert.ok(known.has(v), `variable VITE_ desconocida: ${v}`);
  for (const v of used) assert.doesNotMatch(v, /SECRET|SERVICE|PRIVATE|PASSWORD|TOKEN/i, v);
  for (const line of read(".env.example").split("\n").filter((l) => /^[A-Z_]+=/.test(l))) assert.match(line, /^[A-Z_]+=$/, `.env.example no debe traer valores: ${line}`);
  assert.ok(existsSync(path.join(root, ".env.example")));
});
test("la CSP permite conectar con Supabase y con nadie más; el resto sigue estricto", () => {
  const csp = read("netlify.toml").match(/Content-Security-Policy\s*=\s*"([^"]+)"/)[1];
  const connect = csp.split(";").map((s) => s.trim()).find((s) => s.startsWith("connect-src"));
  assert.equal(connect, "connect-src 'self' https://*.supabase.co");
  assert.doesNotMatch(csp, /script-src[^;]*(unsafe-inline|unsafe-eval|\*)/);
  assert.match(csp, /frame-ancestors 'none'/);
});
test("el cliente nunca usa localStorage para decidir permisos (no hay PIN ni banderas de administrador en el cliente de pedidos)", () => {
  for (const f of ["src/backend/orders.js", "src/backend/http.js", "src/backend/config.js"]) assert.doesNotMatch(read(f), /isAdmin|ADMIN_PIN|localStorage\.setItem\(['"`]admin/i, f);
});

/* ───────── Semilla del catálogo ───────── */
test("la semilla SQL coincide con src/data/products.js (npm run db:seed:check)", () => {
  const out = execFileSync(process.execPath, [path.join(root, "scripts", "export-seed-sql.mjs"), "--check"], { encoding: "utf8" });
  assert.match(out, /al día/);
  const seed = read("supabase/seed/0002_catalog_seed.sql");
  const productsBlock = seed.slice(seed.indexOf('insert into public.products'), seed.indexOf('insert into public.product_presentations'));
  assert.equal([...productsBlock.matchAll(/^  \((\d+), '/gm)].length, PRODUCTOS.length, 'una fila por perfume');
  assert.equal([...seed.slice(seed.indexOf('insert into public.product_presentations')).matchAll(/^  \((\d+), '(5|10|full)', true, /gm)].length, PRODUCTOS.length * 3, 'tres presentaciones por perfume');
  for (const p of PRODUCTOS) for (const [k, v] of [["5", p.precioDecant5], ["10", p.precioDecant10], ["full", p.precioFrasco]])
    assert.ok(seed.includes(`(${p.id}, '${k}', true, ${v === null ? "null" : v})`), `precio ${p.slug} ${k}`);
  assert.match(seed, /on conflict \(id\) do nothing/); assert.match(seed, /on conflict \(product_id, kind\) do nothing/);
  assert.doesNotMatch(seed, /\b(delete|drop|truncate|update)\b/i);
});
