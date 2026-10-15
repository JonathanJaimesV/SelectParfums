/**
 * products.js — Catálogo de fragancias
 * ─────────────────────────────────────
 * Para agregar un perfume, copia un objeto del arreglo y modifica sus campos.
 * Usa `null` en cualquier precio para que se muestre como "Consultar".
 * Las imágenes se definen en el campo `imagen`; mientras tanto se usa un placeholder.
 */

// ──────────────────────────────────────────────
// Marcas / Casas de perfumería
// ──────────────────────────────────────────────
export const MARCAS = [
  {
    id: "afnan",
    nombre: "Afnan",
    descripcion:
      "Combina la tradición de la perfumería oriental con un toque occidental moderno y refinado; frascos de diseño impecable y rendimiento duradero a precios accesibles.",
    fragancias: 0, // se calcula dinámicamente
  },
  {
    id: "armaf",
    nombre: "Armaf",
    descripcion:
      "Una de las marcas más vendidas del Medio Oriente, reconocida por excelentes interpretaciones de perfumes de nicho y de lujo, con proyección y duración excepcionales.",
    fragancias: 0,
  },
  {
    id: "french-avenue",
    nombre: "French Avenue",
    descripcion:
      "Línea de lujo de Fragrance World que emula la alta perfumería francesa, con ingredientes de mayor calidad y presentación lujosa.",
    fragancias: 0,
  },
  {
    id: "rasasi",
    nombre: "Rasasi",
    descripcion:
      "Casa emiratí fundada en 1979 que equilibra la perfumería árabe clásica (oud, especias, ámbar) con líneas modernas de estilo occidental.",
    fragancias: 0,
  },
];

// ──────────────────────────────────────────────
// Catálogo de productos
// ──────────────────────────────────────────────
export const PRODUCTOS = [
  {
    id: 1,
    marca: "Afnan",
    nombre: "9PM",
    categoria: "Hombre",
    descripcion:
      "Aroma goloso y cautivador de vainilla, ámbar y frutas, conocido por su gran duración.",
    imagen: "/assets/images/AFNAN/9PM/afnan-9pm.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 240000,
    precioDecant5: 22000,
    precioDecant10: 35000,
    disponibilidad: "Preventa",
  },
  {
    id: 2,
    marca: "Afnan",
    nombre: "9AM",
    categoria: "Unisex",
    descripcion:
      "Fragancia fresca y luminosa de cítricos y lavanda, perfecta para la mañana.",
    imagen: "/assets/images/AFNAN/9AM/afnan-9am.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: null,
    precioDecant5: null,
    precioDecant10: null,
    disponibilidad: "Preventa",
  },
  {
    id: 3,
    marca: "Armaf",
    nombre: "Dunescape",
    categoria: "Unisex",
    descripcion:
      "Oceánica, vibrante y refrescante, con cítricos, notas marinas y base amaderada sutil.",
    imagen: "/assets/images/ARMAF/Dunescape/armaf-dunescape.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 280000,
    precioDecant5: 23000,
    precioDecant10: 33000,
    disponibilidad: "Preventa",
  },
  {
    id: 4,
    marca: "Armaf",
    nombre: "Club de Nuit Intense Man EDT",
    categoria: "Hombre",
    descripcion:
      "Cítrica y ahumada con fondo amaderado, intensa y de gran proyección.",
    imagen: "/assets/images/ARMAF/ClubDeNuitIntenseMan/armaf-cdnim.jpg",
    tamanoFrasco: "105 ml",
    precioFrasco: 220000,
    precioDecant5: 20000,
    precioDecant10: 33000,
    disponibilidad: "Preventa",
  },
  {
    id: 5,
    marca: "Armaf",
    nombre: "Odyssey Aqua",
    categoria: "Hombre",
    descripcion:
      "Aromática y fresca: naranja y pomelo con acentos de menta, mentol y ambroxan. Refinada para el día a día.",
    imagen: "/assets/images/ARMAF/OdysseyAqua/armaf-odyssey-aqua.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 280000,
    precioDecant5: 23000,
    precioDecant10: 33000,
    disponibilidad: "Preventa",
  },
  {
    id: 6,
    marca: "Armaf",
    nombre: "Club de Nuit Untold EDP",
    categoria: "Unisex",
    descripcion:
      "Aroma atemporal, elegante y extraordinariamente duradero.",
    imagen: "/assets/images/ARMAF/ClubDeNuitUntold/armaf-cdnu.jpg",
    tamanoFrasco: "105 ml",
    precioFrasco: 250000,
    precioDecant5: 22000,
    precioDecant10: 35000,
    disponibilidad: "Preventa",
  },
  {
    id: 7,
    marca: "French Avenue",
    nombre: "Liquid Brun",
    categoria: "Unisex",
    descripcion:
      "Ambarada y opulenta, con vainilla especiada, canela y maderas nobles. Cálida, sofisticada y envolvente.",
    imagen: "/assets/images/FRENCH-AVENUE/fa-liquid-brun.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 225000,
    precioDecant5: 20000,
    precioDecant10: 33000,
    disponibilidad: "Preventa",
  },
  {
    id: 8,
    marca: "French Avenue",
    nombre: "Vulcan Feu",
    categoria: "Unisex",
    descripcion:
      "Mango exótico, chispa de jengibre y calidez de ámbar gris. Pura energía y sofisticación.",
    imagen: "/assets/images/FRENCH-AVENUE/fa-vulcan-feu.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 250000,
    precioDecant5: 22000,
    precioDecant10: 35000,
    disponibilidad: "Preventa",
  },
  {
    id: 9,
    marca: "Rasasi",
    nombre: "Hawas Kobra",
    categoria: "Hombre",
    descripcion:
      "Acuática y ambarada, potente y seductora, con un toque especiado para los audaces.",
    imagen: "/assets/images/RASASI/rasasi-hawas-kobra.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 240000,
    precioDecant5: 22000,
    precioDecant10: 35000,
    disponibilidad: "Preventa",
  },
  {
    id: 10,
    marca: "Rasasi",
    nombre: "Hawas Ice",
    categoria: "Hombre",
    descripcion:
      "Frescura helada de cítricos y notas marinas, ideal para el calor y el uso diario.",
    imagen: "/assets/images/RASASI/rasasi-hawas-ice.jpg",
    tamanoFrasco: "100 ml",
    precioFrasco: 260000,
    precioDecant5: 22000,
    precioDecant10: 35000,
    disponibilidad: "Preventa",
  },
];

// ──────────────────────────────────────────────
// Calcular cantidad de fragancias por marca
// ──────────────────────────────────────────────
MARCAS.forEach((m) => {
  m.fragancias = PRODUCTOS.filter(
    (p) => p.marca.toLowerCase() === m.nombre.toLowerCase()
  ).length;
});
