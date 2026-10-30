import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "./config";

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  return el;
};
const setMeta = (attr, key, content) => {
  if (content == null) return;
  upsert(`meta[${attr}="${key}"]`, () => { const m = document.createElement("meta"); m.setAttribute(attr, key); return m; })
    .setAttribute("content", content);
};

/**
 * Metadatos por ruta (título, descripción, canonical, Open Graph, robots y JSON-LD).
 * Se aplican en el cliente; los rastreadores que ejecutan JavaScript (Google) los leen.
 * `path` es la ruta canónica ("/catalogo", "/perfume/asad"); `image` puede ser relativa.
 */
export function useSeo({ title, description, path = "/", image, noindex = false, jsonLd = null }) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    const img = image ? (/^https?:/.test(image) ? image : `${SITE_URL}${image}`) : `${SITE_URL}/assets/images/og-cover.jpg`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", img);
    upsert('link[rel="canonical"]', () => { const l = document.createElement("link"); l.rel = "canonical"; return l; }).href = url;
    setMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");

    // El HTML por ruta (prerender opcional del build) trae su JSON-LD con data-seo="static": al arrancar la app lo reemplaza este
    document.head.querySelectorAll('script[data-seo="static"]').forEach((el) => el.remove());
    let script;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "route";
      script.textContent = ld;
      document.head.appendChild(script);
    }
    return () => { script?.remove(); };
  }, [title, description, path, image, noindex, ld]);
}
