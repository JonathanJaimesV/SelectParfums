// Metadatos de cada ruta: lógica PURA (sin React ni DOM). La usan la app (src/seo.js, vía las páginas)
// y el build (scripts/postbuild.mjs, para el HTML por ruta opcional), así NUNCA se desincronizan.
import { isValidPrice, sizeOptions } from "./pricing.js";

export const SITE_NAME = "SelectParfums Colombia";

const SCHEMA_AVAILABILITY = {
  Disponible: "https://schema.org/InStock",
  Preventa: "https://schema.org/PreOrder",
  Agotado: "https://schema.org/OutOfStock",
};

const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const slugOf = (p) => p.slug || slugify(p.nombre);

export const STATIC_SEO = {
  "/": {
    title: "SelectParfums Colombia — Fragancias árabes y de nicho | Frascos y decants",
    description: "Perfumería árabe y de nicho en Colombia: frascos completos y decants de 5 ml y 10 ml de Afnan, Armaf, French Avenue, Lattafa y Rasasi. Pedidos por WhatsApp.",
  },
  "/catalogo": {
    title: "Catálogo de fragancias árabes y de nicho | SelectParfums",
    description: "Explora fragancias árabes y de nicho en frasco completo o decant de 5 ml y 10 ml. Busca por nombre o marca y arma tu pedido para finalizarlo por WhatsApp.",
  },
  "/marcas": {
    title: "Marcas de perfumería árabe: Afnan, Armaf, Lattafa y más | SelectParfums",
    description: "Conoce las casas de perfumería árabe y de nicho que ofrecemos y explora la colección de cada una.",
  },
  "/decants": {
    title: "¿Qué es un decant? Formatos de 5 ml y 10 ml | SelectParfums",
    description: "Guía de decants: qué son, cuánto rinden los formatos de 5 ml y 10 ml y cuándo conviene probar antes de comprar el frasco.",
  },
  "/como-pedir": {
    title: "Cómo hacer tu pedido por WhatsApp | SelectParfums",
    description: "Arma tu pedido en la tienda y finalízalo por WhatsApp: allí se confirman disponibilidad, pago y envío a Cúcuta y Bogotá.",
  },
};
// Cada entrada lleva su ruta (la página la pasa tal cual a useSeo)
for (const [path, v] of Object.entries(STATIC_SEO)) v.path = path;

const abs = (siteUrl, p) => (/^https?:/.test(p) ? p : `${siteUrl}${p}`);
const mainImage = (p) => p.imagen || (Array.isArray(p.imagenes) ? p.imagenes.find(Boolean) : null) || null;

/** Datos estructurados solo con información real del catálogo (sin reseñas ni valoraciones inventadas). */
export function productJsonLd(p, siteUrl) {
  const url = `${siteUrl}/perfume/${slugOf(p)}`;
  const img = mainImage(p);
  const offers = sizeOptions(p).filter((o) => isValidPrice(o.price)).map((o) => ({
    "@type": "Offer",
    name: o.label,
    price: o.price,
    priceCurrency: "COP",
    url,
    ...(SCHEMA_AVAILABILITY[p.disponibilidad] ? { availability: SCHEMA_AVAILABILITY[p.disponibilidad] } : {}),
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.marca} ${p.nombre}`,
    brand: { "@type": "Brand", name: p.marca },
    ...(p.descripcion ? { description: p.descripcion } : {}),
    ...(img ? { image: [abs(siteUrl, img)] } : {}),
    sku: String(p.id),
    ...(offers.length ? { offers } : {}),
  };
}

/** Título, descripción, ruta, imagen y JSON-LD de la ficha de un perfume. */
export function productSeo(p, siteUrl) {
  const desc = (p.descripcion || "fragancia árabe y de nicho").trim();
  const short = desc.length > 120 ? `${desc.slice(0, 120).trim()}…` : desc;
  return {
    title: `${p.marca} ${p.nombre} — frasco y decants | ${SITE_NAME}`,
    description: `${p.marca} ${p.nombre}: ${short} Frasco ${p.tamanoFrasco} y decants de 5 ml y 10 ml.`,
    path: `/perfume/${slugOf(p)}`,
    image: mainImage(p) || undefined,
    jsonLd: productJsonLd(p, siteUrl),
  };
}
