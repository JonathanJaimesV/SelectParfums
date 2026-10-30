import { Icon } from "../components/Icons.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./admin.css";
import AdminGate from "./AdminGate.jsx";
import Modal from "./Modal.jsx";
import ProductTable from "./ProductTable.jsx";
import ProductAdminForm from "./ProductAdminForm.jsx";
import DeleteConfirmModal from "./DeleteConfirmModal.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { ESTADOS, GENEROS, buildExport } from "../services/catalogService";

const download = (name, href) => {
  const a = document.createElement("a");
  a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove();
};

export default function AdminPage() {
  const cat = useCatalog();
  const { productos, marcas, notasDisponibles } = cat;

  const [form, setForm] = useState(null);        // null | { product: obj|null }
  const [toDelete, setToDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const [q, setQ] = useState("");
  const [fGenero, setFGenero] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fMarca, setFMarca] = useState("");

  useEffect(() => {
    document.title = "Panel interno | SelectParfums";
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const say = (msg) => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 3200); };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return productos.filter((p) =>
      (!s || `${p.marca} ${p.nombre}`.toLowerCase().includes(s)) &&
      (!fGenero || (p.generos || [p.categoria]).includes(fGenero)) && (!fEstado || p.disponibilidad === fEstado) && (!fMarca || p.marca === fMarca));
  }, [productos, q, fGenero, fEstado, fMarca]);

  const counts = useMemo(() => ESTADOS.map((s) => [s, productos.filter((p) => p.disponibilidad === s).length]), [productos]);

  const save = (data) => {
    if (data.id != null) { cat.updateProduct(data); say("Cambios guardados."); }
    else { cat.addProduct(data); say("Perfume creado."); }
    setForm(null);
  };
  const remove = () => { cat.deleteProduct(toDelete.id); say(`«${toDelete.nombre}» eliminado.`); setToDelete(null); };

  const exportCatalog = () => {
    const { code, files } = buildExport(cat.state);
    download("products.js", URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
    files.forEach((f, i) => setTimeout(() => download(f.name, f.dataUrl), 400 * (i + 1)));
    say(files.length ? `products.js + ${files.length} imagen(es) descargados.` : "products.js descargado.");
  };

  return (
    <AdminGate>
      <div className="adm">
        <header className="adm-top">
          <div className="adm-container adm-top__inner">
            <div>
              <p className="adm-eyebrow">Uso interno</p>
              <h1 className="adm-h1">Catálogo de perfumes</h1>
            </div>
            <div className="adm-top__actions">
              <Link to="/catalogo" className="adm-btn adm-btn--ghost">Ver tienda</Link>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={exportCatalog}>Exportar products.js</button>
              <button type="button" className="adm-btn adm-btn--gold" onClick={() => setForm({ product: null })}><Icon name="plus" className="icon icon--sm" /> Nuevo perfume</button>
            </div>
          </div>
        </header>

        <main className="adm-container adm-main">
          {cat.saveError && <div className="adm-alert adm-alert--error" role="alert">{cat.saveError}</div>}
          {cat.modified && (
            <div className="adm-alert" role="status">
              Tienes cambios guardados <strong>solo en este navegador</strong>. Para publicarlos, usa <em>Exportar products.js</em> y reemplaza <code>src/data/products.js</code>.
              <button type="button" className="adm-link" onClick={() => setConfirmReset(true)}>Descartar cambios</button>
            </div>
          )}

          <ul className="adm-stats" aria-label="Resumen">
            <li><strong>{productos.length}</strong><span>Perfumes</span></li>
            <li><strong>{marcas.length}</strong><span>Marcas</span></li>
            {counts.map(([s, n]) => <li key={s}><strong>{n}</strong><span>{s}</span></li>)}
          </ul>

          <div className="adm-filters">
            <input className="adm-input" type="search" placeholder="Buscar por marca o nombre…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
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
          </div>

          <ProductTable productos={list} onEdit={(p) => setForm({ product: p })} onDelete={setToDelete}
            onStatus={(id, s) => { cat.setStatus(id, s); say(`Estado cambiado a «${s}».`); }} />
        </main>

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
        {toast && <div className="adm-toast" role="status">{toast}</div>}
      </div>
    </AdminGate>
  );
}
