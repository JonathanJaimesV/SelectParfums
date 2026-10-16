import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import { defaultSizeKey, formatPrice, perfumeSlug, sizeOptions } from "../utils";

export default function ProductCard({ p }) {
  const [imgFailed, setImgFailed] = useState(false);
  const opts = sizeOptions(p);
  const [key, setKey] = useState(() => defaultSizeKey(p));
  const sel = opts.find((o) => o.key === key) || opts[0];
  const src = p.imagen || (Array.isArray(p.imagenes) ? p.imagenes.find(Boolean) : null);
  const consult = sel.price == null;

  return (
    <Reveal as="article" className="product-card">
      <div className="product-card__media">
        {src && !imgFailed ? (
          <img src={src} alt="" loading="lazy" decoding="async" onError={() => setImgFailed(true)} />
        ) : (
          <span className="product-card__image-placeholder">Imagen del perfume</span>
        )}
        {p.disponibilidad && (
          <span className={`product-card__badge${p.disponibilidad === "Agotado" ? " product-card__badge--agotado" : ""}`}>{p.disponibilidad}</span>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__brand">{p.marca}</p>
        <h3 className="product-card__name">
          {/* La selección de formato viaja en la URL para abrir la ficha con ese formato ya elegido */}
          <Link to={`/perfume/${perfumeSlug(p)}?t=${sel.key}`} className="product-card__link" aria-label={`Ver detalles de ${p.marca} ${p.nombre}`}>
            {p.nombre}
          </Link>
        </h3>
        <p className="product-card__desc">{p.descripcion}</p>

        <div className="size-pills" role="radiogroup" aria-label={`Formato de ${p.nombre}`}>
          {opts.map((o) => (
            <button key={o.key} type="button" role="radio" aria-checked={o.key === sel.key}
              className={`size-pill${o.price == null ? " is-consult" : ""}`} onClick={() => setKey(o.key)}>
              {o.short}
            </button>
          ))}
        </div>
        <p className="product-card__price" aria-live="polite">
          <span className="product-card__price-label">{sel.label}</span>
          <span className={`product-card__price-value${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
        </p>
      </div>
    </Reveal>
  );
}
