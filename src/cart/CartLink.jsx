import { Link } from "react-router-dom";
import { Icon } from "../components/Icons.jsx";
import { useCart } from "./CartContext.jsx";

/** Icono de carrito del encabezado con contador de unidades (se actualiza al instante). */
export default function CartLink() {
  const { units } = useCart();
  return (
    <Link to="/carrito" className="icon-btn cart-link" aria-label={units ? `Ver mi pedido: ${units} ${units === 1 ? "unidad" : "unidades"}` : "Ver mi pedido (vacío)"}>
      <Icon name="cart" />
      {units > 0 && <span className="cart-link__badge" aria-hidden="true">{units > 99 ? "99+" : units}</span>}
    </Link>
  );
}
