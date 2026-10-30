import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import AddToCartButton from "../cart/AddToCartButton.jsx";
import { defaultSizeKey, formatPrice, perfumeSlug, sizeOptions, srcSetOf, thumbOf } from "../utils";
import "../featured.css";

const pad = (n) => String(n + 1).padStart(2, "0");
const photoOf = (p) => p.imagen || (Array.isArray(p.imagenes) ? p.imagenes.find(Boolean) : null);

/**
 * Vitrina de "Fragancias Destacadas": un escenario con el perfume en foco, un selector de miniaturas y un
 * panel de compra. Solo presentación: usa los mismos datos, precios, formatos y botón de carrito que las
 * tarjetas del catálogo (sizeOptions, formatPrice, AddToCartButton), sin lógica propia de compra.
 * La fragancia cambia solo al pulsar/tocar (o con teclado), nunca al pasar el cursor, para que el panel
 * no se mueva mientras el usuario va hacia "Agregar".
 */
export default function FeaturedShowcase({ items }) {
  const [active, setActive] = useState(0);
  const [sizeKeys, setSizeKeys] = useState({});
  const listRef = useRef(null);

  if (!items || items.length === 0) return null;

  const n = items.length;
  const idx = Math.min(active, n - 1);
  const p = items[idx];
  const opts = sizeOptions(p);
  const key = sizeKeys[p.id] ?? defaultSizeKey(p);
  const sel = opts.find((o) => o.key === key) || opts[0];
  const consult = sel.price == null;
  const detailHref = `/perfume/${perfumeSlug(p)}?t=${sel.key}`;
  const go = (d) => setActive((idx + d + n) % n);

  // Flechas del teclado: mueven el foco por el selector (el foco elige la fragancia)
  const onKeyDown = (e) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const btns = listRef.current?.querySelectorAll("button");
    if (btns?.length) btns[(idx + d + btns.length) % btns.length].focus();
  };

  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <div className="container">
        <div className="showcase__head">
          <Reveal className="showcase__intro">
            <p className="section-label">Selección especial</p>
            <h2 className="section-title" id="showcase-title">Fragancias Destacadas</h2>
            <p className="section-subtitle">Las creaciones más cotizadas y reconocidas de nuestro catálogo.</p>
          </Reveal>
          <Link to="/catalogo" className="link-arrow">Explorar todas las fragancias <span className="arrow" aria-hidden="true">&rarr;</span></Link>
        </div>

        <Reveal className="showcase__grid">
          <div className="showcase__visual">
            <div className="showcase__stage">
              {items.map((it, i) => {
                const src = photoOf(it);
                return (
                  <div key={it.id} className={`showcase__slide${i === idx ? " is-active" : ""}`} aria-hidden="true">
                    {src && (
                      <picture>
                        {/* Móvil: recorte vertical de la miniatura; desde 640 px, la fotografía original apaisada */}
                        <source media="(min-width: 640px)" srcSet={srcSetOf(src) || src} sizes="(min-width: 1000px) 56vw, 100vw" />
                        <img src={thumbOf(src)} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                      </picture>
                    )}
                  </div>
                );
              })}
              <div className="showcase__controls">
                <p className="showcase__count" aria-hidden="true"><span>{pad(idx)}</span> / {pad(n - 1)}</p>
                {n > 1 && (
                  <div className="showcase__arrows">
                    <button type="button" className="showcase__arrow" onClick={() => go(-1)} aria-label="Fragancia anterior">&larr;</button>
                    <button type="button" className="showcase__arrow" onClick={() => go(1)} aria-label="Fragancia siguiente">&rarr;</button>
                  </div>
                )}
              </div>
            </div>

            {n > 1 && (
              <ol className="showcase__index" ref={listRef} aria-label="Elige una fragancia" onKeyDown={onKeyDown}>
                {items.map((it, i) => {
                  const o = sizeOptions(it);
                  const s = o.find((x) => x.key === defaultSizeKey(it)) || o[0];
                  const src = photoOf(it);
                  return (
                    <li key={it.id}>
                      <button type="button" className={`showcase__item${i === idx ? " is-active" : ""}`} aria-pressed={i === idx}
                        aria-label={`${it.marca} ${it.nombre}`} onClick={() => setActive(i)} onFocus={() => setActive(i)}>
                        <span className="showcase__thumb" aria-hidden="true">{src && <img src={thumbOf(src)} alt="" loading="lazy" decoding="async" />}</span>
                        <span className="showcase__item-brand" aria-hidden="true">{it.marca}</span>
                        <span className="showcase__item-name" aria-hidden="true">{it.nombre}</span>
                        <span className="showcase__item-price" aria-hidden="true">{formatPrice(s.price)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="showcase__panel" key={p.id}>
            <p className="showcase__brand">
              {p.marca}
              {p.disponibilidad && <span className="showcase__badge">{p.disponibilidad}</span>}
            </p>
            <h3 className="showcase__name">
              <Link to={detailHref} aria-label={`Ver detalles de ${p.marca} ${p.nombre}`}>{p.nombre}</Link>
            </h3>
            {p.descripcion && <p className="showcase__desc">{p.descripcion}</p>}
            <div className="showcase__buy">
              <div className="showcase__sizes" role="group" aria-label={`Formato de ${p.nombre}`}>
                {opts.map((o) => (
                  <button key={o.key} type="button" className="showcase__size" aria-pressed={o.key === sel.key}
                    onClick={() => setSizeKeys((s) => ({ ...s, [p.id]: o.key }))}>
                    {o.short}
                  </button>
                ))}
              </div>
              <p className="showcase__price" aria-live="polite">
                <span className="showcase__price-label">{sel.label}</span>
                <span className={`showcase__price-value${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
              </p>
              <div className="showcase__actions">
                <AddToCartButton product={p} sizeKey={sel.key} className="cart-add--showcase" />
                <Link to={detailHref} className="link-arrow">Ver ficha <span className="arrow" aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
