import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { WhatsAppIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";

const LINKS = [
  ["/", "Inicio"], ["/marcas", "Marcas"],
  ["/catalogo?cat=Hombre", "Hombre"], ["/catalogo?cat=Mujer", "Mujer"], ["/catalogo?cat=Unisex", "Unisex"],
  ["/catalogo", "Catálogo"], ["/decants", "¿Qué es un decant?"], ["/como-pedir", "Cómo pedir"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const curCat = new URLSearchParams(search).get("cat");

  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isCurrent = (to) => {
    const [path, qs] = to.split("?");
    return pathname === path && (new URLSearchParams(qs).get("cat") || null) === (curCat || null);
  };

  return (
    <header className="header" id="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Ir al inicio de SelectParfums">SelectParfums</Link>
        <nav className={`header__nav${open ? " is-open" : ""}`} id="nav" aria-label="Navegación principal">
          {LINKS.map(([to, label]) => (
            <Link key={to} to={to} className={isCurrent(to) ? "is-current-page" : undefined}>{label}</Link>
          ))}
          <a href={WA_GENERIC} className="header__wa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
            <WhatsAppIcon /> WhatsApp
          </a>
        </nav>
        <button className={`header__burger${open ? " is-active" : ""}`} id="burger" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
      <div className={`nav-overlay${open ? " is-visible" : ""}`} id="navOverlay" onClick={() => setOpen(false)} />
    </header>
  );
}
