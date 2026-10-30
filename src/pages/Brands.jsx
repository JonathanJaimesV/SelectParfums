import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import HouseShowcase from "../components/HouseShowcase.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useSeo } from "../seo";
import { STATIC_SEO } from "../seoData.js";

export default function Brands() {
  useSeo(STATIC_SEO["/marcas"]);
  const { marcas: MARCAS } = useCatalog();
  return (
    <>
      <PageBanner crumb="Nuestras Casas" label="Exclusividad y legado oriental" title="Nuestras Casas de Perfumería"
        subtitle="Cada casa representa una visión única de la perfumería: desde la opulencia emiratí clásica hasta reinterpretaciones modernas de alta perfumería nicho. Haz clic en cualquiera de ellas para ver su colección." />
      <section className="brands-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <HouseShowcase variant="grid" marcas={MARCAS} />
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <p className="section-subtitle" style={{ margin: "0 auto 24px" }}>¿Buscas una fragancia específica entre todas nuestras casas?</p>
            <Link to="/catalogo" className="btn-gold">Explorar todo el catálogo</Link>
          </div>
        </div>
      </section>
    </>
  );
}
