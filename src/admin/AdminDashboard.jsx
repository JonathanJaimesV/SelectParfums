import { Icon } from "../components/Icons.jsx";
import { Link, useOutletContext } from "react-router-dom";
import { useMemo } from "react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { ESTADOS } from "../services/catalogService";

const ESTADO_ICON = { Disponible: "check", Agotado: "close", Preventa: "clock" };

/**
 * Resumen: solo muestra cifras que pueden calcularse con datos reales del catálogo.
 * No incluye ventas, pedidos, clientes ni ninguna métrica comercial inventada.
 */
export default function AdminDashboard() {
  const cat = useCatalog();
  const { exportCatalog } = useOutletContext();
  const { productos, marcas } = cat;

  const counts = useMemo(() => ESTADOS.map((s) => [s, productos.filter((p) => p.disponibilidad === s).length]), [productos]);

  return (
    <div className="adm-dash">
      <section aria-label="Cifras del catálogo">
        <div className="adm-stats adm-stats--dash">
          <div className="adm-stat adm-stat--lg">
            <Icon name="bottle" className="icon adm-stat__icon" />
            <div><strong>{productos.length}</strong><span>Perfumes en catálogo</span></div>
          </div>
          <div className="adm-stat adm-stat--lg">
            <Icon name="layers" className="icon adm-stat__icon" />
            <div><strong>{marcas.length}</strong><span>Marcas</span></div>
          </div>
          {counts.map(([s, n]) => (
            <div className={`adm-stat adm-stat--state adm-stat--${s.toLowerCase()}`} key={s}>
              <Icon name={ESTADO_ICON[s]} className="icon adm-stat__icon" />
              <div><strong>{n}</strong><span>{s}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Accesos rápidos" className="adm-quick">
        <h2 className="adm-section__title">Accesos rápidos</h2>
        <div className="adm-quick__grid">
          <Link to="/admin/perfumes?new=1" className="adm-quickcard">
            <Icon name="plus" className="icon" />
            <div><strong>Agregar perfume</strong><span>Crear una nueva ficha de producto</span></div>
          </Link>
          <Link to="/admin/perfumes" className="adm-quickcard">
            <Icon name="bottle" className="icon" />
            <div><strong>Ver catálogo</strong><span>Buscar, filtrar y editar perfumes</span></div>
          </Link>
          <Link to="/admin/marcas" className="adm-quickcard">
            <Icon name="layers" className="icon" />
            <div><strong>Gestionar marcas</strong><span>Crear y revisar casas de perfumería</span></div>
          </Link>
          <button type="button" className="adm-quickcard adm-quickcard--btn" onClick={exportCatalog}>
            <Icon name="download" className="icon" />
            <div><strong>Exportar catálogo</strong><span>Descarga products.js para publicar</span></div>
          </button>
        </div>
      </section>

      <section aria-label="Estado del almacenamiento local" className="adm-info">
        <h2 className="adm-section__title">Estado</h2>
        <div className="adm-infobox">
          <Icon name={cat.modified ? "dot" : "check"} className="icon" />
          <div>
            {cat.modified ? (
              <>
                <strong>Hay cambios guardados solo en este navegador.</strong>
                <p className="adm-hint">Usa «Exportar catálogo» y reemplaza <code>src/data/products.js</code> para publicarlos.</p>
              </>
            ) : (
              <>
                <strong>No hay cambios locales pendientes.</strong>
                <p className="adm-hint">El catálogo que ves coincide con el publicado en <code>src/data/products.js</code>.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
