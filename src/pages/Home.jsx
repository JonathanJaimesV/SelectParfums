import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useTitle } from "../utils";

const HUBS = [
  ["/catalogo", "✨", "Catálogo Completo", "Explora todas nuestras fragancias con filtros por notas, marcas y precios.", "Ver catálogo"],
  ["/marcas", "🏛️", "Nuestras Casas", "Afnan, Armaf, French Avenue y Rasasi: el legado y prestigio oriental.", "Conocer marcas"],
  ["/decants", "🧪", "¿Qué es un Decant?", "Conoce los formatos de 5 ml y 10 ml y aprende a probar antes de comprar.", "Descubrir decants"],
  ["/como-pedir", "📦", "Cómo Pedir", "Proceso en 3 pasos, pagos por llave NU/Transferencia y envíos a Cúcuta y Bogotá.", "Guía de compra"],
];

export default function Home() {
  useTitle("SelectParfums — Fragancias Árabes y de Nicho | Frascos y Decants");
  const { productos: PRODUCTOS } = useCatalog();
  return (
    <>
      <section className="hero" id="inicio">
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="hero__label">Frascos completos y decants</span>
            <h1 className="hero__title">Fragancias árabes y de nicho con carácter</h1>
            <p className="hero__text">
              Descubre perfumes exclusivos del Medio Oriente y casas de nicho. Compra frascos completos o prueba una fragancia nueva con nuestros decants de 5 ml y 10 ml.
            </p>
            <div className="hero__buttons">
              <Link to="/catalogo" className="btn-gold">Ver catálogo</Link>
              <Link to="/decants" className="btn-outline">¿Qué es un decant?</Link>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <svg className="hero__bottle" viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="72" y="10" width="56" height="50" rx="6" fill="rgba(212,175,106,0.15)" stroke="#d4af6a" strokeWidth="1.5" />
              <rect x="88" y="0" width="24" height="16" rx="4" fill="rgba(212,175,106,0.25)" stroke="#d4af6a" strokeWidth="1" />
              <rect x="85" y="60" width="30" height="30" rx="2" fill="rgba(212,175,106,0.08)" stroke="#d4af6a" strokeWidth="1" />
              <rect x="35" y="90" width="130" height="200" rx="16" fill="rgba(212,175,106,0.06)" stroke="#d4af6a" strokeWidth="1.5" />
              <rect x="42" y="160" width="116" height="123" rx="12" fill="rgba(212,175,106,0.1)" />
              <rect x="52" y="130" width="97" height="80" rx="8" fill="rgba(212,175,106,0.05)" stroke="#d4af6a" strokeWidth="0.8" />
              <image x="48" y="136" width="105" height="68" href="/assets/images/Logo.png" preserveAspectRatio="xMidYMid meet" />
              <line x1="50" y1="100" x2="50" y2="270" stroke="rgba(212,175,106,0.15)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="100" cy="68" r="3" fill="#d4af6a" opacity="0.4" />
            </svg>
          </div>
        </div>
      </section>

      <section className="hub-section">
        <div className="container">
          <div className="hub-grid">
            {HUBS.map(([to, icon, title, desc, cta]) => (
              <Reveal as={Link} key={to} to={to} className="hub-card">
                <div>
                  <div className="hub-card__icon">{icon}</div>
                  <h2 className="hub-card__title">{title}</h2>
                  <p className="hub-card__desc">{desc}</p>
                </div>
                <span className="hub-card__link">{cta} &rarr;</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="container">
          <Reveal className="catalog-section__header">
            <p className="section-label">Selección especial</p>
            <h2 className="section-title">Fragancias Destacadas</h2>
            <p className="section-subtitle">Las creaciones más cotizadas y reconocidas de nuestro catálogo.</p>
          </Reveal>
          <div className="products-grid">
            {PRODUCTOS.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link to="/catalogo" className="btn-gold">Explorar todas las fragancias</Link>
          </div>
        </div>
      </section>

      <section className="decant-section" style={{ borderTop: "1px solid var(--border-card)" }}>
        <div className="container">
          <Reveal className="decant-section__header">
            <p className="section-label">Conoce nuestro formato</p>
            <h2 className="section-title">Prueba antes de comprar</h2>
            <p className="section-subtitle">Disfruta de perfumes de alta gama en porciones portátiles con atomizadores de calidad.</p>
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
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link to="/decants" className="btn-outline">Leer guía completa de decants</Link>
          </div>
        </div>
      </section>
    </>
  );
}
