// Precios y presentaciones: ÚNICA fuente de formato y reglas de precio de la tienda.
// Lógica pura (sin React) para poder probarla con `npm test`.
// Los precios viven en src/data/products.js: precioDecant5, precioDecant10 y precioFrasco (COP, enteros; null = "Consultar").

/** Un precio es válido si es un entero positivo (COP no usa decimales). */
export const isValidPrice = (v) => Number.isSafeInteger(v) && v > 0;

/** 1234567 → "1.234.567" (no depende de Intl/ICU: igual en todos los navegadores y en Node). */
export const formatCOP = (v) => String(Math.trunc(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** "$190.000" o "Consultar" si la presentación no tiene precio válido. */
export const formatPrice = (v) => (isValidPrice(v) ? "$" + formatCOP(v) : "Consultar");

/** Formatos de compra de un perfume: decants de 5 y 10 ml + frasco completo. */
export const sizeOptions = (p) => [
  { key: "5", type: "Decant", size: "5 ml", short: "5 ml", label: "Decant 5 ml", price: p.precioDecant5 },
  { key: "10", type: "Decant", size: "10 ml", short: "10 ml", label: "Decant 10 ml", price: p.precioDecant10 },
  { key: "full", type: "Frasco", size: p.tamanoFrasco, short: "Frasco", label: `Frasco ${p.tamanoFrasco}`, price: p.precioFrasco },
];

/** Formato inicial: el frasco completo; si no tiene precio, el primer formato que sí lo tenga. */
export const defaultSizeKey = (p) => {
  const o = sizeOptions(p);
  return (o.find((x) => x.key === "full" && isValidPrice(x.price)) || o.find((x) => isValidPrice(x.price)) || o[2]).key;
};

export const isSoldOut = (p) => p.disponibilidad === "Agotado";

/** Nombre de la presentación tal como se muestra en el carrito y en el mensaje de WhatsApp. */
export const presentationName = (p, key) =>
  key === "5" ? "Decant de 5 ml" : key === "10" ? "Decant de 10 ml" : `Frasco completo${p?.tamanoFrasco ? ` (${p.tamanoFrasco})` : ""}`;
