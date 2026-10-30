import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../seo";
import { Icon, WhatsAppIcon } from "../components/Icons.jsx";
import { useCart } from "../cart/CartContext.jsx";
import QuantityStepper from "../cart/QuantityStepper.jsx";
import { MAX_QTY, money } from "../cart/cartLogic.js";
import { perfumePath, thumbOf } from "../utils";
import useOrderCheckout from "../cart/useOrderCheckout.js";

const LINE_PROBLEM = {
  soldout: "Agotado. Quítalo para poder finalizar el pedido.",
  noprice: "Esta presentación ya no tiene precio. Quítala para poder finalizar el pedido.",
};

export default function Cart() {
  useSeo({ title: "Mi pedido | SelectParfums", description: "Revisa tu pedido y finalízalo por WhatsApp.", path: "/carrito", noindex: true });
  const { summary, notice, dismissNotice, persistError, setQuantity, remove, clear, checkout, whatsappNumber } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(null); // "ok" | "fail"
  const [locked, setLocked] = useState(false);   // evita abrir WhatsApp varias veces con doble clic
  const [offline, setOffline] = useState(false); // sin conexión al intentar abrir WhatsApp
  const lockTimer = useRef(0);
  useEffect(() => () => clearTimeout(lockTimer.current), []);
  useEffect(() => {
    const back = () => setOffline(false);
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, []);

  // Las líneas de perfumes que ya no existen nunca se pintan (el proveedor las limpia y avisa)
  const lines = summary.lines.filter((l) => l.product);
  const co = checkout();
  const oc = useOrderCheckout({ summary, whatsappNumber }); // registro del pedido (solo si Supabase está configurado)

  const copyMessage = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(co.message);
      else { // navegadores sin API de portapapeles: alternativa clásica
        const ta = document.createElement("textarea");
        ta.value = co.message; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        const done = document.execCommand("copy"); ta.remove();
        if (!done) throw new Error("copy failed");
      }
      setCopied("ok");
    } catch { setCopied("fail"); }
  };

  // Abrir WhatsApp ≠ pedido confirmado. Protecciones: sin conexión no se abre nada; tras abrir, 4 s de bloqueo
  // para que un doble clic no genere dos conversaciones/mensajes duplicados. El carrito NO se vacía.
  const onCheckout = (e) => {
    if (locked) { e.preventDefault(); return; }
    if (navigator.onLine === false) { e.preventDefault(); setOffline(true); return; }
    setOffline(false); setOpened(true); setLocked(true);
    clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => setLocked(false), 4000);
  };

  return (
    <section className="cart-page">
      <div className="container">
        <p className="section-label">Tu selección</p>
        <h1 className="section-title">Mi pedido</h1>

        {notice && (
          <div className="cart-alert" role="status">
            <p>{notice}</p>
            <button type="button" className="cart-alert__close" onClick={dismissNotice} aria-label="Cerrar aviso"><Icon name="close" /></button>
          </div>
        )}
        {persistError && (
          <div className="cart-alert cart-alert--warn" role="status">
            <p>Tu navegador no permite guardar el pedido: si recargas la página se perderá.</p>
          </div>
        )}

        {lines.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon"><Icon name="cart" /></span>
            <h2 className="cart-empty__title">Tu pedido está vacío</h2>
            <p className="cart-empty__text">Elige tu fragancia y el formato que prefieras (decant de 5 ml, 10 ml o frasco completo) y agrégala aquí.</p>
            <Link to="/catalogo" className="btn-gold">Ver el catálogo</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-lines" aria-label="Artículos del pedido">
              {lines.map((l) => {
                const problem = LINE_PROBLEM[l.status];
                return (
                  <li key={l.key} className={`cart-line${problem ? " has-problem" : ""}`}>
                    <Link to={perfumePath(l.product)} className="cart-line__img" aria-label={`Ver ${l.name}`}>
                      {l.product.imagen ? <img src={thumbOf(l.product.imagen)} alt="" loading="lazy" decoding="async" /> : <Icon name="bottle" />}
                    </Link>
                    <div className="cart-line__main">
                      <Link to={perfumePath(l.product)} className="cart-line__name">{l.name}</Link>
                      <p className="cart-line__pres">
                        {l.presentation}
                        {l.product.disponibilidad === "Preventa" && <span className="cart-line__tag">Preventa</span>}
                      </p>
                      {problem
                        ? <p className="cart-line__problem" role="alert">{problem}</p>
                        : <p className="cart-line__unit">{money(l.unitPrice)} c/u</p>}
                    </div>
                    <div className="cart-line__controls">
                      <QuantityStepper value={l.qty} onChange={(q) => setQuantity(l.key, q)} label={`Cantidad de ${l.name}, ${l.presentation}`} max={MAX_QTY} />
                      <button type="button" className="cart-line__remove" onClick={() => remove(l.key)} aria-label={`Quitar ${l.name}, ${l.presentation}, del pedido`}>
                        <Icon name="trash" /> <span>Quitar</span>
                      </button>
                    </div>
                    <p className="cart-line__subtotal" aria-label={`Subtotal ${problem ? "no disponible" : money(l.subtotal)}`}>
                      {problem ? "—" : money(l.subtotal)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <aside className="cart-summary" aria-labelledby="cart-summary-title">
              <h2 className="cart-summary__title" id="cart-summary-title">Resumen</h2>
              <dl className="cart-summary__rows">
                <div><dt>Unidades</dt><dd>{summary.orderableUnits}</dd></div>
                <div className="cart-summary__total"><dt>Total del pedido</dt><dd>{money(summary.total)}</dd></div>
              </dl>
              <p className="cart-summary__note">El total corresponde solo a los productos. Disponibilidad, forma de pago y envío los confirmas con el vendedor por WhatsApp.</p>

              {co.ok && oc.enabled ? (
                <button type="button" className="btn-gold cart-checkout" onClick={oc.start} disabled={oc.phase === "registering"} aria-busy={oc.phase === "registering" || undefined}>
                  <WhatsAppIcon /> {oc.phase === "registering" ? "Registrando tu pedido…" : "Finalizar pedido por WhatsApp"}
                </button>
              ) : co.ok ? (
                <a className="btn-gold cart-checkout" href={co.url} target="_blank" rel="noopener noreferrer" onClick={onCheckout} aria-disabled={locked || undefined}>
                  <WhatsAppIcon /> {locked ? "Abriendo WhatsApp…" : "Finalizar pedido por WhatsApp"}
                </a>
              ) : (
                <button type="button" className="btn-gold cart-checkout" disabled aria-describedby="cart-checkout-help">
                  <WhatsAppIcon /> Finalizar pedido por WhatsApp
                </button>
              )}

              {!co.ok && co.reason === "blocked" && (
                <p className="cart-help cart-help--warn" id="cart-checkout-help" role="alert">Hay artículos que ya no se pueden pedir. Quítalos para continuar.</p>
              )}
              {!co.ok && co.reason === "no-number" && (
                <p className="cart-help cart-help--warn" id="cart-checkout-help" role="alert">No pudimos preparar el pedido: falta configurar el número de WhatsApp de la tienda. Por favor inténtalo más tarde.</p>
              )}
              {!co.ok && co.reason === "too-long" && (
                <div className="cart-help cart-help--warn" id="cart-checkout-help" role="alert">
                  <p>Tu pedido es demasiado largo para enviarlo en un solo enlace. Copia el resumen y pégalo en el chat de WhatsApp.</p>
                  <div className="cart-help__actions">
                    <button type="button" className="btn-outline" onClick={copyMessage}>{copied === "ok" ? "Resumen copiado" : "Copiar resumen del pedido"}</button>
                    <a className="btn-outline" href={co.chatUrl} target="_blank" rel="noopener noreferrer">Abrir chat de WhatsApp</a>
                  </div>
                  {copied === "fail" && <p>No pudimos copiarlo automáticamente. Divide el pedido en dos o escríbenos directamente.</p>}
                </div>
              )}

              {offline && (
                <div className="cart-help cart-help--warn" role="alert">
                  <p>Sin conexión a internet: no pudimos abrir WhatsApp. Tu pedido sigue guardado. Cuando recuperes la conexión pulsa de nuevo el botón, o copia el resumen y envíalo por WhatsApp.</p>
                </div>
              )}

              {co.ok && (
                <button type="button" className="cart-copy" onClick={copyMessage}>
                  {copied === "ok" ? "Resumen copiado" : copied === "fail" ? "No se pudo copiar; inténtalo de nuevo" : "Copiar resumen del pedido"}
                </button>
              )}

              {oc.enabled && oc.phase === "registered" && (
                <div className="cart-help" role="status">
                  <p>Registramos tu solicitud con el código <strong className="cart-code">{oc.order.code}</strong>.{" "}
                    {oc.opened ? "Abrimos WhatsApp con ese código: revisa el mensaje y envíalo." : "Abre WhatsApp para enviar el mensaje."}{" "}
                    <strong>Tu pedido aún no está confirmado</strong> hasta que el vendedor te responda; el pago y el envío se coordinan por ahí.</p>
                  {oc.wa.ok && !oc.opened && (
                    <a className="btn-outline" href={oc.wa.url} target="_blank" rel="noopener noreferrer">Abrir WhatsApp con mi pedido</a>
                  )}
                  {!oc.wa.ok && oc.wa.reason === "too-long" && (
                    <p>El mensaje es demasiado largo para un solo enlace: escribe al vendedor indicando el código <strong>{oc.order.code}</strong>.</p>
                  )}
                </div>
              )}
              {oc.enabled && oc.phase === "mismatch" && (
                <div className="cart-help cart-help--warn" role="alert">
                  <p>Los precios o cantidades cambiaron desde que armaste tu pedido. Registramos la solicitud <strong className="cart-code">{oc.order.code}</strong> con los valores
                    actuales: total <strong>{money(oc.order.total_cop)}</strong>. Revísalo antes de enviarlo.</p>
                  {oc.wa.ok && <a className="btn-outline" href={oc.wa.url} target="_blank" rel="noopener noreferrer">Abrir WhatsApp con los valores actualizados</a>}
                </div>
              )}
              {oc.enabled && oc.phase === "error" && (
                <div className="cart-help cart-help--warn" role="alert">
                  <p>{oc.message}</p>
                  <p>No se registró ninguna solicitud. Puedes reintentar, o continuar por WhatsApp <strong>sin código de pedido</strong> (el vendedor igualmente confirmará todo).</p>
                  {co.ok && <a className="btn-outline" href={co.url} target="_blank" rel="noopener noreferrer">Continuar por WhatsApp sin código</a>}
                </div>
              )}

              {!oc.enabled && opened && co.ok && (
                <p className="cart-help" role="status">
                  Abrimos WhatsApp con tu pedido. Revísalo y envíalo desde allí: <strong>tu pedido aún no está confirmado</strong> hasta que el vendedor te responda. Conservamos tu selección por si quieres ajustarla.
                </p>
              )}

              <Link to="/catalogo" className="btn-outline cart-continue">Seguir comprando</Link>

              {confirmClear ? (
                <div className="cart-clear" role="group" aria-label="Confirmar vaciar pedido">
                  <span>¿Vaciar todo el pedido?</span>
                  <button type="button" className="cart-clear__yes" onClick={() => { clear(); oc.reset(); setConfirmClear(false); setOpened(false); }}>Sí, vaciar</button>
                  <button type="button" className="cart-clear__no" onClick={() => setConfirmClear(false)}>Cancelar</button>
                </div>
              ) : (
                <button type="button" className="cart-clear__open" onClick={() => setConfirmClear(true)}>Vaciar pedido</button>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
