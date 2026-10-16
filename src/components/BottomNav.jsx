import { Link, useLocation } from "react-router-dom";
import { Icon, WhatsAppIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";

const ITEMS = [
  ["/", "Inicio", "home"],
  ["/catalogo", "Catálogo", "grid"],
  ["/marcas", "Marcas", "gem"],
  ["/como-pedir", "Pedir", "box"],
];

/** Barra inferior de navegación: todo al alcance del pulgar (solo móvil/tablet). */
export default function BottomNav() {
  const { pathname } = useLocation();
  const active = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <nav className="bottom-nav" aria-label="Navegación rápida">
      {ITEMS.map(([to, label, icon]) => (
        <Link key={to} to={to} className={active(to) ? "is-active" : undefined} aria-current={active(to) ? "page" : undefined}>
          <Icon name={icon} /><span>{label}</span>
        </Link>
      ))}
      <a href={WA_GENERIC} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
        <WhatsAppIcon /><span>WhatsApp</span>
      </a>
    </nav>
  );
}
