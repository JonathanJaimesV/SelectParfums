import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icons.jsx";
import { isValidPrice, sizeOptions, isSoldOut } from "../pricing.js";
import { useCart } from "./CartContext.jsx";

/**
 * Agrega al pedido la presentación elegida. Se deshabilita (y lo dice) si el perfume está agotado
 * o la presentación no tiene precio válido: nunca agrega algo que no se pueda pedir.
 */
export default function AddToCartButton({ product, sizeKey, qty = 1, onAdded, className = "", short = false }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const opt = sizeOptions(product).find((o) => o.key === sizeKey);
  const soldOut = isSoldOut(product);
  const noPrice = !opt || !isValidPrice(opt.price);
  const disabled = soldOut || noPrice;
  const name = `${product.marca} ${product.nombre}`;

  const onClick = () => {
    const r = add(product, sizeKey, qty);
    if (!r.ok) return;
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
    onAdded?.();
  };

  return (
    <button type="button" className={`cart-add${added ? " is-added" : ""} ${className}`.trim()} disabled={disabled} onClick={onClick}
      aria-label={disabled ? `${name}: ${soldOut ? "agotado" : "precio por consultar para esta presentación"}` : `Agregar ${name}, ${opt.label}, al pedido`}>
      {added ? <><Icon name="check" /> Agregado</>
        : soldOut ? "Agotado"
        : noPrice ? (short ? "Por consultar" : "Precio por consultar")
        : <><Icon name="cart" /> {short ? "Agregar" : "Agregar al pedido"}</>}
    </button>
  );
}
