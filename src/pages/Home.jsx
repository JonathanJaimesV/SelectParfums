import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import { Icon } from "../components/Icons.jsx";
import FeaturedShowcase from "../components/FeaturedShowcase.jsx";
import HouseShowcase from "../components/HouseShowcase.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useSeo } from "../seo";
import { STATIC_SEO } from "../seoData.js";
import { isSoldOut } from "../utils";
import "../hero.css";

// Fotografía de campaña del hero (recurso estático en /public).
// WebP generado desde los PNG originales (que se conservan en la carpeta como fuente): 828 px (móvil), 1672 px y 3344 px (retina).
const HERO_IMAGE = "/assets/images/hero/hero-campaign.webp";
const HERO_IMAGE_SM = "/assets/images/hero/hero-campaign-828.webp";
const HERO_IMAGE_2X = "/assets/images/hero/hero-campaign-2x.webp";

const TRUST_ITEMS = [
  ["flask", "Fragancias originales"],
  ["truck", "Envíos a Cúcuta y Bogotá"],
  ["phone", "Atención por WhatsApp"],
];

export default function Home() {
  useSeo(STATIC_SEO["/"]);
  const { productos: PRODUCTOS, marcas: MARCAS } = useCatalog();

  // Destacados: los marcados con `destacado: true` en el catálogo (si hay); si no, los primeros con foto que no estén agotados.
  const available = PRODUCTOS.filter((p) => !isSoldOut(p) && p.imagen);
  const marked = available.filter((p) => p.destacado === true);
  const featured = (marked.length ? marked : available).slice(0, 6);

  return (
    <>
      {/* ── HERO ── */}
      <section className="cine-hero" id="inicio" aria-labelledby="hero-title">
        <div className="cine-hero__stage" aria-hidden="true">
          <div className="cine-hero__light" />
          <div className="cine-hero__media">
            {/* Fotografía de campaña: public/assets/images/hero/hero-campaign.jpg. Si el archivo no existe, el hero se ve igual (solo luz). */}
            <img
              className="cine-hero__img"
              src={HERO_IMAGE}
              srcSet={`${HERO_IMAGE_SM} 828w, ${HERO_IMAGE} 1672w, ${HERO_IMAGE_2X} 3344w`}
              sizes="100vw"
              alt=""
              width="1672" height="940"
              fetchPriority="high"
              decoding="async"
              ref={(el) => { if (el && el.complete && el.naturalWidth > 0) el.classList.add("is-loaded"); }}
              onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          <div className="cine-hero__shade" />
        </div>
        <div className="container cine-hero__inner">
          <p className="cine-hero__eyebrow">Perfumería árabe y de nicho en Colombia</p>
          <h1 className="cine-hero__title" id="hero-title">
            <span className="cine-hero__line"><span>Fragancias</span></span>{" "}
            <span className="cine-hero__line"><span>con carácter<span className="hero__title-dot">.</span></span></span>
          </h1>
          <div className="cine-hero__foot">
            <div className="cine-hero__actions">
              <Link to="/catalogo" className="btn-gold">Explorar catálogo <span className="cine-hero__arrow" aria-hidden="true">&rarr;</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASAS ── */}
      {MARCAS.length > 0 && (
        <section className="houses-section" aria-labelledby="houses-title">
          <div className="container">
            <div className="houses-section__header">
              <Reveal className="houses-section__intro">
                <p className="section-label">Nuestras casas</p>
                <h2 className="section-title" id="houses-title">Descubre por casa</h2>
              </Reveal>
              <Link to="/marcas" className="link-arrow">Conocer todas las casas <span className="arrow" aria-hidden="true">&rarr;</span></Link>
            </div>
            <HouseShowcase marcas={MARCAS} />
          </div>
        </section>
      )}

      {/* ── FRAGANCIAS DESTACADAS ── */}
      <FeaturedShowcase items={featured} />

      {/* ── CONFIANZA ── */}
      <section className="trust-section">
        <div className="container">
          <ul className="trust-grid">
            {TRUST_ITEMS.map(([icon, title]) => (
              <li key={title} className="trust-card">
                <span className="trust-card__icon" aria-hidden="true"><Icon name={icon} /></span>
                <span className="trust-card__title">{title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── DECANTS (banda breve; la guía completa está en /decants) ── */}
      <section className="decant-band" aria-labelledby="decant-band-title">
        <div className="container decant-band__inner">
          <Reveal className="decant-band__copy">
            <h2 className="decant-band__title" id="decant-band-title">Prueba antes de comprar</h2>
            <p className="decant-band__text">Decants de 5 ml y 10 ml con atomizadores de calidad.</p>
          </Reveal>
          <Link to="/decants" className="btn-outline">Ver guía de decants</Link>
        </div>
      </section>
    </>
  );
}
