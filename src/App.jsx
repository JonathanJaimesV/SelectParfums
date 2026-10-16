import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import Brands from "./pages/Brands.jsx";
import Decants from "./pages/Decants.jsx";
import HowToOrder from "./pages/HowToOrder.jsx";
import PerfumeDetail from "./pages/PerfumeDetail.jsx";

// Panel interno: solo existe en `npm run dev` o si se compila con VITE_ENABLE_ADMIN=true.
// En el build público normal NO se incluye (el código se elimina del bundle).
const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === "true";
const AdminPage = ADMIN_ENABLED ? lazy(() => import("./admin/AdminPage.jsx")) : null;

const SECTIONS = ["catalogo", "marcas", "decants", "como-pedir"];

export default function App() {
  return (
    <Routes>
      {ADMIN_ENABLED && (
        <Route path="admin" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
      )}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="marcas" element={<Brands />} />
        <Route path="decants" element={<Decants />} />
        <Route path="como-pedir" element={<HowToOrder />} />
        <Route path="perfume/:slug" element={<PerfumeDetail />} />
        {/* URLs antiguas del sitio estático */}
        {SECTIONS.map((s) => (
          <Route key={s} path={`${s}/${s}.html`} element={<Navigate to={`/${s}`} replace />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
