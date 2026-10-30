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
 * Diccionario y mapeo visual de notas aromáticas en español.
 * Cada nota apunta a un icono ilustrado en /assets/images/notes/icons (fuentes SVG en icons-svg-fuente).
 * Para agregar una nota nueva: crea el icono (PNG + SVG) y añade una línea aquí.
 */
const ICON_DIR = "/assets/images/notes/icons/";
const n = (es, icon) => ({ es, icon: `${ICON_DIR}${icon}.png` });

export const NOTE_MAP = {
  "bergamota": n("Bergamota", "bergamot"),
  "bergamota de sicilia": n("Bergamota de Sicilia", "bergamot"),
  "lavanda": n("Lavanda", "lavandin"),
  "lavanda silvestre": n("Lavanda silvestre", "lavandin"),
  "lavandín": n("Lavandín", "lavandin"),
  "lavandin": n("Lavandín", "lavandin"),
  "canela": n("Canela", "cinnamon"),
  "manzana": n("Manzana", "apple"),
  "manzana verde": n("Manzana verde", "apple"),
  "manzana helada": n("Manzana Helada", "apple"),
  "lirio de los valles": n("Lirio de los valles", "muguet"),
  "azahar": n("Flor de Azahar", "orange-blossom"),
  "flor de azahar": n("Flor de Azahar", "orange-blossom"),
  "naranjo": n("Flor de Azahar (Naranjo)", "orange-blossom"),
  "flor de azahar (naranjo)": n("Flor de Azahar (Naranjo)", "orange-blossom"),
  "neroli": n("Neroli (Azahar)", "orange-blossom"),
  "pachulí": n("Pachulí", "patchouli"),
  "pachuli": n("Pachulí", "patchouli"),
  "ámbar": n("Ámbar", "amber"),
  "ambar": n("Ámbar", "amber"),
  "ámbar gris": n("Ámbar gris", "amber"),
  "ambar gris": n("Ámbar gris", "amber"),
  "madera de ámbar": n("Madera de ámbar", "amber"),
  "amberwood": n("Madera de ámbar", "amber"),
  "vainilla": n("Vainilla", "vanilla"),
  "vainilla bourbon": n("Vainilla Bourbon", "vanilla"),
  "haba tonka": n("Haba tonka", "tonka-bean"),
  "limón": n("Limón", "lemon"),
  "limon": n("Limón", "lemon"),
  "limón italiano": n("Limón Italiano", "lemon"),
  "limón (lima ácida)": n("Limón (lima ácida)", "lime"),
  "lima": n("Limón (lima ácida)", "lime"),
  "lima ácida": n("Limón (lima ácida)", "lime"),
  "naranja": n("Naranja", "orange"),
  "naranja tangerina": n("Naranja Tangerina", "mandarin"),
  "mandarina": n("Mandarina", "mandarin"),
  "naranja sanguina": n("Naranja sanguina", "blood-orange"),
  "toronja": n("Toronja", "grapefruit"),
  "pomelo": n("Toronja", "grapefruit"),
  "cardamomo": n("Cardamomo", "cardamom"),
  "pimienta rosa": n("Pimienta rosa", "pink-pepper"),
  "pimienta negra": n("Pimienta negra", "black-pepper"),
  "jengibre": n("Jengibre", "ginger"),
  "anís estrellado": n("Anís estrellado", "star-anise"),
  "azafrán": n("Azafrán", "saffron"),
  "nuez moscada": n("Nuez moscada", "nutmeg"),
  "enebro": n("Enebro", "juniper"),
  "rosa": n("Rosa", "rose"),
  "jazmín": n("Jazmín", "jasmine"),
  "flores blancas": n("Flores blancas", "white-flowers"),
  "geranio": n("Geranio", "geranium"),
  "violeta": n("Violeta", "violet"),
  "iris": n("Iris", "iris"),
  "nardos": n("Nardos", "tuberose"),
  "nardo": n("Nardos", "tuberose"),
  "tuberosa": n("Nardos", "tuberose"),
  "davana": n("Davana", "davana"),
  "menta": n("Menta", "mint"),
  "salvia": n("Salvia", "sage"),
  "abrótano": n("Abrótano", "sage"),
  "hojas de higuera": n("Hojas de higuera", "fig-leaf"),
  "musgo": n("Musgo", "moss"),
  "té verde": n("Té verde", "green-tea"),
  "vetiver": n("Vetiver", "vetiver"),
  "ciprés": n("Ciprés", "conifer"),
  "resina de abeto": n("Resina de abeto", "conifer"),
  "cedro": n("Cedro", "wood-log"),
  "madera de cedro": n("Madera de cedro", "wood-log"),
  "madera de gaiac": n("Madera de gaiac", "wood-log"),
  "notas amaderadas": n("Notas Amaderadas", "wood-log"),
  "madera seca": n("Madera seca", "wood-log"),
  "mahonial": n("Mahonial", "wood-log"),
  "akigalawood": n("Akigalawood", "wood-log"),
  "sándalo": n("Sándalo", "sandalwood"),
  "abedul": n("Abedul", "birch"),
  "driftwood": n("Driftwood", "driftwood"),
  "elemí": n("Elemí", "resin"),
  "benjuí": n("Benjuí", "resin"),
  "mirra": n("Mirra", "resin"),
  "ládano": n("Ládano", "resin"),
  "almizcle": n("Almizcle", "musk"),
  "ambroxan": n("Ambroxan", "ambroxan"),
  "ambrofix": n("AmbroFix", "ambroxan"),
  "notas ozónicas": n("Notas ozónicas", "ozone"),
  "cachemira": n("Cachemira", "cashmere"),
  "gamuza": n("Gamuza", "suede"),
  "notas atalcadas": n("Notas atalcadas", "powder"),
  "piña": n("Piña", "pineapple"),
  "grosella negra": n("Grosella negra", "blackcurrant"),
  "frutos rojos": n("Frutos rojos", "red-berries"),
  "bayas silvestres": n("Bayas silvestres", "wild-berries"),
  "cereza": n("Cereza", "cherry"),
  "ciruela": n("Ciruela", "plum"),
  "pera": n("Pera", "pear"),
  "higo": n("Higo", "fig"),
  "mango": n("Mango", "mango"),
  "pitahaya": n("Pitahaya", "dragonfruit"),
  "coco": n("Coco", "coconut"),
  "agua de coco": n("Agua de coco", "coconut"),
  "ruibarbo": n("Ruibarbo", "rhubarb"),
  "mirabel": n("Mirabel", "mirabelle"),
  "frutas confitadas": n("Frutas confitadas", "candied-fruit"),
  "dátiles": n("Dátiles", "dates"),
  "praliné": n("Praliné", "praline"),
  "cacao": n("Cacao", "cacao"),
  "tófe": n("Tófe", "toffee"),
  "toffee": n("Tófe", "toffee"),
  "coñac": n("Coñac", "cognac"),
  "tabaco": n("Tabaco", "tobacco"),
  "café": n("Café", "coffee"),
};

/** Icono por defecto para notas que aún no tienen uno propio (en vez de un emoji). */
export const GENERIC_NOTE_ICON = `${ICON_DIR}generic.png`;

// Reglas por palabra clave: cubren notas nuevas (p. ej. creadas desde el admin) con un icono afín.
const KEYWORD_ICONS = [
  [/madera|wood|cedro|amadera/, "wood-log"], [/lim[oó]n|lima/, "lemon"], [/naranja/, "orange"], [/mandarina/, "mandarin"],
  [/resina|benju|mirra|l[aá]dano|incienso/, "resin"], [/[aá]mbar/, "amber"], [/vainilla/, "vanilla"], [/rosa\b/, "rose"],
  [/flor|jazm|azahar/, "white-flowers"], [/musgo/, "moss"], [/menta/, "mint"], [/fruta|frut/, "red-berries"],
  [/pimienta/, "black-pepper"], [/almizcle|musk/, "musk"], [/coco/, "coconut"], [/caf[eé]/, "coffee"], [/cacao|chocolate/, "cacao"],
];

const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const NORM_INDEX = Object.fromEntries(Object.entries(NOTE_MAP).map(([k, v]) => [norm(k), v]));

/**
 * Normaliza y obtiene información de la nota en español (sin emojis: siempre devuelve un icono).
 */
export function getNoteInfo(rawName) {
  if (!rawName) return { name: "", es: "", icon: GENERIC_NOTE_ICON };
  const clean = String(rawName).trim();
  const key = norm(clean);
  let info = NORM_INDEX[key];
  if (!info) {
    const hit = KEYWORD_ICONS.find(([re]) => re.test(key));
    info = hit ? { icon: `${ICON_DIR}${hit[1]}.png` } : {};
  }
  return {
    raw: clean,
    name: info.es || clean,
    es: info.es || clean,
    icon: info.icon || GENERIC_NOTE_ICON,
  };
}
