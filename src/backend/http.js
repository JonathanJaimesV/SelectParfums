// Cliente HTTP mínimo para Supabase (PostgREST + Auth) con `fetch`. Sin dependencias.
// Solo recibe la clave PÚBLICA; los permisos reales los imponen las políticas RLS y las funciones SQL del servidor.

export class BackendError extends Error {
  constructor(kind, message, extra = {}) { super(message); this.name = "BackendError"; this.kind = kind; Object.assign(this, extra); }
}
// kind: network | timeout | auth | forbidden | unavailable | validation | not_found | rate_limited | server | bad_response | config

/** Traduce una respuesta HTTP de error de PostgREST a un BackendError con tipo claro. */
export function mapHttpError(status, body) {
  const msg = String(body?.message || body?.error_description || body?.msg || "");
  const code = body?.code;
  const m = /^ITEM_UNAVAILABLE:(\d+):(5|10|full):(\w+)/.exec(msg);
  if (m) return new BackendError("unavailable", msg, { status, code, productId: Number(m[1]), presentation: m[2], reason: m[3] });
  if (status === 401) return new BackendError("auth", "Sesión no válida o vencida", { status, code });
  if (status === 403 || code === "42501" || msg === "FORBIDDEN") return new BackendError("forbidden", "No tienes permisos para esta operación", { status, code });
  if (status === 404 || code === "PGRST202") return new BackendError("config", "La función no existe: ¿se aplicó la migración?", { status, code });
  if (status === 429) return new BackendError("rate_limited", "Demasiadas solicitudes", { status, code });
  if (status >= 400 && status < 500) return new BackendError("validation", msg || "Solicitud no válida", { status, code });
  return new BackendError("server", "Error del servidor", { status, code });
}

/**
 * Llama a una función SQL (RPC): POST {url}/rest/v1/rpc/{fn}.
 * cfg = { url, key, token?, fetchImpl?, timeoutMs? }. `token` (sesión de administrador) sustituye a la clave pública en Authorization.
 */
export async function rpc(fn, args, cfg) {
  const { url, key, token, fetchImpl = (...a) => globalThis.fetch(...a), timeoutMs = 12000 } = cfg;
  if (!url || !key) throw new BackendError("config", "Backend no configurado");
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  let res;
  try {
    res = await fetchImpl(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${token || key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(args ?? {}),
      signal: ctrl?.signal,
    });
  } catch (e) {
    throw new BackendError(e?.name === "AbortError" ? "timeout" : "network", e?.name === "AbortError" ? "La solicitud tardó demasiado" : "Sin conexión con el servidor");
  } finally { if (timer) clearTimeout(timer); }
  let body = null;
  const text = await res.text().catch(() => "");
  try { body = text ? JSON.parse(text) : null; } catch { if (res.ok) throw new BackendError("bad_response", "Respuesta ilegible del servidor"); }
  if (!res.ok) throw mapHttpError(res.status, body);
  return body;
}
