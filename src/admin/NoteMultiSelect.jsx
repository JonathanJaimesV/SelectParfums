import { Icon } from "../components/Icons.jsx";
import { useId, useMemo, useRef, useState } from "react";
import { slugify } from "../utils";

const cap = (s) => s.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toLocaleUpperCase("es"));

/**
 * Selector múltiple con búsqueda y "Crear nueva nota".
 * @param {string[]} value      notas seleccionadas
 * @param {string[]} options    notas existentes (globales)
 * @param {(names:string[])=>void} onChange
 * @param {(name:string)=>void} onCreate  se llama al crear una nota que no existía
 */
export default function NoteMultiSelect({ label, value, options, onChange, onCreate }) {
  const uid = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const chosen = useMemo(() => new Set(value.map(slugify)), [value]);
  const q = slugify(query);
  const matches = useMemo(
    () => options.filter((o) => !chosen.has(slugify(o)) && (!q || slugify(o).includes(q))).slice(0, 8),
    [options, chosen, q]
  );
  const exists = q && options.some((o) => slugify(o) === q);
  const canCreate = q && !exists && !chosen.has(q);
  const items = [...matches.map((m) => ({ type: "pick", name: m })), ...(canCreate ? [{ type: "new", name: cap(query) }] : [])];

  const add = (item) => {
    if (!item) return;
    if (item.type === "new") onCreate?.(item.name);
    onChange([...value, item.name]);
    setQuery(""); setActive(0);
    inputRef.current?.focus();
  };
  const remove = (n) => onChange(value.filter((x) => x !== n));

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { if (open && items[active]) { e.preventDefault(); add(items[active]); } else if (query) e.preventDefault(); }
    else if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
    else if (e.key === "Backspace" && !query && value.length) remove(value[value.length - 1]);
  };

  return (
    <div className="adm-field adm-notes">
      <label htmlFor={`${uid}-in`}>{label}</label>
      <div className={`adm-combo${open ? " is-open" : ""}`} onClick={() => inputRef.current?.focus()}>
        {value.map((n) => (
          <span key={n} className="adm-chip">
            {n}
            <button type="button" aria-label={`Quitar ${n}`} onClick={(e) => { e.stopPropagation(); remove(n); }}>×</button>
          </span>
        ))}
        <input
          id={`${uid}-in`} ref={inputRef} className="adm-combo__input" value={query} autoComplete="off"
          role="combobox" aria-expanded={open} aria-controls={`${uid}-list`} aria-autocomplete="list"
          aria-activedescendant={open && items[active] ? `${uid}-o${active}` : undefined}
          placeholder={value.length ? "" : "Buscar o crear nota…"}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && items.length > 0 && (
        <ul id={`${uid}-list`} className="adm-listbox" role="listbox">
          {items.map((it, i) => (
            <li key={it.type + it.name} id={`${uid}-o${i}`} role="option" aria-selected={i === active}
              className={`adm-listbox__item${i === active ? " is-active" : ""}${it.type === "new" ? " is-new" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); add(it); }} onMouseEnter={() => setActive(i)}>
              {it.type === "new" ? <><Icon name="plus" className="icon icon--sm" /> Crear nueva nota «{it.name}»</> : it.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
