import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import BottomNav from "./BottomNav.jsx";
import { WhatsAppIcon, InstagramIcon } from "./Icons.jsx";
import { WA_GENERIC } from "../utils";
import CartToast from "../cart/CartToast.jsx";

const NAV_LINKS = [
  ["/catalogo", "Catálogo"],
  ["/marcas", "Marcas"],
  ["/decants", "Decants"],
  ["/como-pedir", "Cómo pedir"],
];

const YEAR = new Date().getFullYear();

export default function Layout() {
  const { pathname } = useLocation();
  // Sin animación: con scroll-behavior: smooth la página nueva "viajaba" desde la posición anterior
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [pathname]);
  const onDetail = pathname.startsWith("/perfume/");
  return (
    <div className={`app ${onDetail ? "app--buybar" : "app--tabs"}`}>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Header />
      <main id="main"><Outlet /></main>
      <CartToast />
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <Link to="/" className="footer__logo">SelectParfums</Link>
              <p className="footer__tagline">
                Perfumería especializada en fragancias árabes y de nicho. Frascos completos y decants con envío a Colombia.
              </p>
            </div>
            <a href={WA_GENERIC} target="_blank" rel="noopener noreferrer" className="footer__cta">
              Escríbenos por WhatsApp <span className="arrow" aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <div className="footer__grid">
            <nav className="footer__col" aria-label="Explorar">
              <h2 className="footer__col-title">Explorar</h2>
              <ul className="footer__nav">
                {NAV_LINKS.map(([to, label]) => (
                  <li key={to}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </nav>

            <nav className="footer__col" aria-label="Comprar">
              <h2 className="footer__col-title">Comprar</h2>
              <ul className="footer__nav">
                <li><Link to="/como-pedir">Proceso de compra</Link></li>
                <li><a href={WA_GENERIC} target="_blank" rel="noopener noreferrer">Contactar por WhatsApp</a></li>
              </ul>
            </nav>

            <div className="footer__col">
              <h2 className="footer__col-title">Atención</h2>
              <ul className="footer__nav">
                <li>
                  <a href={WA_GENERIC} target="_blank" rel="noopener noreferrer" className="footer__wa-link">
                    <WhatsAppIcon /> Escríbenos
                  </a>
                </li>
                <li className="footer__info-text">Envíos a Cúcuta y Bogotá</li>
                <li className="footer__info-text">Nequi · Bancolombia</li>
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="footer__copy">&copy; {YEAR} SelectParfums Colombia. Todos los derechos reservados.</p>
            <div className="footer__social">
              <a href={WA_GENERIC} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer__social-link">
                <WhatsAppIcon />
              </a>
              <a href="https://www.instagram.com/selectparfums.col/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer__social-link">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      </footer>
      {!onDetail && <BottomNav />}
      <a href={WA_GENERIC} className="fab-wa" id="fabWa" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp"><WhatsAppIcon /></a>
    </div>
  );
}
