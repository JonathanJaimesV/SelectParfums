import { useRef, useState } from "react";

export default function Carousel({ images, alt }) {
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState({});
  const startX = useRef(null);
  const n = images.length;
  const go = (k) => setI((k + n) % n);

  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    startX.current = null;
  };

  return (
    <div className="carousel" tabIndex={0} aria-roledescription="carrusel"
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(i - 1); if (e.key === "ArrowRight") go(i + 1); }}
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; }} onTouchEnd={onTouchEnd}>
      <div className="carousel__viewport">
        <div className="carousel__track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((src, k) => (
            <div className="carousel__slide" key={k}>
              {src && !failed[k] ? (
                <img src={src} alt={`${alt} — imagen ${k + 1}`} onError={() => setFailed((f) => ({ ...f, [k]: true }))} />
              ) : (
                <span className="carousel__placeholder">{k === 0 ? "Imagen del perfume" : `Imagen adicional ${k + 1}`}</span>
              )}
            </div>
          ))}
        </div>
        <button className="carousel__btn carousel__btn--prev" onClick={() => go(i - 1)} aria-label="Imagen anterior">‹</button>
        <button className="carousel__btn carousel__btn--next" onClick={() => go(i + 1)} aria-label="Imagen siguiente">›</button>
      </div>
      <div className="carousel__dots">
        {images.map((_, k) => (
          <button key={k} className={`carousel__dot${k === i ? " is-active" : ""}`} onClick={() => go(k)} aria-label={`Ver imagen ${k + 1}`} />
        ))}
      </div>
    </div>
  );
}
