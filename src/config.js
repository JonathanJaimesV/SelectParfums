// Número de WhatsApp del negocio, en formato internacional para wa.me: código de país + número,
// sin espacios, signos ni guiones (Colombia: "57" + 10 dígitos, ej. 573001234567).
// Se puede sobrescribir al compilar con la variable pública VITE_WHATSAPP_NUMBER (Netlify → Site configuration →
// Environment variables). Es público: NO pongas secretos en variables VITE_*.
// Si queda vacío o inválido, el carrito muestra "falta configurar el número" y NO genera ningún enlace.
export const WHATSAPP_NUMBER = String(import.meta.env.VITE_WHATSAPP_NUMBER || "573156504121").replace(/\D/g, "");

// Dominio público de la tienda (canonical, sitemap, datos estructurados).
// Si cambias de dominio, actualízalo aquí, en index.html y en public/robots.txt.
export const SITE_URL = "https://selectparfumscol.netlify.app";
export const SITE_NAME = "SelectParfums Colombia";

