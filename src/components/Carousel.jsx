import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";
import { srcSetOf } from "../utils";

/**
 * Carrusel con scroll-snap nativo: el swipe lo resuelve el navegador (fluido, con inercia y
 * sin pelear con el scroll vertical). Mantiene flechas (solo puntero fino), puntos y teclado.
 * Las imágenes que no existen (404) se descartan: solo se muestran fotos reales.
 */
export default function Carousel({ images, alt }) {
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState({});
  const track = useRef(null);
  const raf = useRef(0);

  const slides = images.map((src, k) => ({ src, k })).filter((s) => s.src && !failed[s.k]);
  const n = slides.length;
  const multi = n > 1;
  const cur = Math.min(i, Math.max(n - 1, 0));

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
    <div className="carousel" tabIndex={multi ? 0 : undefined} role="group" aria-roledescription={multi ? "carrusel" : undefined} aria-label={`Fotos de ${alt}`}
      onKeyDown={multi ? (e) => { if (e.key === "ArrowLeft") go(cur - 1); if (e.key === "ArrowRight") go(cur + 1); } : undefined}>
      <div className="carousel__viewport">
        <div className="carousel__track" ref={track} onScroll={onScroll}>
          {n === 0 ? (
            <div className="carousel__slide">
              <span className="carousel__placeholder"><Icon name="bottle" />Imagen del perfume</span>
            </div>
          ) : slides.map(({ src, k }, pos) => (
            <div className="carousel__slide" key={k}>
              <img src={src} srcSet={srcSetOf(src)} sizes="(min-width: 900px) 640px, 100vw" alt={multi ? `${alt} — imagen ${pos + 1} de ${n}` : alt} draggable={false} decoding="async"
                {...(pos === 0 ? { fetchPriority: "high" } : { loading: "lazy" })}
                onError={() => setFailed((f) => ({ ...f, [k]: true }))} />
            </div>
          ))}
        </div>
        {multi && <>
          <button className="carousel__btn carousel__btn--prev" onClick={() => go(cur - 1)} aria-label="Imagen anterior"><Icon name="left" /></button>
          <button className="carousel__btn carousel__btn--next" onClick={() => go(cur + 1)} aria-label="Imagen siguiente"><Icon name="right" /></button>
        </>}
      </div>
      {multi && (
        <div className="carousel__dots">
          {slides.map((_, pos) => (
            <button key={pos} className={`carousel__dot${pos === cur ? " is-active" : ""}`} onClick={() => go(pos)} aria-label={`Ver imagen ${pos + 1}`} aria-current={pos === cur} />
          ))}
        </div>
      )}
    </div>
  );
}
