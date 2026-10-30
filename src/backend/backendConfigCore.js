// Evaluación PURA de la configuración de Supabase (sin import.meta: se prueba con `npm test`).
// Las variables VITE_* son PÚBLICAS: terminan dentro del JavaScript que descarga cualquier visitante.
// Por eso aquí solo se acepta una clave PÚBLICA (anon / publishable) y se RECHAZA cualquier clave privilegiada.

function jwtRole(token) {
  try {
    const part = String(token).split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    return JSON.parse(atob(b64)).role ?? null;
  } catch { return null; }
}

export const URL_OK = /^https:\/\/[a-z0-9.-]+(:\d+)?$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

/** → { configured, url, key, problem } ; problem ∈ missing | bad_url | secret_key | unrecognized_key */
export function evaluateBackendConfig(rawUrl, rawKey) {
  const url = String(rawUrl || "").trim().replace(/\/+$/, "");
  const key = String(rawKey || "").trim();
  if (!url || !key) return { configured: false, url: "", key: "", problem: "missing" };
  if (!URL_OK.test(url)) return { configured: false, url: "", key: "", problem: "bad_url" };
  // Claves privilegiadas: NUNCA deben llegar al navegador. Se rechazan aunque alguien las pegue por error.
  if (/^sb_secret_/i.test(key)) return { configured: false, url: "", key: "", problem: "secret_key" };
  const role = jwtRole(key);
  if (role && role !== "anon") return { configured: false, url: "", key: "", problem: "secret_key" };
  if (!/^sb_publishable_/i.test(key) && role !== "anon") return { configured: false, url: "", key: "", problem: "unrecognized_key" };
  return { configured: true, url, key, problem: null };
}

export const CONFIG_PROBLEMS = {
  missing: "Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.",
  bad_url: "VITE_SUPABASE_URL debe ser una URL https:// de tu proyecto Supabase.",
  secret_key: "La clave configurada es PRIVILEGIADA (service_role/secret). Nunca la uses en el navegador: usa la clave pública anon/publishable.",
  unrecognized_key: "La clave no parece una clave pública de Supabase (anon JWT o sb_publishable_…).",
};
