import { useEffect, useState } from "react";
import { WHATSAPP_NUMBER } from "./config";

export const formatPrice = (v) => (v == null ? "Consultar" : "$" + v.toLocaleString("es-CO"));
export const waUrl = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
export const WA_GENERIC = waUrl("Hola, estoy interesado en sus fragancias de SelectParfums. ¿Me pueden ayudar?");
export const useTitle = (t) => useEffect(() => { document.title = t; }, [t]);

/**
 * Las 3 imágenes del carrusel: principal + 2 adicionales.
 * Por defecto las adicionales se buscan con el mismo nombre + "-2" y "-3"
 * (ej. armaf-dunescape.jpg → armaf-dunescape-2.jpg y armaf-dunescape-3.jpg).
 * Si quieres otros nombres, agrega `imagenes: ["/ruta1.jpg", "/ruta2.jpg", "/ruta3.jpg"]` al perfume.
 */
export const galleryOf = (p) => {
  const hasImgs = Array.isArray(p.imagenes) && p.imagenes.some(Boolean);
  if (hasImgs) return [0, 1, 2].map((i) => p.imagenes[i] || null);
  const main = p.imagen || (Array.isArray(p.imagenes) ? p.imagenes.find(Boolean) : null);
  if (!main) return [null, null, null];
  const extra = (n) => main.replace(/(\.\w+)$/, `-${n}$1`);
  return [main, extra(2), extra(3)];
};

/** "Club de Nuit Intense Man EDT" → "club-de-nuit-intense-man-edt" (para la URL) */
export const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const perfumeSlug = (p) => p.slug || slugify(p.nombre);

/** Formatos de compra de un perfume: decants de 5 y 10 ml + frasco completo. */
export const sizeOptions = (p) => [
  { key: "5", type: "Decant", size: "5 ml", short: "5 ml", label: "Decant 5 ml", price: p.precioDecant5 },
  { key: "10", type: "Decant", size: "10 ml", short: "10 ml", label: "Decant 10 ml", price: p.precioDecant10 },
  { key: "full", type: "Frasco", size: p.tamanoFrasco, short: "Frasco", label: `Frasco ${p.tamanoFrasco}`, price: p.precioFrasco },
];
/** Formato inicial: el más pequeño que tenga precio (si ninguno, el frasco). */
export const defaultSizeKey = (p) => (sizeOptions(p).find((o) => o.price != null) || { key: "full" }).key;

/** Hook para `matchMedia` (p. ej. cambiar acordeón ↔ tarjetas según el ancho). */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
};
