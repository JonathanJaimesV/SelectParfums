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
  ["flask", "Fragancias Originales", "Decants trasvasados de frascos auténticos con atomizadores de calidad."],
  ["truck", "Envíos a Colombia", "Despacho a Cúcuta y Bogotá por Coordinadora, Interrapidísimo o Servientrega."],
  ["phone", "Atención Directa", "Asesoría personalizada por WhatsApp en cada paso de tu compra."],
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
            <p className="cine-hero__text">
              Descubre perfumes exclusivos del Medio Oriente y casas de nicho reconocidas. Frascos completos o decants de 5 ml y 10 ml para probar antes de comprar.
            </p>
            <div className="cine-hero__actions">
              <Link to="/catalogo" className="btn-gold">Explorar catálogo <span className="cine-hero__arrow" aria-hidden="true">&rarr;</span></Link>
              <Link to="/decants" className="btn-outline">Descubrir decants</Link>
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
                <p className="section-subtitle">Elige una casa y explora sus fragancias.</p>
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
          <div className="trust-grid">
            {TRUST_ITEMS.map(([icon, title, text]) => (
              <Reveal key={title} className="trust-card">
                <div className="trust-card__icon">
                  <Icon name={icon} />
                </div>
                <div>
                  <h3 className="trust-card__title">{title}</h3>
                  <p className="trust-card__text">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="trust-section__more">
            <Link to="/como-pedir" className="link-arrow">Cómo pedir <span className="arrow" aria-hidden="true">&rarr;</span></Link>
          </div>
        </div>
      </section>

      {/* ── DECANTS CTA ── */}
      <section className="decant-section">
        <div className="container">
          <Reveal className="decant-section__header">
            <p className="section-label">Conoce nuestro formato</p>
            <h2 className="section-title">Prueba antes de comprar</h2>
            <p className="section-subtitle">
              Disfruta de perfumes de alta gama en porciones portátiles con atomizadores de calidad.
            </p>
          </Reveal>
          <div className="decant-cards">
            <Reveal className="decant-card">
              <h3 className="decant-card__title">Para descubrir</h3>
              <p className="decant-card__size">Decant 5 ml</p>
              <p className="decant-card__text">La forma ideal de conocer una fragancia antes de comprar el frasco. Perfecto para sumar variedad a tu colección.</p>
            </Reveal>
            <Reveal className="decant-card">
              <h3 className="decant-card__title">Para disfrutar</h3>
              <p className="decant-card__size">Decant 10 ml</p>
              <p className="decant-card__text">Más cantidad para llevarla contigo y usarla en tu día a día. Ideal para fragancias que ya conoces y amas.</p>
            </Reveal>
          </div>
          <div style={{ marginTop: 40 }}>
            <Link to="/decants" className="btn-outline">Leer guía completa de decants</Link>
          </div>
        </div>
      </section>
    </>
  );
}
