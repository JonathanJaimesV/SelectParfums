import { useEffect, useState } from "react";
import { WHATSAPP_NUMBER } from "./config";
import { IMAGE_MANIFEST } from "./data/imageManifest";
import { formatPrice, sizeOptions, defaultSizeKey, isSoldOut } from "./pricing";

// Formato y reglas de precio centralizados en ./pricing (se reexportan para no romper imports existentes)
export { formatPrice, sizeOptions, defaultSizeKey, isSoldOut };

export const waUrl = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
export const WA_GENERIC = waUrl("Hola, estoy interesado en sus fragancias de SelectParfums. ¿Me pueden ayudar?");

/**
 * Fotos del carrusel: principal + hasta 2 adicionales (máx. 3).
 * Cada hueco se resuelve así: 1) la ruta explícita en `imagenes[i]` del perfume, si existe;
 * 2) si no, un nombre por convención a partir de la principal en la MISMA carpeta:
 *    khamrah-1.jpg → khamrah-2.jpg y khamrah-3.jpg   |   armaf-dunescape.jpg → armaf-dunescape-2.jpg y -3.jpg
 * En producción solo se incluyen las fotos que existen en public/ (lista generada en cada build por
 * scripts/gen-image-manifest.mjs): el carrusel muestra puntos/flechas solo con varias fotos y el navegador
 * no pide archivos inexistentes. En `npm run dev` se prueban todas (onError descarta las rotas).
 */
const imageExists = (src) =>
  !src || import.meta.env.DEV || !src.startsWith("/assets/images/") || IMAGE_MANIFEST.has(src);

const autoName = (main, n) => {
  if (!main || !main.startsWith("/assets/")) return null; // data: / https: → sin nombre automático
  return /-1\.\w+$/.test(main) ? main.replace(/-1(\.\w+)$/, `-${n}$1`) : main.replace(/(\.\w+)$/, `-${n}$1`);
};

/**
 * Miniatura para tarjetas/carrito: <foto>-card.jpg (generada con `npm run images:thumbs`).
 * Si no existe (foto nueva sin miniatura, imagen externa o data:) se usa la foto original: nunca queda rota.
 */
export const thumbOf = (src) => {
  if (!src || !/^\/assets\/images\/.+\.jpe?g$/i.test(src)) return src;
  const thumb = src.replace(/\.jpe?g$/i, "-card.jpg");
  return IMAGE_MANIFEST.has(thumb) ? thumb : src;
};

/**
 * srcset para fotos grandes (hero, ficha): variante de 800 px para móviles + original de 1200 px.
 * Devuelve undefined si no hay variante (el navegador usa solo `src`).
 */
export const srcSetOf = (src) => {
  if (!src || !/^\/assets\/images\/.+\.jpe?g$/i.test(src)) return undefined;
  const small = src.replace(/\.jpe?g$/i, "-800.jpg");
  return IMAGE_MANIFEST.has(small) ? `${small} 800w, ${src} 1200w` : undefined;
};

/** Solo lo que el perfume define explícitamente (sin nombres por convención): es lo que edita el panel admin. */
export const explicitGallery = (p) => {
  const arr = Array.isArray(p.imagenes) ? p.imagenes : [];
  return [arr[0] || p.imagen || null, arr[1] || null, arr[2] || null];
};

export const galleryOf = (p) => {
  const arr = Array.isArray(p.imagenes) ? p.imagenes : [];
  const main = arr[0] || p.imagen || arr.find(Boolean) || null;
  if (!main) return [null, null, null];
  const list = [main, arr[1] || autoName(main, 2), arr[2] || autoName(main, 3)];
  // la principal siempre se intenta; las adicionales solo si existen
  return list.map((src, i) => (i === 0 || imageExists(src) ? src : null));
};

/** "Club de Nuit Intense Man EDT" → "club-de-nuit-intense-man-edt" (para la URL) */
export const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const perfumeSlug = (p) => p.slug || slugify(p.nombre);

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

/* ───────── Búsqueda y disponibilidad ───────── */

// Búsqueda y precio de entrada: lógica pura en ./catalogQuery.js (re-exportada para no romper imports)
export { normalize, searchText, matchesQuery, entryPrice } from "./catalogQuery.js";

/* ───────── URLs y mensajes ───────── */
export const perfumePath = (p) => `/perfume/${perfumeSlug(p)}`;
