import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { logoOf } from "../components/HouseShowcase.jsx";
import { Icon, SearchIcon } from "../components/Icons.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { IMAGE_MANIFEST } from "../data/imageManifest";
import { useSeo } from "../seo";
import { STATIC_SEO } from "../seoData.js";
import { AVAILABILITY, CATS, SORTS, filterProducts } from "../catalogQuery.js";
import "../catalog.css";

const SORT_LABELS = [
  ["", "Predeterminado"],
  ["price-asc", "Precio: menor a mayor"],
  ["price-desc", "Precio: mayor a menor"],
  ["name-asc", "Nombre: A – Z"],
  ["name-desc", "Nombre: Z – A"],
];
const BANNER_IMG = "/assets/images/hero/hero-campaign.webp";

/** Opción de filtro de selección única: mismo efecto que el chip / la lista desplegable anterior. */
function Opt({ on, onClick, count, children, logo, brand }) {
  return (
    <button type="button" className={`cat-opt${on ? " is-on" : ""}${brand ? " cat-opt--brand" : ""}`} aria-pressed={on} onClick={onClick}>
      {brand
        ? <span className="cat-opt__logo" aria-hidden="true">{logo ? <img src={logo} alt="" /> : <b>{String(brand).charAt(0)}</b>}</span>
        : <span className="cat-opt__mark" aria-hidden="true" />}
      <span className="cat-opt__label">{children}</span>
      {count != null && <em aria-label={`${count} fragancias`}>{count}</em>}
    </button>
  );
}

export default function Catalog() {
  useSeo(STATIC_SEO["/catalogo"]);
  const { productos: PRODUCTOS } = useCatalog();
  // Todos los filtros viven en la URL (?cat=Hombre&marca=Armaf&q=oud&disp=Preventa&orden=price-asc):
  // se pueden compartir, funcionan con el botón "atrás" y los enlaces del menú.
  const [params, setParams] = useSearchParams();
  const search = params.get("q") || "";
  const availability = AVAILABILITY.find((a) => a === params.get("disp")) || "";
  const sort = SORTS[params.get("orden")] ? params.get("orden") : "";
  const [showFilters, setShowFilters] = useState(false); // solo afecta al móvil: en ≥900px los filtros siempre se ven
  const searchRef = useRef(null);
  const { hash } = useLocation();
  // El icono de búsqueda del header enlaza a /catalogo#buscar: abre el panel (móvil) y enfoca el campo
  useEffect(() => {
    if (hash !== "#buscar") return;
    setShowFilters(true);
    const t = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [hash]);

  // Panel móvil: Escape lo cierra y el fondo no se desplaza mientras está abierto
  useEffect(() => {
    if (!showFilters) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setShowFilters(false); };
    document.addEventListener("keydown", onKey);
    const narrow = window.matchMedia("(max-width: 899px)").matches;
    if (narrow) document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [showFilters]);

  const catParam = params.get("cat") || "";
  const cat = CATS.find((c) => c.toLowerCase() === catParam.toLowerCase()) || "Todos";
  const brand = params.get("marca") || "";
  const setParam = (k, v) => {
    const n = new URLSearchParams(params);
    if (v && v !== "Todos") n.set(k, v); else n.delete(k);
    setParams(n, { replace: true });
  };
  const brands = useMemo(() => [...new Set(PRODUCTOS.map((p) => p.marca))].sort(), [PRODUCTOS]);

  const list = useMemo(() => filterProducts(PRODUCTOS, { search, cat, brand, availability, sort }), [PRODUCTOS, search, cat, brand, availability, sort]);

  // Cantidades (del catálogo completo) junto a cada opción, calculadas con la misma función de filtrado
  const base = { search: "", cat: "Todos", brand: "", availability: "", sort: "" };
  const catCounts = useMemo(() => Object.fromEntries(CATS.map((c) => [c, filterProducts(PRODUCTOS, { ...base, cat: c }).length])), [PRODUCTOS]); // eslint-disable-line react-hooks/exhaustive-deps
  const brandCounts = useMemo(() => Object.fromEntries(brands.map((b) => [b, filterProducts(PRODUCTOS, { ...base, brand: b }).length])), [PRODUCTOS, brands]); // eslint-disable-line react-hooks/exhaustive-deps
  const availCounts = useMemo(() => Object.fromEntries(AVAILABILITY.map((a) => [a, filterProducts(PRODUCTOS, { ...base, availability: a }).length])), [PRODUCTOS]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = [
    cat !== "Todos" && { key: "cat", label: cat },
    brand && { key: "marca", label: brand },
    availability && { key: "disp", label: availability },
    search && { key: "q", label: `“${search}”` },
  ].filter(Boolean);
  const hasFilters = active.length > 0 || sort;
  const clear = () => setParams({}, { replace: true });
  const filtersBadge = active.length + (sort ? 1 : 0);
  const showBanner = IMAGE_MANIFEST.has(BANNER_IMG);

  return (
    <div className="cat-page" id="catalogo">
      <button type="button" className={`cat-overlay${showFilters ? " is-open" : ""}`} tabIndex={-1} aria-hidden="true" onClick={() => setShowFilters(false)} />

      {/* ── Filtros (lateral izquierdo en escritorio; panel deslizable en móvil) ── */}
      <aside className={`cat-side${showFilters ? " is-open" : ""}`} id="catalogFilters" aria-label="Filtros del catálogo">
        <div className="cat-side__head">
          <h2>Filtros</h2>
          <div className="cat-side__head-actions">
            {hasFilters && <button type="button" className="cat-linkbtn" onClick={clear}>Limpiar todo</button>}
            <button type="button" className="cat-side__close" aria-label="Cerrar filtros" onClick={() => setShowFilters(false)}><Icon name="close" /></button>
          </div>
        </div>

        <div className="cat-side__scroll">
          <div className="cat-block" id="buscar">
            <label className="cat-block__title" htmlFor="catSearch">Buscar</label>
            <div className="cat-search">
              <SearchIcon />
              <input ref={searchRef} id="catSearch" type="search" className="cat-search__input" placeholder="Fragancia o marca…"
                enterKeyHint="search" value={search} onChange={(e) => setParam("q", e.target.value)} />
            </div>
          </div>

          <div className="cat-block" role="group" aria-labelledby="cat-t-cat">
            <h3 className="cat-block__title" id="cat-t-cat">Categoría</h3>
            {CATS.map((c) => <Opt key={c} on={c === cat} count={catCounts[c]} onClick={() => setParam("cat", c)}>{c}</Opt>)}
          </div>

          <div className="cat-block" role="group" aria-labelledby="cat-t-brand">
            <h3 className="cat-block__title" id="cat-t-brand">Casa</h3>
            <Opt on={!brand} count={PRODUCTOS.length} onClick={() => setParam("marca", "")}>Todas las casas</Opt>
            {brands.map((b) => (
              <Opt key={b} brand={b} logo={logoOf(b)} on={b === brand} count={brandCounts[b]} onClick={() => setParam("marca", b)}>{b}</Opt>
            ))}
          </div>

          <div className="cat-block" role="group" aria-labelledby="cat-t-disp">
            <h3 className="cat-block__title" id="cat-t-disp">Disponibilidad</h3>
            <Opt on={!availability} onClick={() => setParam("disp", "")}>Todas</Opt>
            {AVAILABILITY.map((a) => <Opt key={a} on={a === availability} count={availCounts[a]} onClick={() => setParam("disp", a)}>{a}</Opt>)}
          </div>
        </div>

        <div className="cat-side__apply">
          <button type="button" className="btn-gold" onClick={() => setShowFilters(false)}>Ver {list.length} fragancia{list.length !== 1 ? "s" : ""}</button>
        </div>
      </aside>

      {/* ── Resultados ── */}
      <div className="cat-main">
        <header className="cat-hero">
          {showBanner && <img className="cat-hero__img" src={BANNER_IMG} alt="" width="1672" height="940" loading="lazy" decoding="async" />}
          <div className="cat-hero__copy">
            <nav className="cat-crumb" aria-label="Migas de pan"><Link to="/">Inicio</Link><span aria-hidden="true">/</span><span aria-current="page">Catálogo</span></nav>
            <p className="cat-hero__label">Catálogo de fragancias</p>
            <h1 className="cat-hero__title">Descubre tu próxima esencia</h1>
            <p className="cat-hero__text">Elige entre frascos completos o decants de 5 ml y 10 ml, listos para entrega inmediata o preventa.</p>
          </div>
        </header>

        <div className="cat-bar">
          <button type="button" className="cat-filtbtn" aria-expanded={showFilters} aria-controls="catalogFilters" onClick={() => setShowFilters(true)}>
            <Icon name="sliders" /> <span>Filtros</span>
            {filtersBadge > 0 && <span className="cat-filtbtn__count">{filtersBadge}</span>}
          </button>
          <p className="cat-count" role="status" aria-live="polite"><span>{list.length}</span> fragancia{list.length !== 1 ? "s" : ""}</p>
          <div className="cat-chips" aria-label="Filtros activos">
            {active.map((f) => (
              <span className="cat-chip" key={f.key}>
                {f.label}
                <button type="button" aria-label={`Quitar filtro ${f.label}`} onClick={() => setParam(f.key, "")}><Icon name="close" /></button>
              </span>
            ))}
            {hasFilters && <button type="button" className="cat-linkbtn" onClick={clear}>Limpiar filtros</button>}
          </div>
          <label className="cat-sort">
            <span className="sr-only">Ordenar por</span>
            <select aria-label="Ordenar por" value={sort} onChange={(e) => setParam("orden", e.target.value)}>
              {SORT_LABELS.map(([v, l]) => <option key={v} value={v}>{v ? l : "Ordenar: Predeterminado"}</option>)}
            </select>
          </label>
        </div>

        {list.length > 0 && (
          <>
            <h2 className="sr-only">Resultados</h2>
            <div className="cat-grid">{list.map((p) => <ProductCard key={p.id} p={p} featured={p.destacado === true} />)}</div>
          </>
        )}
        <div className={`catalog-empty${list.length === 0 ? " is-visible" : ""}`}>
          <p className="catalog-empty__icon"><SearchIcon /></p>
          <h2 className="catalog-empty__title">No encontramos fragancias con esos filtros</h2>
          <p className="catalog-empty__text">Intenta con otros términos de búsqueda o quita algunos filtros. Si buscas una fragancia en particular, escríbenos y la consultamos.</p>
          <button type="button" className="btn-outline" onClick={clear}>Limpiar filtros</button>
        </div>
      </div>
    </div>
  );
}
