import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";

/**
 * Carrusel con scroll-snap nativo: el swipe lo resuelve el navegador (fluido, con inercia y
 * sin pelear con el scroll vertical). Mantiene flechas (solo puntero fino), puntos y teclado.
 */
export default function Carousel({ images, alt }) {
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState({});
  const track = useRef(null);
  const raf = useRef(0);
  const n = images.length;

  const go = (k) => {
    const idx = (k + n) % n;
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: idx * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };
  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = track.current;
      if (el && el.clientWidth) setI(Math.round(el.scrollLeft / el.clientWidth));
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div className="carousel" tabIndex={0} aria-roledescription="carrusel"
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(i - 1); if (e.key === "ArrowRight") go(i + 1); }}>
      <div className="carousel__viewport">
        <div className="carousel__track" ref={track} onScroll={onScroll}>
          {images.map((src, k) => (
            <div className="carousel__slide" key={k}>
              {src && !failed[k] ? (
                <img src={src} alt={`${alt} — imagen ${k + 1}`} draggable={false} decoding="async" loading={k === 0 ? "eager" : "lazy"}
                  onError={() => setFailed((f) => ({ ...f, [k]: true }))} />
              ) : (
                <span className="carousel__placeholder">
                  <Icon name="bottle" />
                  {k === 0 ? "Imagen del perfume" : `Imagen adicional ${k + 1}`}
                </span>
              )}
            </div>
          ))}
        </div>
        <button className="carousel__btn carousel__btn--prev" onClick={() => go(i - 1)} aria-label="Imagen anterior"><Icon name="left" /></button>
        <button className="carousel__btn carousel__btn--next" onClick={() => go(i + 1)} aria-label="Imagen siguiente"><Icon name="right" /></button>
      </div>
      <div className="carousel__dots">
        {images.map((_, k) => (
          <button key={k} className={`carousel__dot${k === i ? " is-active" : ""}`} onClick={() => go(k)} aria-label={`Ver imagen ${k + 1}`} aria-current={k === i} />
        ))}
      </div>
    </div>
  );
}
