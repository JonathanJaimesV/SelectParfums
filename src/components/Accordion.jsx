import { useId, useState } from "react";
import { Icon } from "./Icons.jsx";

/**
 * Acordeón accesible (botón + región). items: [{ id, title, media?, meta?, content }]
 * Anima la altura con grid-template-rows (sin medir el DOM).
 */
export default function Accordion({ items, defaultOpen = [], multiple = true, className = "", level = 3 }) {
  const Heading = `h${level}`; // nivel de encabezado según el contexto de la página (evita saltos h1→h3)
  const uid = useId();
  const [open, setOpen] = useState(defaultOpen);
  const toggle = (id) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));

  return (
    <div className={`acc ${className}`}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        const hid = `${uid}-h-${it.id}`;
        const pid = `${uid}-p-${it.id}`;
        return (
          <div key={it.id} className={`acc__item${isOpen ? " is-open" : ""}`}>
            <Heading>
              <button id={hid} className="acc__head" aria-expanded={isOpen} aria-controls={pid} onClick={() => toggle(it.id)}>
                {it.media && <span className="acc__media">{it.media}</span>}
                <span className="acc__title">{it.title}</span>
                {it.meta && <span className="acc__count">{it.meta}</span>}
                <Icon name="chevron" className="acc__chev" />
              </button>
            </Heading>
            <div id={pid} role="region" aria-labelledby={hid} className="acc__panel">
              <div className="acc__inner"><div className="acc__content">{it.content}</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
