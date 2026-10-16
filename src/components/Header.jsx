import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, WhatsAppIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";

const LINKS = [
  ["/", "Inicio"],
  ["/catalogo", "Catálogo"],
  ["/marcas", "Marcas"],
  ["/como-pedir", "Cómo pedir"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return () => { document.body.style.overflow = ""; };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const isCurrent = (to) => pathname === to;

  return (
    <header className="header" id="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Ir al inicio de SelectParfums">SelectParfums</Link>

        <nav className={`header__nav${open ? " is-open" : ""}`} id="nav" aria-label="Navegación principal">
          <button className="icon-btn nav-close" onClick={() => setOpen(false)} aria-label="Cerrar menú"><Icon name="close" /></button>
          {LINKS.map(([to, text]) => (
            <Link key={to} to={to} className={isCurrent(to) ? "is-current-page" : undefined}>{text}</Link>
          ))}
          <a href={WA_GENERIC} className="header__wa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
            <WhatsAppIcon /> WhatsApp
          </a>
        </nav>

        <div className="header__actions">
          <Link to="/catalogo#buscar" className="icon-btn header__search" aria-label="Buscar fragancias"><Icon name="search" /></Link>
          <button className={`header__burger${open ? " is-active" : ""}`} id="burger" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`nav-overlay${open ? " is-visible" : ""}`} id="navOverlay" onClick={() => setOpen(false)} />
    </header>
  );
}
