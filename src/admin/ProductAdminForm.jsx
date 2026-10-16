import { useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import BrandModal from "./BrandModal.jsx";
import NoteMultiSelect from "./NoteMultiSelect.jsx";
import ImageManager from "./ImageManager.jsx";
import { galleryOf } from "../utils";
import { ESTADOS, GENEROS, NOTE_STAGES, generosOf, isDuplicateName, normalizeGeneros } from "../services/catalogService";

const NEW_BRAND = "__new__";
const SIZES = ["30 ml", "50 ml", "60 ml", "75 ml", "80 ml", "90 ml", "100 ml", "105 ml", "110 ml", "125 ml"];

const emptyDraft = {
  marca: "", nombre: "", generos: [...GENEROS], descripcion: "", imagenes: [null, null, null],
  tamanoFrasco: "100 ml", precioFrasco: "", precioDecant5: "", precioDecant10: "",
  disponibilidad: "Disponible", notas: { salida: [], corazon: [], fondo: [] },
};

const toDraft = (p) => ({
  ...emptyDraft, ...p,
  generos: generosOf(p),
  imagenes: galleryOf(p),
  precioFrasco: p.precioFrasco ?? "", precioDecant5: p.precioDecant5 ?? "", precioDecant10: p.precioDecant10 ?? "",
  notas: { salida: [...(p.notas?.salida || [])], corazon: [...(p.notas?.corazon || [])], fondo: [...(p.notas?.fondo || [])] },
});

/**
 * Formulario de producto (crear / editar) dentro de un modal.
 * @param {object|null} product  null → crear; objeto → editar
 */
export default function ProductAdminForm({ product, productos, marcas, notasDisponibles, onSave, onAddBrand, onCancel }) {
  const editing = !!product;
  const [d, setD] = useState(() => (product ? toDraft(product) : emptyDraft));
  const [errors, setErrors] = useState({});
  const [brandModal, setBrandModal] = useState(false);
  const [extraNotes, setExtraNotes] = useState([]); // notas creadas en este formulario (disponibles en las 3 capas)

  const set = (k, v) => { setD((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const noteOptions = useMemo(() => [...new Set([...notasDisponibles, ...extraNotes])].sort((a, b) => a.localeCompare(b, "es")), [notasDisponibles, extraNotes]);
  const sizeOptions = SIZES.includes(d.tamanoFrasco) ? SIZES : [d.tamanoFrasco, ...SIZES];

  // Unisex marca/desmarca las 3 a la vez; Hombre+Mujer activan Unisex; quitar una lo desactiva
  const toggleGenero = (g) => {
    const on = d.generos.includes(g);
    let next;
    if (g === "Unisex") next = on ? [] : [...GENEROS];
    else {
      next = on ? d.generos.filter((x) => x !== g && x !== "Unisex") : [...d.generos, g];
      next = normalizeGeneros(next);
    }
    set("generos", next);
  };

  const validate = () => {
    const e = {};
    if (!d.generos.length) e.generos = "Selecciona al menos una etiqueta.";
    if (!d.marca) e.marca = "Selecciona una marca.";
    if (!d.nombre.trim()) e.nombre = "Escribe el nombre del perfume.";
    else if (d.marca && isDuplicateName(productos, d.marca, d.nombre, product?.id)) e.nombre = "Ya existe este perfume en esa marca.";
    if (d.descripcion.trim().length < 10) e.descripcion = "Agrega una descripción (mínimo 10 caracteres).";
    ["precioFrasco", "precioDecant5", "precioDecant10"].forEach((k) => {
      if (d[k] !== "" && !(Number(d[k]) >= 0)) e[k] = "Debe ser un número válido.";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const imgs = d.imagenes.map((x) => x || null);
    onSave({
      ...d,
      id: product?.id,
      nombre: d.nombre.trim(), descripcion: d.descripcion.trim(),
      imagenes: imgs, imagen: imgs[0] || "",
    });
  };

  const onBrandChange = (v) => (v === NEW_BRAND ? setBrandModal(true) : set("marca", v));

  const priceField = (key, label) => (
    <div className="adm-field">
      <label htmlFor={`f-${key}`}>{label}</label>
      <div className="adm-money">
        <span aria-hidden="true">$</span>
        <input id={`f-${key}`} className="adm-input" type="number" min="0" step="1000" inputMode="numeric"
          value={d[key]} onChange={(e) => set(key, e.target.value)} placeholder="Consultar" />
      </div>
      {errors[key] && <p className="adm-error" role="alert">{errors[key]}</p>}
    </div>
  );

  return (
    <>
      <Modal title={editing ? "Editar perfume" : "Nuevo perfume"} size="lg" locked onClose={onCancel}>
        <form onSubmit={submit} noValidate>
          <div className="adm-modal__body adm-form">
            <fieldset className="adm-section">
              <legend>Información básica</legend>
              <div className="adm-grid">
                <div className="adm-field">
                  <label htmlFor="f-marca">Marca *</label>
                  <select id="f-marca" className="adm-input" value={d.marca} onChange={(e) => onBrandChange(e.target.value)} data-autofocus>
                    <option value="">Selecciona una marca…</option>
                    {marcas.map((m) => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                    <option value={NEW_BRAND}>＋ Crear nueva marca…</option>
                  </select>
                  {errors.marca && <p className="adm-error" role="alert">{errors.marca}</p>}
                </div>
                <div className="adm-field">
                  <label htmlFor="f-nombre">Nombre del perfume *</label>
                  <input id="f-nombre" className="adm-input" value={d.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej. Club de Nuit Intense Man EDT" />
                  {errors.nombre && <p className="adm-error" role="alert">{errors.nombre}</p>}
                </div>
              </div>

              <div className="adm-grid">
                <div className="adm-field">
                  <span className="adm-label" id="f-genero-l">Género / etiqueta</span>
                  <div className="adm-segment" role="group" aria-labelledby="f-genero-l">
                    {GENEROS.map((g) => (
                      <button key={g} type="button" aria-pressed={d.generos.includes(g)}
                        className={`adm-segment__btn${d.generos.includes(g) ? " is-active" : ""}`} onClick={() => toggleGenero(g)}>{g}</button>
                    ))}
                  </div>
                  {errors.generos && <p className="adm-error" role="alert">{errors.generos}</p>}
                </div>
                <div className="adm-field">
                  <label htmlFor="f-estado">Estado de disponibilidad</label>
                  <select id="f-estado" className="adm-input" value={d.disponibilidad} onChange={(e) => set("disponibilidad", e.target.value)}>
                    {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="adm-field">
                <label htmlFor="f-desc">Descripción *</label>
                <textarea id="f-desc" className="adm-input" rows={4} maxLength={300} value={d.descripcion}
                  onChange={(e) => set("descripcion", e.target.value)} placeholder="Aroma, carácter y ocasión de uso…" />
                <p className="adm-hint adm-hint--right">{d.descripcion.length}/300</p>
                {errors.descripcion && <p className="adm-error" role="alert">{errors.descripcion}</p>}
              </div>
            </fieldset>

            <fieldset className="adm-section">
              <legend>Imágenes</legend>
              <p className="adm-hint">Sube un archivo o pega una ruta (ej. <code>/assets/images/ARMAF/Dunescape/armaf-dunescape.jpg</code>). La principal se ve en la tarjeta; las 3 forman el carrusel.</p>
              <ImageManager value={d.imagenes} onChange={(v) => set("imagenes", v)} />
            </fieldset>

            <fieldset className="adm-section">
              <legend>Notas olfativas</legend>
              {NOTE_STAGES.map((s) => (
                <NoteMultiSelect key={s.key} label={s.label} options={noteOptions} value={d.notas[s.key]}
                  onChange={(v) => set("notas", { ...d.notas, [s.key]: v })}
                  onCreate={(n) => setExtraNotes((x) => [...x, n])} />
              ))}
            </fieldset>

            <fieldset className="adm-section">
              <legend>Precios (COP)</legend>
              <div className="adm-field adm-field--inline">
                <label htmlFor="f-size">Tamaño del frasco</label>
                <select id="f-size" className="adm-input" value={d.tamanoFrasco} onChange={(e) => set("tamanoFrasco", e.target.value)}>
                  {sizeOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="adm-grid adm-grid--3">
                {priceField("precioFrasco", "Precio frasco completo")}
                {priceField("precioDecant5", "Precio decant 5 ml")}
                {priceField("precioDecant10", "Precio decant 10 ml")}
              </div>
              <p className="adm-hint">Déjalo vacío para mostrar “Consultar” en la tienda.</p>
            </fieldset>
          </div>
          <footer className="adm-modal__foot">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--gold">{editing ? "Guardar cambios" : "Crear perfume"}</button>
          </footer>
        </form>
      </Modal>

      {brandModal && (
        <BrandModal marcas={marcas} onCancel={() => setBrandModal(false)}
          onSave={(brand) => { onAddBrand(brand); set("marca", brand.nombre.trim()); setBrandModal(false); }} />
      )}
    </>
  );
}
