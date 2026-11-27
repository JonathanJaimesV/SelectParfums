import { Link, useLocation } from "react-router-dom";
import { WhatsAppIcon, Icon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";
import CartLink from "../cart/CartLink.jsx";

const LINKS = [
  ["/", "Inicio"],
  ["/catalogo", "Catálogo"],
  ["/marcas", "Marcas"],
  ["/decants", "Decants"],
  ["/como-pedir", "Cómo pedir"],
];

/** Cabecera: logo + buscar + carrito. La navegación en línea solo aparece desde 1280 px; en móvil/tablet la da la barra inferior (BottomNav). */
export default function Header() {
  const { pathname } = useLocation();
  const isCurrent = (to) => pathname === to;

  return (
    <header className="header" id="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Ir al inicio de SelectParfums">SelectParfums</Link>

        <nav className="header__nav" id="nav" aria-label="Navegación principal">
          {LINKS.map(([to, text]) => (
            <Link key={to} to={to} className={isCurrent(to) ? "is-current-page" : undefined} aria-current={isCurrent(to) ? "page" : undefined}>{text}</Link>
          ))}
          <a href={WA_GENERIC} className="header__wa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
            <WhatsAppIcon /> WhatsApp
          </a>
        </nav>

        <div className="header__actions">
          <Link
            to="/catalogo#buscar"
            className="icon-btn header__search"
            aria-label="Buscar fragancias"
            onClick={() => {
              if (pathname === "/catalogo") {
                window.dispatchEvent(new Event("catalog:open-search"));
              }
            }}
          >
            <Icon name="search" />
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
