import { useState } from "react";
import { ESTADOS } from "../services/catalogService";
import { formatPrice } from "../utils";

function Thumb({ p }) {
  const [failed, setFailed] = useState(false);
  return p.imagen && !failed
    ? <img className="adm-thumb" src={p.imagen} alt="" loading="lazy" onError={() => setFailed(true)} />
    : <span className="adm-thumb adm-thumb--empty" aria-hidden="true">—</span>;
}

/** Tabla de productos: editar, cambiar estado al instante y eliminar. En móvil cada fila se vuelve una tarjeta. */
export default function ProductTable({ productos, onEdit, onDelete, onStatus }) {
  if (!productos.length) {
    return <p className="adm-empty">No hay perfumes que coincidan con los filtros.</p>;
  }
  return (
    <div className="adm-tablewrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th scope="col">Perfume</th>
            <th scope="col">Género</th>
            <th scope="col">Estado</th>
            <th scope="col" className="adm-num">Frasco</th>
            <th scope="col" className="adm-num">Decant 5 ml</th>
            <th scope="col" className="adm-num">Decant 10 ml</th>
            <th scope="col"><span className="adm-sr">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td data-label="Perfume">
                <div className="adm-product">
                  <Thumb p={p} />
                  <div>
                    <p className="adm-product__brand">{p.marca}</p>
                    <p className="adm-product__name">{p.nombre}</p>
                  </div>
                </div>
              </td>
              <td data-label="Género"><span className="adm-tag">{p.categoria}</span></td>
              <td data-label="Estado">
                <select className={`adm-status adm-status--${p.disponibilidad.toLowerCase()}`} value={p.disponibilidad}
                  aria-label={`Estado de ${p.marca} ${p.nombre}`} onChange={(e) => onStatus(p.id, e.target.value)}>
                  {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td data-label="Frasco" className="adm-num">{formatPrice(p.precioFrasco)}</td>
              <td data-label="Decant 5 ml" className="adm-num">{formatPrice(p.precioDecant5)}</td>
              <td data-label="Decant 10 ml" className="adm-num">{formatPrice(p.precioDecant10)}</td>
              <td className="adm-actions">
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onEdit(p)}>Editar</button>
                <button type="button" className="adm-btn adm-btn--dangerghost adm-btn--sm" onClick={() => onDelete(p)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
