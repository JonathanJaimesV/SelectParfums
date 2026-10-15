import { Link } from "react-router-dom";

export default function PageBanner({ crumb, label, title, subtitle }) {
  return (
    <section className="page-banner">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link><span>/</span><span>{crumb}</span>
        </nav>
        <p className="section-label">{label}</p>
        <h1 className="section-title">{title}</h1>
        <p className="section-subtitle">{subtitle}</p>
      </div>
    </section>
  );
}
