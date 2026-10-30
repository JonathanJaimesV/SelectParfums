// npm test  →  node --test
import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTOS } from "../src/data/products.js";
import { sizeOptions } from "../src/pricing.js";
import {
  addItem, setQty, removeItem, parseStored, serialize, resolveCart, buildMessage, prepareCheckout,
  isValidWaNumber, MAX_QTY, MAX_WA_URL, lineKey,
} from "../src/cart/cartLogic.js";

const NUM = "573001234567";
const byslug = (s) => PRODUCTOS.find((p) => p.slug === s);
const dune = byslug("dunescape");          // 5 ml, 10 ml y frasco con precio
const asad = byslug("asad");               // solo frasco con precio
const sold = PRODUCTOS.find((p) => p.disponibilidad === "Agotado");
const price = (p, key) => sizeOptions(p).find((o) => o.key === key).price;
const cart = (...rows) => rows.reduce((it, [p, k, q]) => addItem(it, p.id, k, q), []);

test("datos de partida: Dunescape tiene las 3 presentaciones con precio; Asad solo frasco", () => {
  assert.ok(sizeOptions(dune).every((o) => Number.isInteger(o.price) && o.price > 0));
  assert.equal(price(asad, "5"), null);
  assert.ok(sold);
});

test("1-3) cada presentación se agrega con su propio precio", () => {
  for (const key of ["5", "10", "full"]) {
    const s = resolveCart(cart([dune, key, 1]), PRODUCTOS);
    assert.equal(s.lines[0].status, "ok");
    assert.equal(s.lines[0].unitPrice, price(dune, key));
    assert.equal(s.total, price(dune, key));
  }
});

test("4) agregar el mismo artículo suma cantidades en UNA línea", () => {
  const it = cart([dune, "5", 2], [dune, "5", 3]);
  assert.equal(it.length, 1);
  assert.equal(it[0].qty, 5);
});

test("5) presentaciones distintas del mismo perfume son líneas separadas", () => {
  const it = cart([dune, "5", 2], [dune, "10", 1]);
  assert.equal(it.length, 2);
  assert.notEqual(lineKey(it[0].id, it[0].size), lineKey(it[1].id, it[1].size));
});

test("6-7) varios perfumes: subtotales y total correctos; cambiar cantidades recalcula", () => {
  let it = cart([dune, "5", 2], [dune, "10", 1], [asad, "full", 1]);
  let s = resolveCart(it, PRODUCTOS);
  assert.equal(s.total, 2 * price(dune, "5") + price(dune, "10") + price(asad, "full"));
  assert.equal(s.units, 4);
  it = setQty(it, lineKey(dune.id, "5"), 4);
  s = resolveCart(it, PRODUCTOS);
  assert.equal(s.total, 4 * price(dune, "5") + price(dune, "10") + price(asad, "full"));
  assert.equal(s.lines[0].subtotal, 4 * price(dune, "5"));
});

test("cantidad: mínimo 1 al sumar, máximo MAX_QTY, y bajar a 0 elimina la línea", () => {
  assert.equal(cart([dune, "5", 999])[0].qty, MAX_QTY);
  assert.equal(addItem(cart([dune, "5", MAX_QTY]), dune.id, "5", 5)[0].qty, MAX_QTY);
  assert.equal(setQty(cart([dune, "5", 2]), lineKey(dune.id, "5"), 0).length, 0);
  assert.equal(cart([dune, "5", -4])[0].qty, 1);
  assert.equal(cart([dune, "5", NaN])[0].qty, 1);
});

test("8-9) eliminar y vaciar", () => {
  let it = cart([dune, "5", 2], [asad, "full", 1]);
  it = removeItem(it, lineKey(dune.id, "5"));
  const s = resolveCart(it, PRODUCTOS);
  assert.equal(s.lines.length, 1);
  assert.equal(s.total, price(asad, "full"));
  assert.equal(resolveCart([], PRODUCTOS).total, 0);
});

test("10) persistencia: serialize → parseStored devuelve lo mismo y solo guarda id/size/qty (sin precios ni datos personales)", () => {
  const it = cart([dune, "5", 2], [asad, "full", 1]);
  const raw = serialize(it);
  assert.deepEqual(parseStored(raw).items, it);
  const stored = JSON.parse(raw);
  for (const row of stored.items) assert.deepEqual(Object.keys(row).sort(), ["id", "qty", "size"]);
  assert.ok(!/precio|price|nombre|name/i.test(raw));
});

test("11) datos guardados corruptos o antiguos no rompen nada", () => {
  assert.deepEqual(parseStored(null), { items: [], dropped: 0 });
  assert.equal(parseStored("{no es json").items.length, 0);
  assert.equal(parseStored('"hola"').items.length, 0);
  assert.equal(parseStored("123").items.length, 0);
  const mixed = JSON.stringify({ v: 1, items: [
    { id: 3, size: "5", qty: 2 }, { id: 3, size: "5", qty: 1 },        // duplicado → se fusiona
    { id: "x", size: "5", qty: 1 }, { id: 3, size: "7", qty: 1 },       // id y size inválidos
    { id: 3, size: "10", qty: 0 }, { id: 3, size: "10", qty: "abc" },   // qty inválida
    null, 5, { id: 14, size: "full", qty: 9999 },                       // qty enorme → tope
  ] });
  const r = parseStored(mixed);
  assert.deepEqual(r.items, [{ id: 3, size: "5", qty: 3 }, { id: 14, size: "full", qty: MAX_QTY }]);
  assert.equal(r.dropped, 6);
  assert.deepEqual(parseStored(JSON.stringify([{ id: 3, size: "5", qty: 2 }])).items, [{ id: 3, size: "5", qty: 2 }]); // formato viejo: array suelto
});

test("11a) un perfume que ya no existe no cuenta como unidad ni se muestra (evita pantalla en blanco)", () => {
  const s = resolveCart([{ id: 99999, size: "5", qty: 4 }, ...cart([dune, "5", 2])], PRODUCTOS);
  assert.equal(s.units, 2);
  assert.equal(s.missing, 1);
  assert.equal(s.lines.filter((l) => l.product).length, 1);
  assert.ok(s.lines.filter((l) => l.product).every((l) => typeof l.product.slug === "string"));
});

test("11b) producto que ya no existe, agotado o presentación sin precio: se marca y bloquea el checkout", () => {
  const s1 = resolveCart([{ id: 99999, size: "5", qty: 1 }], PRODUCTOS);
  assert.equal(s1.lines[0].status, "missing");
  assert.equal(prepareCheckout(s1, NUM).reason, "empty");
  const s2 = resolveCart([...cart([dune, "5", 1]), { id: sold.id, size: "full", qty: 1 }], PRODUCTOS);
  assert.equal(s2.lines[1].status, "soldout");
  assert.equal(s2.total, price(dune, "5"));                       // lo agotado NO suma
  assert.equal(prepareCheckout(s2, NUM).reason, "blocked");
  const s3 = resolveCart(cart([dune, "5", 1], [asad, "5", 1]), PRODUCTOS); // Asad no tiene decant 5 ml
  assert.equal(s3.lines[1].status, "noprice");
  assert.equal(s3.lines[1].unitPrice, null);
  assert.equal(prepareCheckout(s3, NUM).reason, "blocked");
});

test("los precios salen SIEMPRE del catálogo vigente (un cambio de precio se refleja, no se usa el viejo)", () => {
  const it = cart([dune, "full", 2]);
  const cheaper = PRODUCTOS.map((p) => (p.id === dune.id ? { ...p, precioFrasco: 100000 } : p));
  assert.equal(resolveCart(it, cheaper).total, 200000);
  assert.equal(resolveCart(it, PRODUCTOS).total, 2 * dune.precioFrasco);
});

test("13) el mensaje contiene todo: productos, presentaciones, cantidades, unitarios, subtotales y total", () => {
  const s = resolveCart(cart([dune, "5", 2], [dune, "10", 1], [asad, "full", 1]), PRODUCTOS);
  const m = buildMessage(s);
  assert.match(m, /^Hola, Select Parfums Colombia\. Quiero realizar el siguiente pedido:/);
  assert.match(m, /MI PEDIDO/);
  assert.match(m, /1\. Armaf Dunescape\n   - Presentación: Decant de 5 ml/);
  assert.match(m, /2\. Armaf Dunescape\n   - Presentación: Decant de 10 ml/);
  assert.match(m, /3\. Lattafa Asad\n   - Presentación: Frasco completo/);
  assert.match(m, /   - Cantidad: 2\n   - Precio unitario: \$23\.000 COP\n   - Subtotal: \$46\.000 COP/);
  assert.match(m, /   - Cantidad: 1\n   - Precio unitario: \$33\.000 COP\n   - Subtotal: \$33\.000 COP/);
  assert.match(m, /Precio unitario: \$185\.000 COP\n   - Subtotal: \$185\.000 COP/);
  assert.match(m, /TOTAL DEL PEDIDO: \$264\.000 COP/);
  assert.match(m, /Quedo atento a la confirmación de disponibilidad/);
  assert.ok(!/confirmado|pagado|pago realizado/i.test(m.replace("confirmación", "")));
  // los 3 artículos aparecen una sola vez
  assert.equal((m.match(/Presentación:/g) || []).length, 3);
});

test("14) caracteres especiales y saltos de línea: el enlace es válido y se decodifica idéntico", () => {
  const weird = PRODUCTOS.map((p) => (p.id === dune.id ? { ...p, nombre: `Dunescape "Édición" & Co. 100% ñandú #1 + más?` } : p));
  const s = resolveCart(cart([dune, "5", 1]), weird);
  const r = prepareCheckout(s, NUM);
  assert.equal(r.ok, true);
  assert.match(r.url, /^https:\/\/wa\.me\/573001234567\?text=[A-Za-z0-9%._~!*'()-]+$/); // nada sin codificar
  assert.ok(!/\s/.test(r.url));
  const text = new URL(r.url).searchParams.get("text");
  assert.equal(text, r.message);                                    // ida y vuelta exacta
  assert.ok(r.message.includes('Armaf Dunescape "Édición" & Co. 100% ñandú #1 + más?'));
  assert.ok(r.url.includes("%0A"));                                 // saltos de línea codificados
});

test("15) sin número válido de WhatsApp no se genera ningún enlace", () => {
  const s = resolveCart(cart([dune, "5", 1]), PRODUCTOS);
  for (const bad of ["", undefined, null, "abc", "123", "+57 300 123 4567", "0573001234567", "57300123456789012345"]) {
    const r = prepareCheckout(s, bad);
    assert.equal(r.ok, false, String(bad));
    assert.equal(r.reason, "no-number");
    assert.equal(r.url, undefined);
  }
  assert.ok(isValidWaNumber("573156504121"));
});

test("carrito vacío no genera checkout", () => {
  assert.equal(prepareCheckout(resolveCart([], PRODUCTOS), NUM).reason, "empty");
});

test("pedido demasiado largo: error explícito con alternativa, sin recortar en silencio", () => {
  let it = [];
  for (const p of PRODUCTOS.filter((x) => x.disponibilidad !== "Agotado")) for (const o of sizeOptions(p)) if (o.price) it = addItem(it, p.id, o.key, MAX_QTY);
  const s = resolveCart(it, PRODUCTOS);
  const r = prepareCheckout(s, NUM);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "too-long");
  assert.equal(r.chatUrl, `https://wa.me/${NUM}`);
  assert.equal((r.message.match(/Presentación:/g) || []).length, s.lines.length); // el mensaje completo se conserva para copiar
  assert.ok(`https://wa.me/${NUM}?text=${encodeURIComponent(r.message)}`.length > MAX_WA_URL);
});

test("pedido normal (3 artículos) cabe holgadamente en el enlace", () => {
  const r = prepareCheckout(resolveCart(cart([dune, "5", 2], [dune, "10", 1], [asad, "full", 1]), PRODUCTOS), NUM);
  assert.equal(r.ok, true);
  assert.ok(r.url.length < MAX_WA_URL / 2);
});

test("Preventa se indica en el mensaje; Disponible no", () => {
  const pre = PRODUCTOS.find((p) => p.disponibilidad === "Preventa" && p.precioFrasco);
  const avail = PRODUCTOS.find((p) => p.disponibilidad === "Disponible" && p.precioFrasco);
  assert.match(buildMessage(resolveCart(cart([pre, "full", 1]), PRODUCTOS)), /Disponibilidad: Preventa/);
  assert.doesNotMatch(buildMessage(resolveCart(cart([avail, "full", 1]), PRODUCTOS)), /Disponibilidad:/);
});
