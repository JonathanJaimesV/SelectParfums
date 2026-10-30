import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MAX_QTY } from "./cartLogic.js";
import { useCart } from "./CartContext.jsx";

/** Confirmación discreta al agregar (no es un modal: no bloquea nada y se cierra sola). */
export default function CartToast() {
  const { toast, dismissToast } = useCart();
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(dismissToast, 4000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);
  return (
    <div className="cart-toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="cart-toast" key={toast.id}>
          <p className="cart-toast__text">
            <strong>{toast.capped ? `Máximo ${MAX_QTY} unidades por artículo` : "Agregado al pedido"}</strong>
            <span>{toast.name} · {toast.presentation}</span>
          </p>
          <Link to="/carrito" className="cart-toast__link" onClick={dismissToast}>Ver pedido</Link>
        </div>
      )}
    </div>
  );
}
