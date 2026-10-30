import { evaluateBackendConfig, CONFIG_PROBLEMS } from "./backendConfigCore.js";

// Variables PÚBLICAS (se incrustan en el JavaScript): VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
// Sin ellas la tienda funciona igual que antes (checkout por WhatsApp directo, sin registro de pedidos).
export const BACKEND = evaluateBackendConfig(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export const BACKEND_CONFIGURED = BACKEND.configured;

if (!BACKEND.configured && BACKEND.problem && BACKEND.problem !== "missing" && typeof console !== "undefined") {
  console.error(`[backend] Configuración rechazada: ${CONFIG_PROBLEMS[BACKEND.problem]}`);
}
