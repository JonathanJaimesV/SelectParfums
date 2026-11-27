import { Icon } from "../components/Icons.jsx";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import BrandModal from "./BrandModal.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";

export default function AdminBrands() {
  const cat = useCatalog();
  const { say } = useOutletContext();
  const { marcas } = cat;
  const [creating, setCreating] = useState(false);

  const create = (brand) => {
    cat.addBrand(brand);
    say(`Marca «${brand.nombre}» creada.`);
    setCreating(false);
  };

  return (
    <div className="adm-brands">
      <div className="adm-pageline">
        <p className="adm-pageline__count">{marcas.length} marca{marcas.length === 1 ? "" : "s"}</p>
        <button type="button" className="adm-btn adm-btn--gold" onClick={() => setCreating(true)}>
          <Icon name="plus" className="icon icon--sm" /> Nueva marca
        </button>
      </div>

      {marcas.length === 0 ? (
        <p className="adm-empty">Todavía no hay marcas. Crea la primera para poder asignarla a un perfume.</p>
      ) : (
        <div className="adm-brandgrid">
          {marcas.map((m) => (
            <article className="adm-brandcard" key={m.id}>
              <div className="adm-brandcard__icon"><Icon name="layers" className="icon" /></div>
              <div className="adm-brandcard__body">
                <h3>{m.nombre}</h3>
                {m.descripcion && <p className="adm-brandcard__desc">{m.descripcion}</p>}
                <span className="adm-tag">{m.fragancias} perfume{m.fragancias === 1 ? "" : "s"}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {creating && <BrandModal marcas={marcas} onSave={create} onCancel={() => setCreating(false)} />}
    </div>
  );
}
