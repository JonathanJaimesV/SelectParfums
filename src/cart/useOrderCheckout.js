import { useCallback, useEffect, useRef, useState } from "react";
import { BACKEND, BACKEND_CONFIGURED } from "../backend/config.js";
import { registerOrder, summaryFromOrder, cartSignature, clearCheckoutState } from "../backend/orders.js";
import { prepareCheckout } from "./cartLogic.js";

/**
 * Registro del pedido antes de abrir WhatsApp (solo si Supabase está configurado; si no, `enabled` es false y la
 * página usa el enlace directo de siempre).
 *
 * phase: idle | registering | registered | mismatch | error
 *  · registered: pedido guardado (estado "iniciado") y WhatsApp abierto con el código. NO está confirmado.
 *  · mismatch:   el servidor devolvió precios/cantidades distintos a los que veía el cliente → no se abre WhatsApp sin que lo revise.
 *  · error:      no se pudo registrar → NUNCA se afirma que se registró; la página ofrece continuar sin código.
 */
export default function useOrderCheckout({ summary, whatsappNumber }) {
  const [state, setState] = useState({ phase: "idle" });
  const busy = useRef(false);
  const signature = cartSignature(summary.lines);

  // Si el contenido del carrito cambia, el resultado anterior deja de aplicar.
  useEffect(() => { setState({ phase: "idle" }); busy.current = false; }, [signature]);

  const reset = useCallback(() => { clearCheckoutState(); setState({ phase: "idle" }); busy.current = false; }, []);

  const start = useCallback(async () => {
    if (!BACKEND_CONFIGURED || busy.current) return;           // anti doble clic mientras se registra
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setState({ phase: "error", kind: "network", message: "Sin conexión a internet: no pudimos registrar tu pedido. Tu carrito sigue guardado." });
      return;
    }
    busy.current = true;
    // La ventana de WhatsApp se abre AHORA (dentro del clic) y se rellena después: los navegadores bloquean ventanas abiertas tras una espera.
    let win = null;
    try { win = window.open("", "_blank"); if (win) { win.document.title = "Select Parfums"; win.document.body.textContent = "Registrando tu pedido…"; } } catch { win = null; }
    setState({ phase: "registering" });
    const closeWin = () => { try { win?.close(); } catch { /* ya cerrada */ } };
    let hold = 0; // ms de bloqueo tras terminar: solo después de un registro EXITOSO (un error se puede reintentar al instante)
    try {
      const r = await registerOrder(summary, { url: BACKEND.url, key: BACKEND.key });
      if (!r.ok) { closeWin(); setState({ phase: "error", kind: r.kind, message: r.message }); return; }
      const wa = prepareCheckout(summaryFromOrder(r.order), whatsappNumber, { code: r.order.code });
      hold = 1500;
      if (!r.matches) { closeWin(); setState({ phase: "mismatch", order: r.order, wa }); return; }
      let opened = false;
      if (wa.ok && win && !win.closed) {
        try { win.opener = null; win.location.href = wa.url; opened = true; } catch { opened = false; }
      }
      if (!opened) closeWin();
      setState({ phase: "registered", order: r.order, wa, opened });
    } catch (e) {
      closeWin();
      setState({ phase: "error", kind: "unknown", message: "No se pudo registrar el pedido. No se ha creado ninguna solicitud." });
    } finally {
      // tras un registro exitoso, un clic repetido justo después no debe abrir otra ventana; tras un error, se puede reintentar ya
      setTimeout(() => { busy.current = false; }, hold);
    }
  }, [summary, whatsappNumber]);

  return { enabled: BACKEND_CONFIGURED, ...state, start, reset };
}
