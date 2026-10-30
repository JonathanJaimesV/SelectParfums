import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, WhatsAppIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";
import CartLink from "../cart/CartLink.jsx";

const LINKS = [
  ["/", "Inicio"],
  ["/catalogo", "Catálogo"],
  ["/marcas", "Marcas"],
  ["/decants", "Decants"],
  ["/como-pedir", "Cómo pedir"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const burgerRef = useRef(null);
  const navRef = useRef(null);
  // Cierra el menú; si fue el usuario (Escape / botón cerrar / fondo) devuelve el foco a la hamburguesa
  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) burgerRef.current?.focus();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname, search]); // al navegar no se roba el foco
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return () => { document.body.style.overflow = ""; };
    const nav = navRef.current;
    const focusables = () => [...nav.querySelectorAll("a[href], button:not([disabled])")];
    // El foco entra al menú (botón cerrar) y se queda dentro mientras esté abierto
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const els = focusables(); if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!nav.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, close]);

  const isCurrent = (to) => pathname === to;

  return (
    <header className="header" id="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Ir al inicio de SelectParfums">SelectParfums</Link>

        <nav ref={navRef} className={`header__nav${open ? " is-open" : ""}`} id="nav" aria-label="Navegación principal">
          <button className="icon-btn nav-close" onClick={() => close()} aria-label="Cerrar menú"><Icon name="close" /></button>
          {LINKS.map(([to, text]) => (
            <Link key={to} to={to} className={isCurrent(to) ? "is-current-page" : undefined} aria-current={isCurrent(to) ? "page" : undefined}>{text}</Link>
          ))}
          <a href={WA_GENERIC} className="header__wa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
            <WhatsAppIcon /> WhatsApp
          </a>
        </nav>

        <div className="header__actions">
          <Link to="/catalogo#buscar" className="icon-btn header__search" aria-label="Buscar fragancias"><Icon name="search" /></Link>
          <CartLink />
          <button ref={burgerRef} className={`header__burger${open ? " is-active" : ""}`} id="burger" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`nav-overlay${open ? " is-visible" : ""}`} id="navOverlay" onClick={() => close()} />
    </header>
  );
}
