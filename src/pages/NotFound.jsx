import { Link } from "react-router-dom";
import { useSeo } from "../seo";

/** Ruta inexistente: mensaje claro con salidas útiles (y noindex para buscadores). */
export default function NotFound() {
  useSeo({
    title: "Página no encontrada | SelectParfums",
    description: "La página que buscas no existe o cambió de lugar.",
    path: "/404",
    noindex: true,
  });
  return (
    <section className="notfound">
      <div className="container">
        <p className="section-label">Error 404</p>
        <h1 className="section-title">No encontramos esa página</h1>
        <p className="section-subtitle">El enlace puede haber cambiado o la fragancia ya no está en el catálogo.</p>
        <div className="notfound__actions">
          <Link to="/catalogo" className="btn-gold">Ver catálogo</Link>
          <Link to="/" className="btn-outline">Ir al inicio</Link>
        </div>
      </div>
    </section>
  );
}
