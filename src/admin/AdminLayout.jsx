import { Icon } from "../components/Icons.jsx";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./admin.css";
import AdminGate from "./AdminGate.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { buildExport } from "../services/catalogService";

const download = (name, href) => {
  const a = document.createElement("a");
  a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove();
};

const NAV = [
  {
    group: "General",
    items: [{ to: "/admin", end: true, icon: "panel", label: "Resumen" }],
  },
  {
    group: "Catálogo",
    items: [
      { to: "/admin/perfumes", icon: "bottle", label: "Perfumes" },
      { to: "/admin/marcas", icon: "layers", label: "Marcas" },
    ],
  },
];

const TITLES = { "/admin": "Resumen", "/admin/perfumes": "Perfumes", "/admin/marcas": "Marcas" };

/**
 * Shell del panel: sidebar (colapsable en escritorio, menú desplegable en móvil) + barra superior.
 * Contiene también el candado de acceso (AdminGate) y las acciones globales (exportar catálogo),
 * que se exponen a las páginas hijas vía el contexto de <Outlet>.
 */
export default function AdminLayoutInner() {
  const cat = useCatalog();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("selectparfums:admin-sidebar") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    document.title = "Panel interno | SelectParfums";
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { localStorage.setItem("selectparfums:admin-sidebar", collapsed ? "1" : "0"); }, [collapsed]);

  const say = (msg) => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 3200); };

  const exportCatalog = () => {
    const { code, files } = buildExport(cat.state);
    download("products.js", URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
    files.forEach((f, i) => setTimeout(() => download(f.name, f.dataUrl), 400 * (i + 1)));
    say(files.length ? `products.js + ${files.length} imagen(es) descargados.` : "products.js descargado.");
  };

  const title = TITLES[pathname] || "Panel interno";

  const sidebar = (
    <nav className="adm-side__nav" aria-label="Secciones del panel">
      {NAV.map((g) => (
        <div className="adm-side__group" key={g.group}>
          <p className="adm-side__label">{g.group}</p>
          {g.items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `adm-side__link${isActive ? " is-active" : ""}`}>
              <Icon name={it.icon} className="icon icon--sm" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
      <div className="adm-side__group">
        <p className="adm-side__label">Herramientas</p>
        <a href="/catalogo" target="_blank" rel="noreferrer" className="adm-side__link">
          <Icon name="store" className="icon icon--sm" /><span>Ver tienda</span>
        </a>
        <button type="button" className="adm-side__link adm-side__link--btn" onClick={exportCatalog}>
          <Icon name="download" className="icon icon--sm" /><span>Exportar catálogo</span>
        </button>
      </div>
    </nav>
  );

  return (
    <AdminGate>
      <div className={`adm adm-shell${collapsed ? " is-collapsed" : ""}`}>
        <aside className="adm-side" aria-label="Navegación del panel">
          <div className="adm-side__brand">
            <span className="adm-side__mark">SP</span>
            <span className="adm-side__brandtext">SelectParfums<small>Panel interno</small></span>
          </div>
          {sidebar}
          <button type="button" className="adm-side__collapse" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}>
            <Icon name="collapse" className="icon icon--sm" />
            <span>Colapsar</span>
          </button>
        </aside>

        {mobileOpen && <div className="adm-side__scrim" onClick={() => setMobileOpen(false)} />}
        <aside className={`adm-side adm-side--mobile${mobileOpen ? " is-open" : ""}`} aria-label="Navegación del panel (móvil)">
          <div className="adm-side__brand">
            <span className="adm-side__mark">SP</span>
            <span className="adm-side__brandtext">SelectParfums<small>Panel interno</small></span>
            <button type="button" className="adm-iconbtn" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><Icon name="close" className="icon icon--sm" /></button>
          </div>
          {sidebar}
        </aside>

        <div className="adm-body">
          <header className="adm-top">
            <div className="adm-top__inner">
              <div className="adm-top__left">
                <button type="button" className="adm-iconbtn adm-top__burger" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
                  <Icon name="menu" className="icon icon--sm" />
                </button>
                <div>
                  <p className="adm-breadcrumb">Panel interno {pathname !== "/admin" && <><span aria-hidden="true">/</span> {title}</>}</p>
                  <h1 className="adm-h1">{title}</h1>
                </div>
              </div>
              <div className="adm-top__actions">
                {cat.modified && (
                  <span className="adm-pending" title="Tienes cambios guardados solo en este navegador">
                    <Icon name="dot" className="icon icon--xs" /> Cambios sin exportar
                  </span>
                )}
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate("/catalogo")}>Ver tienda</button>
                <button type="button" className="adm-btn adm-btn--gold adm-btn--sm" onClick={exportCatalog}>
                  <Icon name="download" className="icon icon--sm" /> Exportar
                </button>
              </div>
            </div>
          </header>

          <main className="adm-main">
            {cat.saveError && <div className="adm-alert adm-alert--error" role="alert">{cat.saveError}</div>}
            <Outlet context={{ say, exportCatalog }} />
          </main>
        </div>

        {toast && <div className="adm-toast" role="status">{toast}</div>}
      </div>
    </AdminGate>
  );
}
