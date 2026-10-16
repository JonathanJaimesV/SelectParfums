/**
 * Pirámide olfativa por perfume (clave = id en products.js).
 * Todas las notas presentadas en español.
 */

export const NOTAS = {
  1: { // Afnan 9PM
    salida: ["Bergamota", "Lavanda silvestre", "Canela", "Manzana"],
    corazon: ["Lirio de los valles", "Flor de Azahar"],
    fondo: ["Pachulí", "Ámbar", "Vainilla", "Haba tonka"],
  },
  2: { // Afnan 9AM
    salida: ["Mandarina", "Limón", "Cardamomo", "Pimienta rosa"],
    corazon: ["Lavanda", "Manzana verde", "Flor de Azahar", "Rosa"],
    fondo: ["Almizcle", "Musgo", "Cedro", "Pachulí"],
  },
  3: { // Armaf Dunescape
    salida: ["Naranja sanguina", "Bergamota", "Mandarina", "Limón (lima ácida)", "Jengibre", "Salvia", "Enebro"],
    corazon: ["Manzana", "Notas ozónicas", "Cachemira", "Geranio", "Rosa"],
    fondo: ["Almizcle", "Sándalo", "Ámbar"],
  },
  4: { // Armaf Club de Nuit Intense Man EDT
    salida: ["Limón", "Piña", "Bergamota", "Grosella negra", "Manzana"],
    corazon: ["Abedul", "Rosa", "Jazmín"],
    fondo: ["Almizcle", "Ámbar gris", "Pachulí", "Vainilla"],
  },
  5: { // Armaf Odyssey Aqua
    salida: ["Toronja", "Naranja", "Abrótano"],
    corazon: ["Menta", "Lavanda"],
    fondo: ["Ambroxan", "Ciprés", "Pachulí"],
  },
  6: { // Armaf Club de Nuit Untold
    salida: ["Azafrán", "Jazmín"],
    corazon: ["Madera de ámbar", "Ámbar gris"],
    fondo: ["Resina de abeto", "Madera de cedro"],
  },
  7: { // French Avenue Liquid Brun
    salida: ["Canela", "Cardamomo", "Flor de Azahar", "Naranjo", "Bergamota"],
    corazon: ["Vainilla Bourbon", "Elemí"],
    fondo: ["Praliné", "Ambroxan", "Madera de gaiac", "Almizcle"],
  },
  8: { // French Avenue Vulcan Feu
    salida: ["Azafrán", "Jazmín"],
    corazon: ["Madera de ámbar", "Ámbar gris"],
    fondo: ["Resina de abeto", "Madera de cedro"],
  },
  9: { // Rasasi Hawas Kobra
    salida: ["Jengibre", "Bergamota", "Naranja Tangerina"],
    corazon: ["Té verde", "Neroli", "Canela"],
    fondo: ["Almizcle", "Notas Amaderadas", "Ámbar"],
  },
  10: { // Rasasi Hawas Ice
    salida: ["Manzana Helada", "Limón Italiano", "Bergamota de Sicilia", "Anís estrellado"],
    corazon: ["Ciruela", "Flor de Azahar", "Cardamomo"],
    fondo: ["Almizcle", "Ámbar", "Driftwood", "Musgo"],
  },
};

/**
 * Diccionario y mapeo visual de notas aromáticas en español
 */
export const NOTE_MAP = {
  // Con iconos dedicados del diseño de referencia
  "bergamota": { es: "Bergamota", icon: "/assets/images/notes/icons/bergamot.png" },
  "bergamota de sicilia": { es: "Bergamota de Sicilia", icon: "/assets/images/notes/icons/bergamot.png" },

  "lavanda": { es: "Lavanda", icon: "/assets/images/notes/icons/lavandin.png" },
  "lavanda silvestre": { es: "Lavanda silvestre", icon: "/assets/images/notes/icons/lavandin.png" },
  "lavandín": { es: "Lavandín", icon: "/assets/images/notes/icons/lavandin.png" },
  "lavandin": { es: "Lavandín", icon: "/assets/images/notes/icons/lavandin.png" },

  "canela": { es: "Canela", icon: "/assets/images/notes/icons/cinnamon.png" },

  "manzana": { es: "Manzana", icon: "/assets/images/notes/icons/apple.png" },
  "manzana verde": { es: "Manzana verde", icon: "/assets/images/notes/icons/apple.png" },
  "manzana helada": { es: "Manzana Helada", icon: "/assets/images/notes/icons/apple.png" },

  "lirio de los valles": { es: "Lirio de los valles", icon: "/assets/images/notes/icons/muguet.png" },

  "azahar": { es: "Flor de Azahar", icon: "/assets/images/notes/icons/orange-blossom.png" },
  "flor de azahar": { es: "Flor de Azahar", icon: "/assets/images/notes/icons/orange-blossom.png" },
  "naranjo": { es: "Flor de Azahar (Naranjo)", icon: "/assets/images/notes/icons/orange-blossom.png" },
  "neroli": { es: "Neroli (Azahar)", icon: "/assets/images/notes/icons/orange-blossom.png" },

  "pachulí": { es: "Pachulí", icon: "/assets/images/notes/icons/patchouli.png" },
  "pachuli": { es: "Pachulí", icon: "/assets/images/notes/icons/patchouli.png" },

  "ámbar": { es: "Ámbar", icon: "/assets/images/notes/icons/amber.png" },
  "ambar": { es: "Ámbar", icon: "/assets/images/notes/icons/amber.png" },
  "ámbar gris": { es: "Ámbar gris", icon: "/assets/images/notes/icons/amber.png" },
  "ambar gris": { es: "Ámbar gris", icon: "/assets/images/notes/icons/amber.png" },
  "madera de ámbar": { es: "Madera de ámbar", icon: "/assets/images/notes/icons/amber.png" },
  "amberwood": { es: "Madera de ámbar", icon: "/assets/images/notes/icons/amber.png" },

  "vainilla": { es: "Vainilla", icon: "/assets/images/notes/icons/vanilla.png" },
  "vainilla bourbon": { es: "Vainilla Bourbon", icon: "/assets/images/notes/icons/vanilla.png" },

  "haba tonka": { es: "Haba tonka", icon: "/assets/images/notes/icons/tonka-bean.png" },

  // Notas botánicas y amaderadas con iconos visuales
  "mandarina": { es: "Mandarina", emoji: "🍊" },
  "limón": { es: "Limón", emoji: "🍋" },
  "limon": { es: "Limón", emoji: "🍋" },
  "limón (lima ácida)": { es: "Limón (lima ácida)", emoji: "🍋" },
  "limón italiano": { es: "Limón Italiano", emoji: "🍋" },
  "naranja": { es: "Naranja", emoji: "🍊" },
  "naranja sanguina": { es: "Naranja sanguina", emoji: "🍊" },
  "naranja tangerina": { es: "Naranja Tangerina", emoji: "🍊" },
  "toronja": { es: "Toronja", emoji: "🍊" },
  "cardamomo": { es: "Cardamomo", emoji: "🫚" },
  "pimienta rosa": { es: "Pimienta rosa", emoji: "🌶️" },
  "jengibre": { es: "Jengibre", emoji: "🫚" },
  "salvia": { es: "Salvia", emoji: "🌿" },
  "enebro": { es: "Enebro", emoji: "🫐" },
  "piña": { es: "Piña", emoji: "🍍" },
  "grosella negra": { es: "Grosella negra", emoji: "🫐" },
  "abrótano": { es: "Abrótano", emoji: "🌿" },
  "azafrán": { es: "Azafrán", emoji: "🌾" },
  "anís estrellado": { es: "Anís estrellado", emoji: "⭐" },
  "jazmín": { es: "Jazmín", emoji: "🌸" },
  "menta": { es: "Menta", emoji: "🍃" },
  "rosa": { es: "Rosa", emoji: "🌹" },
  "notas ozónicas": { es: "Notas ozónicas", emoji: "🌊" },
  "cachemira": { es: "Cachemira", emoji: "🪶" },
  "geranio": { es: "Geranio", emoji: "🌺" },
  "abedul": { es: "Abedul", emoji: "🪵" },
  "elemí": { es: "Elemí", emoji: "🌿" },
  "té verde": { es: "Té verde", emoji: "🍵" },
  "ciruela": { es: "Ciruela", emoji: "🍑" },
  "almizcle": { es: "Almizcle", emoji: "🫧" },
  "musgo": { es: "Musgo", emoji: "🌿" },
  "cedro": { es: "Cedro", emoji: "🪵" },
  "madera de cedro": { es: "Madera de cedro", emoji: "🪵" },
  "sándalo": { es: "Sándalo", emoji: "🪵" },
  "ambroxan": { es: "Ambroxan", emoji: "🧪" },
  "ciprés": { es: "Ciprés", emoji: "🌲" },
  "resina de abeto": { es: "Resina de abeto", emoji: "🌲" },
  "praliné": { es: "Praliné", emoji: "🍫" },
  "madera de gaiac": { es: "Madera de gaiac", emoji: "🪵" },
  "notas amaderadas": { es: "Notas Amaderadas", emoji: "🪵" },
  "driftwood": { es: "Driftwood", emoji: "🪵" },
};

/**
 * Normaliza y obtiene información de la nota en español
 */
export function getNoteInfo(rawName) {
  if (!rawName) return { name: "", es: "", icon: null, emoji: "✨" };
  const clean = String(rawName).trim();
  const key = clean.toLowerCase();
  const info = NOTE_MAP[key] || {};
  return {
    raw: clean,
    name: info.es || clean,
    es: info.es || clean,
    icon: info.icon || null,
    emoji: info.emoji || "✨",
  };
}
