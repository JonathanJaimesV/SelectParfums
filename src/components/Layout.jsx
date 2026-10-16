import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import BottomNav from "./BottomNav.jsx";
import { WhatsAppIcon, InstagramIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  // En la ficha del perfume la barra de compra reemplaza a la barra inferior de navegación.
  const onDetail = pathname.startsWith("/perfume/");
  return (
    <div className={`app ${onDetail ? "app--buybar" : "app--tabs"}`}>
      <Header />
      <main><Outlet /></main>
      <footer className="footer" id="footer">
        <div className="container">
          <p className="footer__phrase">"Gracias por elegir una fragancia con carácter"</p>
          <div className="footer__links">
            <a href={WA_GENERIC} className="footer__link" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon /> WhatsApp</a>
            <a href="https://www.instagram.com/selectparfums.col/" className="footer__link" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /> Instagram</a>
          </div>
          <p className="footer__copy">&copy; 2026 SelectParfums. Todos los derechos reservados.</p>
        </div>
      </footer>
      {!onDetail && <BottomNav />}
      <a href={WA_GENERIC} className="fab-wa" id="fabWa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp"><WhatsAppIcon /></a>
    </div>
  );
}
