import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import { WhatsAppIcon, InstagramIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
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
      <a href={WA_GENERIC} className="fab-wa" id="fabWa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp"><WhatsAppIcon /></a>
    </>
  );
}
