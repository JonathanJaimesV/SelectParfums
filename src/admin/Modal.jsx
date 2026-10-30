import { Icon } from "../components/Icons.jsx";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Pila de modales abiertos: solo el de arriba responde a Escape (BrandModal se abre encima del formulario).
const stack = [];

/**
 * Modal accesible: role="dialog", Escape, bloqueo de scroll, foco inicial y restauración de foco.
 * @param {boolean} locked  true → no se cierra al hacer clic fuera ni con Escape (formularios con datos).
 */
export default function Modal({ title, onClose, children, size = "md", locked = false, labelledBy = "modal-title" }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const token = Symbol("modal");
    stack.push(token);
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === "Escape" && !locked) { e.stopPropagation(); closeRef.current(); }
      if (e.key === "Tab" && ref.current) { // atrapa el foco dentro del modal
        const f = [...ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    // foco inicial: primer campo del modal (o el propio diálogo)
    const t = setTimeout(() => (ref.current?.querySelector("[data-autofocus]") || ref.current)?.focus(), 30);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(token), 1);
      if (!stack.length) document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [locked]);

  return createPortal(
    <div className="adm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !locked) onClose(); }}>
      <div ref={ref} className={`adm-modal adm-modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}>
        <header className="adm-modal__head">
          <h2 id={labelledBy} className="adm-modal__title">{title}</h2>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Cerrar"><Icon name="close" className="icon icon--sm" /></button>
        </header>
        {children}
      </div>
    </div>,
    document.body
  );
}
