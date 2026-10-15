import { Link, Navigate, useParams } from "react-router-dom";
import Carousel from "../components/Carousel.jsx";
import { WhatsAppIcon } from "../components/Icons.jsx";
import { PRODUCTOS } from "../data/products";
import { NOTAS } from "../data/notes";
import { formatPrice, galleryOf, perfumeSlug, useTitle, waUrl } from "../utils";

const NOTE_GROUPS = [
  ["salida", "Notas de salida"],
  ["corazon", "Notas de corazón"],
  ["fondo", "Notas profundas"],
];

export default function PerfumeDetail() {
  const { slug } = useParams();
  const p = PRODUCTOS.find((x) => perfumeSlug(x) === slug || String(x.id) === slug);
  useTitle(p ? `${p.marca} ${p.nombre} | SelectParfums` : "SelectParfums");
  if (!p) return <Navigate to="/catalogo" replace />;
  // links viejos con el id (/perfume/3) se redirigen al nombre (/perfume/dunescape)
  if (slug !== perfumeSlug(p)) return <Navigate to={`/perfume/${perfumeSlug(p)}`} replace />;

  const notes = p.notas || NOTAS[p.id] || {};
  const prices = [
    [`Frasco ${p.tamanoFrasco}`, p.precioFrasco],
    ["Decant 5 ml", p.precioDecant5],
    ["Decant 10 ml", p.precioDecant10],
  ];

  return (
    <section className="detail">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link><span>/</span><Link to="/catalogo">Catálogo</Link><span>/</span><span>{p.nombre}</span>
        </nav>
        <div className="detail__grid">
          <Carousel key={p.id} images={galleryOf(p)} alt={`${p.marca} ${p.nombre}`} />
          <div className="detail__info">
            <p className="product-card__brand">{p.marca}</p>
            <h1 className="detail__name">{p.nombre}</h1>
            <div className="detail__tags">
              <span>{p.categoria}</span>
              {p.disponibilidad && <span>{p.disponibilidad}</span>}
              <span>Frasco {p.tamanoFrasco}</span>
            </div>
            <p className="detail__desc">{p.descripcion}</p>

            <h2 className="detail__subtitle">Pirámide olfativa</h2>
            <div className="notes">
              {NOTE_GROUPS.map(([key, label]) => (
                <div key={key} className="notes__group">
                  <h3 className="notes__title">{label}</h3>
                  {notes[key]?.length ? (
                    <div className="notes__chips">{notes[key].map((n) => <span key={n}>{n}</span>)}</div>
                  ) : (
                    <p className="notes__empty">Notas próximamente</p>
                  )}
                </div>
              ))}
            </div>

            <h2 className="detail__subtitle">Precios</h2>
            <div className="detail__prices">
              {prices.map(([label, price]) => (
                <div key={label} className="detail__price-row">
                  <span>{label}</span><strong>{formatPrice(price)}</strong>
                </div>
              ))}
            </div>
            <a className="product-card__buy" target="_blank" rel="noopener noreferrer"
              href={waUrl(`Hola, me interesa ${p.marca} ${p.nombre}. ¿Me das más información?`)}>
              <WhatsAppIcon /> Consultar por WhatsApp
            </a>
            <Link to="/catalogo" className="detail__back">&larr; Volver al catálogo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
