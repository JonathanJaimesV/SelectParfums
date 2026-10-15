import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Reveal from "../components/Reveal.jsx";
import { DecantIcon } from "../components/Icons.jsx";
import { useTitle } from "../utils";

const CARDS = [
  { d: "M9 2h6l1 7H8L9 2z", rect: { x: 7, y: 9, width: 10, height: 13 }, title: "Para descubrir", size: "Decant 5 ml",
    text: "La cantidad ideal para probar un perfume durante 2 a 3 semanas. Evalúa su apertura, evolución y fijación real en tu pH antes de comprar el frasco entero." },
  { d: "M8 2h8l1 8H7L8 2z", rect: { x: 6, y: 10, width: 12, height: 12 }, title: "Para disfrutar", size: "Decant 10 ml",
    text: "Mayor cantidad para llevar siempre contigo en el bolsillo o bolso. Rinde más de 120 atomizaciones, perfecto para rotar entre múltiples aromas de lujo sin gastar de más." },
];
const ROWS = [
  ["Decant 5 ml", "60 – 75 sprays", "Probar en piel y conocer el rendimiento"],
  ["Decant 10 ml", "130 – 150 sprays", "Llevar de viaje o uso frecuente"],
  ["Frasco Completo (100 ml)", "1.200 – 1.400 sprays", "Tu fragancia firma o aroma favorito"],
];

export default function Decants() {
  useTitle("¿Qué es un Decant? | SelectParfums");
  return (
    <>
      <PageBanner crumb="¿Qué es un decant?" label="Guía de formatos" title="¿Qué es un Decant?"
        subtitle="Un decant es una porción 100% auténtica de perfume original trasvasada con cuidado milimétrico a un atomizador de vidrio de viaje. Es la forma más inteligente de probar fragancias de nicho en tu piel antes de adquirir el frasco completo." />
      <section className="decant-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="decant-cards">
            {CARDS.map((c) => (
              <Reveal key={c.size} className="decant-card">
                <div className="decant-card__icon"><DecantIcon d={c.d} rect={c.rect} /></div>
                <h2 className="decant-card__title">{c.title}</h2>
                <p className="decant-card__size">{c.size}</p>
                <p className="decant-card__text">{c.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="decant-guide">
            <h3 className="decant-guide__title">Tabla de Rendimiento Estimado</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="decant-table">
                <thead><tr><th>Formato</th><th>Atomizaciones aprox.</th><th>Uso recomendado</th></tr></thead>
                <tbody>
                  {ROWS.map(([f, a, u]) => <tr key={f}><td><strong>{f}</strong></td><td>{a}</td><td>{u}</td></tr>)}
                </tbody>
              </table>
            </div>
          </Reveal>
          <div style={{ marginTop: 50, textAlign: "center" }}>
            <Link to="/catalogo" className="btn-gold">Ver fragancias disponibles en decant</Link>
          </div>
        </div>
      </section>
    </>
  );
}
