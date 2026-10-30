import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import AddToCartButton from "../cart/AddToCartButton.jsx";
import { defaultSizeKey, formatPrice, isSoldOut, perfumeSlug, sizeOptions, thumbOf } from "../utils";

export default function ProductCard({ p, eager = false, featured = false }) {
  const [imgFailed, setImgFailed] = useState(false);
  const opts = sizeOptions(p);
  const [key, setKey] = useState(() => defaultSizeKey(p));
  const sel = opts.find((o) => o.key === key) || opts[0];
  const src = p.imagen || (Array.isArray(p.imagenes) ? p.imagenes.find(Boolean) : null);
  const consult = sel.price == null;
  const soldOut = isSoldOut(p);

  return (
    <Reveal as="article" className={`product-card${soldOut ? " is-soldout" : ""}${featured ? " product-card--featured" : ""}`}>
      <div className="product-card__media">
        {src && !imgFailed ? (
          <img src={thumbOf(src)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setImgFailed(true)} />
        ) : (
          <span className="product-card__image-placeholder">Imagen del perfume</span>
        )}
        {featured && <span className="product-card__flag">Destacado</span>}
        {p.disponibilidad && (
          <span className={`product-card__badge${soldOut ? " product-card__badge--agotado" : ""}`}>{p.disponibilidad}</span>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__brand">{p.marca}</p>
        <h3 className="product-card__name">
          {/* La selección de formato viaja en la URL para abrir la ficha con ese formato ya elegido */}
          <Link to={`/perfume/${perfumeSlug(p)}?t=${sel.key}`} className="product-card__link" aria-label={`Ver detalles de ${p.marca} ${p.nombre}${soldOut ? " (agotado)" : ""}`}>
            {p.nombre}
          </Link>
        </h3>
        {p.descripcion && <p className="product-card__desc">{p.descripcion}</p>}

        <div className="size-pills" role="group" aria-label={`Formato de ${p.nombre}`}>
          {opts.map((o) => (
            <button key={o.key} type="button" aria-pressed={o.key === sel.key}
              className={`size-pill${o.price == null ? " is-consult" : ""}`} onClick={() => setKey(o.key)}>
              {o.short}
            </button>
          ))}
        </div>
        <div className="product-card__foot">
          <p className="product-card__price" aria-live="polite">
            <span className="product-card__price-label">{sel.label}</span>
            <span className={`product-card__price-value${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
          </p>
          <AddToCartButton product={p} sizeKey={sel.key} className="cart-add--card" short />
        </div>
      </div>
    </Reveal>
  );
}
