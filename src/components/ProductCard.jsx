import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import { perfumeSlug } from "../utils";

export default function ProductCard({ p }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <Reveal as={Link} to={`/perfume/${perfumeSlug(p)}`} className="product-card" aria-label={`Ver detalles de ${p.marca} ${p.nombre}`}>
      <div className="product-card__image">
        {p.imagen && !imgFailed ? (
          <img src={p.imagen} alt={`${p.marca} ${p.nombre}`} loading="lazy" onError={() => setImgFailed(true)} />
        ) : (
          <span className="product-card__image-placeholder">Imagen del perfume</span>
        )}
        {p.disponibilidad && <span className="product-card__badge">{p.disponibilidad}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__brand">{p.marca}</p>
        <h3 className="product-card__name">{p.nombre}</h3>
        <p className="product-card__desc">{p.descripcion}</p>
      </div>
    </Reveal>
  );
}
