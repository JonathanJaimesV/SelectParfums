import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { Icon, SearchIcon } from "../components/Icons.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useTitle } from "../utils";

const CATS = ["Todos", "Hombre", "Mujer", "Unisex"];
const SORTS = {
  "price-asc": (a, b) => (a.precioDecant5 ?? Infinity) - (b.precioDecant5 ?? Infinity),
  "price-desc": (a, b) => (b.precioDecant5 ?? -1) - (a.precioDecant5 ?? -1),
  "name-asc": (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  "name-desc": (a, b) => b.nombre.localeCompare(a.nombre, "es"),
};

export default function Catalog() {
  useTitle("Catálogo de Fragancias | SelectParfums");
  const { productos: PRODUCTOS } = useCatalog();
  // categoría y marca viven en la URL (?cat=Hombre&marca=Armaf): se pueden compartir y los links del menú funcionan
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("");
  const [showFilters, setShowFilters] = useState(false); // solo afecta al móvil: en ≥768px los filtros siempre se ven
  const searchRef = useRef(null);
  const { hash } = useLocation();
  // El icono de búsqueda del header enlaza a /catalogo#buscar: enfoca el campo
  useEffect(() => { if (hash === "#buscar") searchRef.current?.focus(); }, [hash]);

  const catParam = params.get("cat") || "";
  const cat = CATS.find((c) => c.toLowerCase() === catParam.toLowerCase()) || "Todos";
  const brand = params.get("marca") || "";
  const setParam = (k, v) => {
    const n = new URLSearchParams(params);
    if (v && v !== "Todos") n.set(k, v); else n.delete(k);
    setParams(n, { replace: true });
  };
  const brands = useMemo(() => [...new Set(PRODUCTOS.map((p) => p.marca))].sort(), [PRODUCTOS]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const r = PRODUCTOS.filter((p) =>
      (!q || [p.nombre, p.marca, p.descripcion, p.categoria].some((s) => s.toLowerCase().includes(q))) &&
      (cat === "Todos" || p.categoria === cat) &&
      (!brand || p.marca === brand) &&
      (!availability || p.disponibilidad === availability)
    );
    return SORTS[sort] ? [...r].sort(SORTS[sort]) : r;
  }, [PRODUCTOS, search, cat, brand, availability, sort]);

  const activeFilters = [brand, availability, sort].filter(Boolean).length;
  const hasFilters = search || cat !== "Todos" || brand || availability || sort;
  const clear = () => {
    setSearch(""); setAvailability(""); setSort("");
    setParams({}, { replace: true });
  };

  return (
    <>
      <PageBanner crumb="Catálogo" label="Colección completa" title="Catálogo de Fragancias"
        subtitle="Encuentra tu fragancia ideal. Elige entre frascos completos o decants de 5 ml y 10 ml listos para entrega inmediata o preventa." />
      <section className="catalog-section" id="catalogo" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="catalog-toolbar">
            <div className="catalog-bar">
              <div className="catalog-search" id="buscar">
                <div className="catalog-search__wrap">
                  <SearchIcon />
                  <input ref={searchRef} type="search" className="catalog-search__input" placeholder="Buscar fragancia o marca…"
                    aria-label="Buscar fragancias" enterKeyHint="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button type="button" className="catalog-filter-toggle" aria-label="Filtros" aria-expanded={showFilters} aria-controls="catalogFilters"
                  onClick={() => setShowFilters((v) => !v)}>
                  <Icon name="sliders" /> <span className="catalog-filter-toggle__text">Filtros</span>
                  {activeFilters > 0 && <span className="catalog-filter-toggle__count">{activeFilters}</span>}
                </button>
              </div>
              <div className="catalog-chips" role="group" aria-label="Filtrar por categoría">
                {CATS.map((c) => (
                  <button key={c} className={`catalog-chip${c === cat ? " is-active" : ""}`} aria-pressed={c === cat} onClick={() => setParam("cat", c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className={`catalog-filters${showFilters ? " is-open" : ""}`} id="catalogFilters">
              <select aria-label="Filtrar por marca" value={brand} onChange={(e) => setParam("marca", e.target.value)}>
                <option value="">Todas las marcas</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select aria-label="Filtrar por disponibilidad" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="">Disponibilidad</option>
                <option value="Preventa">Preventa</option>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
              </select>
              <select aria-label="Ordenar por" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Ordenar por</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A – Z</option>
                <option value="name-desc">Nombre: Z – A</option>
              </select>
            </div>
          </div>

          <div className="catalog-meta">
            <p className="catalog-count">Mostrando <span>{list.length}</span> fragancias</p>
            <button className={`catalog-clear${hasFilters ? " is-visible" : ""}`} onClick={clear}>✕ Limpiar filtros</button>
          </div>

          {list.length > 0 && (
            <div className="products-grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          )}
          <div className={`catalog-empty${list.length === 0 ? " is-visible" : ""}`}>
            <p className="catalog-empty__icon"><SearchIcon /></p>
            <h3 className="catalog-empty__title">No encontramos fragancias con esos filtros</h3>
            <p className="catalog-empty__text">Intenta con otros términos de búsqueda o haz clic en limpiar filtros.</p>
          </div>
        </div>
      </section>
    </>
  );
}
