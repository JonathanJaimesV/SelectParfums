import { Icon } from "../components/Icons.jsx";
import { MAX_QTY } from "./cartLogic.js";

/** Selector de cantidad con botones táctiles de 44 px. `min` = 1: para quitar un artículo hay un botón aparte. */
export default function QuantityStepper({ value, onChange, label, min = 1, max = MAX_QTY }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" className="qty__btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Disminuir cantidad">
        <Icon name="minus" />
      </button>
      <output className="qty__value" aria-live="polite">{value}</output>
      <button type="button" className="qty__btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={value >= max ? `Máximo ${max} unidades` : "Aumentar cantidad"}>
        <Icon name="plus" />
      </button>
    </div>
  );
}
