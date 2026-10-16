import { useState } from "react";

const PIN = import.meta.env.VITE_ADMIN_PIN;
const KEY = "selectparfums:admin-ok";

/**
 * Candado simple. OJO: en un sitio estático el PIN viaja dentro del JavaScript, así que es una
 * barrera para curiosos, NO seguridad real. Si no hay VITE_ADMIN_PIN, no se pide nada
 * (pensado para `npm run dev` local). Seguridad real = backend con login (ver README-ADMIN.md).
 */
export default function AdminGate({ children }) {
  const [ok, setOk] = useState(() => !PIN || sessionStorage.getItem(KEY) === "1");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  if (ok) return children;

  const submit = (e) => {
    e.preventDefault();
    if (value === PIN) { sessionStorage.setItem(KEY, "1"); setOk(true); }
    else { setError(true); setValue(""); }
  };
  return (
    <div className="adm adm-gate">
      <form className="adm-gate__card" onSubmit={submit}>
        <h1 className="adm-gate__title">Panel interno</h1>
        <p className="adm-hint">Ingresa el PIN de administración.</p>
        <input className="adm-input" type="password" value={value} autoFocus autoComplete="off" aria-label="PIN"
          onChange={(e) => { setValue(e.target.value); setError(false); }} />
        {error && <p className="adm-error" role="alert">PIN incorrecto.</p>}
        <button className="adm-btn adm-btn--gold" type="submit">Entrar</button>
      </form>
    </div>
  );
}
