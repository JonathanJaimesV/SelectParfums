import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Reveal from "../components/Reveal.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useTitle } from "../utils";

export default function Brands() {
  useTitle("Nuestras Casas de Perfumería | SelectParfums");
  const navigate = useNavigate();
  const { marcas: MARCAS } = useCatalog();
  const go = (nombre) => navigate(`/catalogo?marca=${encodeURIComponent(nombre)}`);
  return (
    <>
      <PageBanner crumb="Nuestras Casas" label="Exclusividad y legado oriental" title="Nuestras Casas de Perfumería"
        subtitle="Cada casa representa una visión única de la perfumería: desde la opulencia emiratí clásica hasta reinterpretaciones modernas de alta perfumería nicho. Haz clic en cualquiera de ellas para ver su colección." />
      <section className="brands-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="brands-grid">
            {MARCAS.map((m) => (
              <Reveal key={m.id} className="brand-card" tabIndex={0} role="button" aria-label={`Ver fragancias de ${m.nombre}`}
                onClick={() => go(m.nombre)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(m.nombre); } }}>
                <h3 className="brand-card__name">{m.nombre}</h3>
                <p className="brand-card__desc">{m.descripcion}</p>
                <p className="brand-card__count">{m.fragancias} fragancia{m.fragancias !== 1 ? "s" : ""} disponibles</p>
                <div className="brand-card__action">Ver colección &rarr;</div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <p className="section-subtitle" style={{ margin: "0 auto 24px" }}>¿Buscas una fragancia específica entre todas nuestras casas?</p>
            <Link to="/catalogo" className="btn-gold">Explorar todo el catálogo</Link>
          </div>
        </div>
      </section>
    </>
  );
}
