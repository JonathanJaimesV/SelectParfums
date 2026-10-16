import { useState } from "react";
import Modal from "./Modal.jsx";
import { isDuplicateBrand } from "../services/catalogService";

/** Crea una marca nueva. La descripción se usa en la página "Marcas" de la tienda. */
export default function BrandModal({ marcas, initialName = "", onSave, onCancel }) {
  const [nombre, setNombre] = useState(initialName);
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // el modal vive en un portal; evita que el submit llegue al formulario del producto
    const n = nombre.trim();
    if (!n) return setError("Escribe el nombre de la marca.");
    if (isDuplicateBrand(marcas, n)) return setError("Esa marca ya existe.");
    onSave({ nombre: n, descripcion });
  };

  return (
    <Modal title="Nueva marca" size="sm" onClose={onCancel} labelledBy="brand-modal-title">
      <form onSubmit={submit} noValidate>
        <div className="adm-modal__body">
          <div className="adm-field">
            <label htmlFor="brand-name">Nombre de la marca *</label>
            <input id="brand-name" className="adm-input" value={nombre} data-autofocus
              onChange={(e) => { setNombre(e.target.value); setError(""); }} placeholder="Ej. Lattafa" />
            {error && <p className="adm-error" role="alert">{error}</p>}
          </div>
          <div className="adm-field">
            <label htmlFor="brand-desc">Descripción (se muestra en “Nuestras Casas”)</label>
            <textarea id="brand-desc" className="adm-input" rows={3} value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)} placeholder="Breve reseña de la casa de perfumería…" />
          </div>
        </div>
        <footer className="adm-modal__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="adm-btn adm-btn--gold">Crear marca</button>
        </footer>
      </form>
    </Modal>
  );
}
