import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { SearchIcon } from "../components/Icons.jsx";
import { PRODUCTOS } from "../data/products";
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
  // categoría y marca viven en la URL (?cat=Hombre&marca=Armaf): se pueden compartir y los links del menú funcionan
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("");

  const catParam = params.get("cat") || "";
  const cat = CATS.find((c) => c.toLowerCase() === catParam.toLowerCase()) || "Todos";
  const brand = params.get("marca") || "";
  const setParam = (k, v) => {
    const n = new URLSearchParams(params);
    if (v && v !== "Todos") n.set(k, v); else n.delete(k);
    setParams(n, { replace: true });
  };
  const brands = useMemo(() => [...new Set(PRODUCTOS.map((p) => p.marca))].sort(), []);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = PRODUCTOS.filter((p) =>
      (!q || [p.nombre, p.marca, p.descripcion, p.categoria].some((s) => s.toLowerCase().includes(q))) &&
      (cat === "Todos" || p.categoria === cat) &&
      (!brand || p.marca === brand) &&
      (!availability || p.disponibilidad === availability)
    );
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      r = r.filter((p) => p.precioDecant5 != null && p.precioDecant5 >= min && p.precioDecant5 <= max);
    }
    return SORTS[sort] ? [...r].sort(SORTS[sort]) : r;
  }, [search, cat, brand, availability, priceRange, sort]);

  const hasFilters = search || cat !== "Todos" || brand || availability || priceRange || sort;
  const clear = () => {
    setSearch(""); setAvailability(""); setPriceRange(""); setSort("");
    setParams({}, { replace: true });
  };

  return (
    <>
      <PageBanner crumb="Catálogo" label="Colección completa" title="Catálogo de Fragancias"
        subtitle="Encuentra tu fragancia ideal. Elige entre frascos completos o decants de 5 ml y 10 ml listos para entrega inmediata o preventa." />
      <section className="catalog-section" id="catalogo" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="catalog-bar">
            <div className="catalog-search">
              <SearchIcon />
              <input type="search" className="catalog-search__input" placeholder="Buscar por nombre, marca o nota aromática…"
                aria-label="Buscar fragancias" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="catalog-chips" role="group" aria-label="Filtrar por categoría">
              {CATS.map((c) => (
                <button key={c} className={`catalog-chip${c === cat ? " is-active" : ""}`} onClick={() => setParam("cat", c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="catalog-filters">
            <select aria-label="Filtrar por marca" value={brand} onChange={(e) => setParam("marca", e.target.value)}>
              <option value="">Todas las marcas</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select aria-label="Filtrar por disponibilidad" value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">Disponibilidad</option>
              <option value="Preventa">Preventa</option>
              <option value="Disponible">Disponible</option>
            </select>
            <select aria-label="Rango de precio decant" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="">Rango de precio (Decant)</option>
              <option value="0-22000">Hasta $22.000</option>
              <option value="22000-30000">$22.000 – $30.000</option>
              <option value="30000-99999999">Más de $30.000</option>
            </select>
            <select aria-label="Ordenar por" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Ordenar por</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A – Z</option>
              <option value="name-desc">Nombre: Z – A</option>
            </select>
          </div>

          <div className="catalog-meta">
            <p className="catalog-count">Mostrando <span>{list.length}</span> fragancias</p>
            <button className={`catalog-clear${hasFilters ? " is-visible" : ""}`} onClick={clear}>✕ Limpiar filtros</button>
          </div>

          {list.length > 0 && (
            <div className="products-grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          )}
          <div className={`catalog-empty${list.length === 0 ? " is-visible" : ""}`}>
            <p className="catalog-empty__icon">🔍</p>
            <h3 className="catalog-empty__title">No encontramos fragancias con esos filtros</h3>
            <p className="catalog-empty__text">Intenta con otros términos de búsqueda o haz clic en limpiar filtros.</p>
          </div>
        </div>
      </section>
    </>
  );
}
