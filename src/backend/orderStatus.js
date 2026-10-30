// Estados de pedido y transiciones permitidas. ES LA MISMA TABLA que `order_transition_allowed()` en
// supabase/migrations/0001_init.sql (un test compara ambas). La base de datos es la que decide; esto sirve para la interfaz.
export const ORDER_STATUSES = ["iniciado", "pendiente_confirmacion", "confirmado", "pendiente_pago", "pagado", "en_preparacion", "enviado", "entregado", "cancelado"];

export const STATUS_LABELS = {
  iniciado: "Iniciado (solicitud sin confirmar)",
  pendiente_confirmacion: "Pendiente de confirmación",
  confirmado: "Confirmado",
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const TRANSITIONS = {
  iniciado: ["pendiente_confirmacion", "confirmado", "cancelado"],
  pendiente_confirmacion: ["confirmado", "cancelado"],
  confirmado: ["pendiente_pago", "pagado", "cancelado"],
  pendiente_pago: ["pagado", "cancelado"],
  pagado: ["en_preparacion", "cancelado"],
  en_preparacion: ["enviado", "cancelado"],
  enviado: ["entregado"],
  entregado: [],
  cancelado: [],
};

export const canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to);
export const isFinalStatus = (s) => (TRANSITIONS[s] || []).length === 0;
