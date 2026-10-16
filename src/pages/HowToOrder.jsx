import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Reveal from "../components/Reveal.jsx";
import { Icon } from "../components/Icons.jsx";
import { WA_GENERIC, useTitle } from "../utils";

const STEPS = [
  ["Elige tu fragancia", <>Explora nuestro catálogo y selecciona el formato que prefieras: <strong>Frasco completo</strong>, <strong>Decant de 5 ml</strong> o <strong>Decant de 10 ml</strong>.</>],
  ["Escríbenos por WhatsApp", "Haz clic en el botón de compra del perfume. Se abrirá una conversación con el mensaje prellenado indicando la fragancia y formato. Te responderemos al instante confirmando disponibilidad."],
  ["Paga y Recibe", "Realizas el pago seguro y despachamos tu pedido completamente original y te avisaremos en cuanto tiempo pasaremos a tu domicilio."],
];
const PAYMENTS = [
  ["phone", "Nu & Nequi", "Transferencia instantánea desde tu celular a cualquier hora."],
  ["bank", "Transferencia Bancaria", "Bancolombia."],
  ["truck", "Envíos a Cúcuta y Bogotá", "Coordinadora, Interrapidísimo o Servientrega con guía de rastreo."],
];

export default function HowToOrder() {
  useTitle("Cómo Hacer Tu Pedido | SelectParfums");
  return (
    <>
      <PageBanner crumb="Cómo pedir" label="Proceso de compra" title="Cómo Hacer Tu Pedido"
        subtitle="Comprar en SelectParfums es simple, transparente y seguro. Te asesoramos directamente por WhatsApp en cada paso de tu compra." />
      <section className="how-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="how-steps">
            {STEPS.map(([title, text], i) => (
              <Reveal key={title} className="how-step">
                <div className="how-step__number">{i + 1}</div>
                <h2 className="how-step__title">{title}</h2>
                <p className="how-step__text">{text}</p>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p className="section-label">¿Primera vez comprando un decant?</p>
            <Link to="/decants" className="btn-outline">Conoce los formatos y sus ventajas</Link>
          </div>
          <div style={{ marginTop: 70 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p className="section-label">Medios de pago en Colombia</p>
              <h3 className="section-title" style={{ fontSize: "1.8rem" }}>Paga con Total Tranquilidad</h3>
            </div>
            <div className="payment-methods">
              {PAYMENTS.map(([icon, name, desc]) => (
                <Reveal key={name} className="payment-card">
                  <div className="payment-card__icon"><Icon name={icon} /></div>
                  <h4 className="payment-card__name">{name}</h4>
                  <p className="payment-card__desc">{desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 60, textAlign: "center", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/catalogo" className="btn-gold">Ir al catálogo de productos</Link>
            <a href={WA_GENERIC} className="btn-outline" target="_blank" rel="noopener noreferrer">Hablar con un asesor por WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  );
}
