import { Icon } from "../components/Icons.jsx";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import Modal from "./Modal.jsx";
import ProductTable from "./ProductTable.jsx";
import ProductAdminForm from "./ProductAdminForm.jsx";
import DeleteConfirmModal from "./DeleteConfirmModal.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { ESTADOS, GENEROS } from "../services/catalogService";

export default function AdminCatalog() {
  const cat = useCatalog();
  const { say } = useOutletContext();
  const { productos, marcas, notasDisponibles } = cat;
  const [params, setParams] = useSearchParams();

  const [form, setForm] = useState(null);        // null | { product: obj|null }
  const [toDelete, setToDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [q, setQ] = useState("");
  const [fGenero, setFGenero] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fMarca, setFMarca] = useState("");

  // Acceso rápido "Agregar perfume" desde el Resumen (/admin/perfumes?new=1).
  useEffect(() => {
    if (params.get("new") === "1") {
      setForm({ product: null });
      params.delete("new");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return productos.filter((p) =>
      (!s || `${p.marca} ${p.nombre}`.toLowerCase().includes(s)) &&
      (!fGenero || (p.generos || [p.categoria]).includes(fGenero)) && (!fEstado || p.disponibilidad === fEstado) && (!fMarca || p.marca === fMarca));
  }, [productos, q, fGenero, fEstado, fMarca]);

  const activeFilters = [fGenero, fEstado, fMarca].filter(Boolean).length + (q.trim() ? 1 : 0);
  const clearFilters = () => { setQ(""); setFGenero(""); setFEstado(""); setFMarca(""); };

  const save = (data) => {
    if (data.id != null) { cat.updateProduct(data); say("Cambios guardados."); }
    else { cat.addProduct(data); say("Perfume creado."); }
    setForm(null);
  };
  const remove = () => { cat.deleteProduct(toDelete.id); say(`«${toDelete.nombre}» eliminado.`); setToDelete(null); };

  return (
    <div className="adm-catalog">
      <div className="adm-pageline">
        <p className="adm-pageline__count">{productos.length} perfume{productos.length === 1 ? "" : "s"} en el catálogo</p>
        <button type="button" className="adm-btn adm-btn--gold" onClick={() => setForm({ product: null })}>
          <Icon name="plus" className="icon icon--sm" /> Nuevo perfume
        </button>
      </div>

      {cat.modified && (
        <div className="adm-alert" role="status">
          Tienes cambios guardados <strong>solo en este navegador</strong>. Para publicarlos, usa <em>Exportar</em> y reemplaza <code>src/data/products.js</code>.
          <button type="button" className="adm-link" onClick={() => setConfirmReset(true)}>Descartar cambios</button>
        </div>
      )}

      <div className="adm-toolbar">
        <div className="adm-toolbar__search">
          <Icon name="search" className="icon icon--sm adm-toolbar__searchicon" />
          <input className="adm-input adm-input--search" type="search" placeholder="Buscar por marca o nombre…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="adm-input" aria-label="Filtrar por marca" value={fMarca} onChange={(e) => setFMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map((m) => <option key={m.id}>{m.nombre}</option>)}
        </select>
        <select className="adm-input" aria-label="Filtrar por género" value={fGenero} onChange={(e) => setFGenero(e.target.value)}>
          <option value="">Todos los géneros</option>
          {GENEROS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="adm-input" aria-label="Filtrar por estado" value={fEstado} onChange={(e) => setFEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s}>{s}</option>)}
        </select>
        {activeFilters > 0 && (
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm adm-toolbar__clear" onClick={clearFilters}>
            Limpiar filtros ({activeFilters})
          </button>
        )}
      </div>

      <p className="adm-resultcount">{list.length} resultado{list.length === 1 ? "" : "s"}</p>

      <ProductTable productos={list} onEdit={(p) => setForm({ product: p })} onDelete={setToDelete}
        onStatus={(id, s) => { cat.setStatus(id, s); say(`Estado cambiado a «${s}».`); }} />

      {form && (
        <ProductAdminForm product={form.product} productos={productos} marcas={marcas} notasDisponibles={notasDisponibles}
          onSave={save} onAddBrand={cat.addBrand} onCancel={() => setForm(null)} />
      )}
      {toDelete && <DeleteConfirmModal product={toDelete} onConfirm={remove} onCancel={() => setToDelete(null)} />}
      {confirmReset && (
        <Modal title="Descartar cambios" size="sm" onClose={() => setConfirmReset(false)} labelledBy="reset-modal-title">
          <div className="adm-modal__body">
            <p className="adm-confirm__text">¿Volver al catálogo original de <code>products.js</code>?</p>
            <p className="adm-hint">Se perderán los cambios hechos en este navegador que no hayas exportado.</p>
          </div>
          <footer className="adm-modal__foot">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setConfirmReset(false)} data-autofocus>Cancelar</button>
            <button type="button" className="adm-btn adm-btn--danger" onClick={() => { cat.resetCatalog(); setConfirmReset(false); say("Catálogo restablecido."); }}>Sí, descartar</button>
          </footer>
        </Modal>
      )}
    </div>
  );
}
