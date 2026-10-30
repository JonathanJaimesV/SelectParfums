import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { WHATSAPP_NUMBER } from "../config";
import { isValidPrice, sizeOptions, isSoldOut, presentationName } from "../pricing.js";
import {
  STORAGE_KEY, MAX_QTY, lineKey, clampQty, addItem, removeItem, setQty, parseStored, serialize, resolveCart, prepareCheckout,
} from "./cartLogic.js";

const CartContext = createContext(null);

// localStorage puede no existir (SSR/modo privado) o lanzar errores: nunca debe tumbar la tienda.
function load() {
  try { return parseStored(window.localStorage.getItem(STORAGE_KEY)); } catch { return { items: [], dropped: 0 }; }
}

export function CartProvider({ children }) {
  const { productos } = useCatalog();
  const first = useRef(null);
  if (first.current === null) first.current = load();

  const [items, setItems] = useState(first.current.items);
  const [notice, setNotice] = useState(
    first.current.dropped ? "Descartamos algunos artículos guardados porque tenían datos no válidos." : null
  );
  const [toast, setToast] = useState(null);
  const [persistError, setPersistError] = useState(false);

  // Persistencia: solo { id, size, qty } (sin precios ni datos personales)
  useEffect(() => {
    try {
      if (items.length === 0) window.localStorage.removeItem(STORAGE_KEY);
      else {
        const data = serialize(items);
        if (window.localStorage.getItem(STORAGE_KEY) !== data) window.localStorage.setItem(STORAGE_KEY, data);
      }
      setPersistError(false);
    } catch { setPersistError(true); }
  }, [items]);

  // Sincroniza varias pestañas abiertas de la tienda
  useEffect(() => {
    const onStorage = (e) => { if (e.key === null || e.key === STORAGE_KEY) setItems(load().items); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Perfumes que ya no existen en el catálogo: se quitan avisando (nunca en silencio)
  useEffect(() => {
    if (!productos.length) return;
    const ids = new Set(productos.map((p) => String(p.id)));
    const gone = items.filter((i) => !ids.has(String(i.id))).length;
    if (!gone) return;
    setItems((prev) => prev.filter((i) => ids.has(String(i.id))));
    setNotice(`Quitamos ${gone} ${gone === 1 ? "artículo que ya no está" : "artículos que ya no están"} en el catálogo.`);
  }, [productos, items]);

  const summary = useMemo(() => resolveCart(items, productos), [items, productos]);

  const add = useCallback((product, sizeKey, qty = 1) => {
    const opt = sizeOptions(product).find((o) => o.key === sizeKey);
    if (!opt) return { ok: false, reason: "invalid" };
    if (isSoldOut(product)) return { ok: false, reason: "soldout" };
    if (!isValidPrice(opt.price)) return { ok: false, reason: "noprice" };
    const current = items.find((i) => lineKey(i.id, i.size) === lineKey(product.id, sizeKey));
    const capped = (current?.qty ?? 0) + clampQty(qty) > MAX_QTY;
    setItems((prev) => addItem(prev, product.id, sizeKey, qty));
    setToast({ id: Date.now(), name: `${product.marca} ${product.nombre}`.trim(), presentation: presentationName(product, sizeKey), capped });
    return { ok: true, capped };
  }, [items]);

  const value = useMemo(() => ({
    items, summary, units: summary.units, notice, toast, persistError,
    whatsappNumber: WHATSAPP_NUMBER,
    add,
    setQuantity: (key, qty) => setItems((prev) => setQty(prev, key, qty)),
    remove: (key) => setItems((prev) => removeItem(prev, key)),
    clear: () => setItems([]),
    dismissNotice: () => setNotice(null),
    dismissToast: () => setToast(null),
    checkout: () => prepareCheckout(summary, WHATSAPP_NUMBER),
  }), [items, summary, notice, toast, persistError, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
