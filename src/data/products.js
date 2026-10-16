/**
 * products.js — Catálogo de fragancias (exportado desde el panel /admin)
 * ──────────────────────────────────────────────────────────────────────
 * Las notas olfativas van dentro de cada producto (campo `notas`).
 * Usa `null` en cualquier precio para que se muestre como "Consultar".
 */

export const MARCAS = [
  {
    "id": "afnan",
    "nombre": "Afnan",
    "descripcion": "Combina la tradición de la perfumería oriental con un toque occidental moderno y refinado; frascos de diseño impecable y rendimiento duradero a precios accesibles.",
    "fragancias": 0
  },
  {
    "id": "armaf",
    "nombre": "Armaf",
    "descripcion": "Una de las marcas más vendidas del Medio Oriente, reconocida por excelentes interpretaciones de perfumes de nicho y de lujo, con proyección y duración excepcionales.",
    "fragancias": 0
  },
  {
    "id": "french-avenue",
    "nombre": "French Avenue",
    "descripcion": "Línea de lujo de Fragrance World que emula la alta perfumería francesa, con ingredientes de mayor calidad y presentación lujosa.",
    "fragancias": 0
  },
  {
    "id": "rasasi",
    "nombre": "Rasasi",
    "descripcion": "Casa emiratí fundada en 1979 que equilibra la perfumería árabe clásica (oud, especias, ámbar) con líneas modernas de estilo occidental.",
    "fragancias": 0
  },
  {
    "id": "lattafa",
    "nombre": "Lattafa",
    "descripcion": "Casa de perfumería de los Emiratos Árabes Unidos referente a nivel global, famosa por sus composiciones opulentas y gourmands de gran rendimiento, combinando notas orientales de lujo con las tendencias occidentales más populares.",
    "fragancias": 0
  }
];

export const PRODUCTOS = [
  {
    "id": 1,
    "slug": "9pm",
    "marca": "Afnan",
    "nombre": "9PM",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia seductora y dulce con salida de manzana verde, lavanda y canela, sobre un fondo cálido de abundante vainilla, haba tonka y ámbar. Un perfume nocturno de gran proyección e impacto, ideal para destacar en salidas y eventos",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 200000,
    "precioDecant5": 20000,
    "precioDecant10": 27000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Bergamota",
        "Lavanda silvestre",
        "Canela",
        "Manzana"
      ],
      "corazon": [
        "Lirio de los valles",
        "Flor de Azahar"
      ],
      "fondo": [
        "Pachulí",
        "Ámbar",
        "Vainilla",
        "Haba tonka"
      ]
    },
    "imagenes": [
      "/assets/images/AFNAN/9PM/afnan-9pm.jpg",
      "/assets/images/AFNAN/9PM/afnan-9pm-2.jpg",
      "/assets/images/AFNAN/9PM/afnan-9pm-3.jpg"
    ],
    "imagen": "/assets/images/AFNAN/9PM/afnan-9pm.jpg"
  },
  {
    "id": 2,
    "slug": "9am",
    "marca": "Afnan",
    "nombre": "9AM",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia marina y citrica ultra fresca. Destaca por sus notas vibrantes de limon, bergamota y menta, entrelazadas con lavanda y un fondo limpio de cedro y pimienta rosa. Versatil, energica e ideal para el dia a dia en climas calidos",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 220000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Mandarina",
        "Limón",
        "Cardamomo",
        "Pimienta rosa"
      ],
      "corazon": [
        "Lavanda",
        "Manzana verde",
        "Flor de Azahar",
        "Rosa"
      ],
      "fondo": [
        "Almizcle",
        "Musgo",
        "Cedro",
        "Pachulí"
      ]
    },
    "imagenes": [
      "/assets/images/AFNAN/9AM/afnan-9am.jpg",
      "/assets/images/AFNAN/9AM/afnan-9am-2.jpg",
      "/assets/images/AFNAN/9AM/afnan-9am-3.jpg"
    ],
    "imagen": "/assets/images/AFNAN/9AM/afnan-9am.jpg"
  },
  {
    "id": 3,
    "slug": "dunescape",
    "marca": "Armaf",
    "nombre": "Dunescape",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia azul, cítrica y aromática de gran frescura. Combina una chispeante apertura de cítricos y jengibre con matices ozónicos, sobre una base amaderada y limpia de excelente versatilidad diaria",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 280000,
    "precioDecant5": 23000,
    "precioDecant10": 33000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Naranja sanguina",
        "Bergamota",
        "Mandarina",
        "Limón (lima ácida)",
        "Jengibre",
        "Salvia",
        "Enebro"
      ],
      "corazon": [
        "Manzana",
        "Notas ozónicas",
        "Cachemira",
        "Geranio",
        "Rosa"
      ],
      "fondo": [
        "Almizcle",
        "Sándalo",
        "Ámbar"
      ]
    },
    "imagenes": [
      "/assets/images/ARMAF/Dunescape/armaf-dunescape.jpg",
      "/assets/images/ARMAF/Dunescape/armaf-dunescape-2.jpg",
      "/assets/images/ARMAF/Dunescape/armaf-dunescape-3.jpg"
    ],
    "imagen": "/assets/images/ARMAF/Dunescape/armaf-dunescape.jpg"
  },
  {
    "id": 4,
    "slug": "club-de-nuit-intense-man-edt",
    "marca": "Armaf",
    "nombre": "Club de Nuit Intense Man EDT",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Icono masculino de enorme proyección. Destaca por una vibrante salida de limón y piña ahumada que evoluciona hacia un cuerpo de abedul con un fondo amaderado y sensual.",
    "tamanoFrasco": "105 ml",
    "precioFrasco": 230000,
    "precioDecant5": 20000,
    "precioDecant10": 33000,
    "disponibilidad": "Disponible",
    "notas": {
      "salida": [
        "Limón",
        "Piña",
        "Bergamota",
        "Grosella negra",
        "Manzana"
      ],
      "corazon": [
        "Abedul",
        "Rosa",
        "Jazmín"
      ],
      "fondo": [
        "Almizcle",
        "Ámbar gris",
        "Pachulí",
        "Vainilla"
      ]
    },
    "imagenes": [
      "/assets/images/ARMAF/ClubDeNuitIntenseMan/armaf-cdnim.jpg",
      "/assets/images/ARMAF/ClubDeNuitIntenseMan/armaf-cdnim-2.jpg",
      "/assets/images/ARMAF/ClubDeNuitIntenseMan/armaf-cdnim-3.jpg"
    ],
    "imagen": "/assets/images/ARMAF/ClubDeNuitIntenseMan/armaf-cdnim.jpg"
  },
  {
    "id": 5,
    "slug": "odyssey-aqua",
    "marca": "Armaf",
    "nombre": "Odyssey Aqua",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia acuática y citrica de intensa frescura. Su apertura cítrica y mentolada brinda un aroma limpio tipo \"recién bañado\" con un fondo moderno de ambroxán, ideal para el día a día y climas cálidos",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 280000,
    "precioDecant5": 23000,
    "precioDecant10": 33000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Toronja",
        "Naranja",
        "Abrótano"
      ],
      "corazon": [
        "Menta",
        "Lavanda"
      ],
      "fondo": [
        "Ambroxan",
        "Ciprés",
        "Pachulí"
      ]
    },
    "imagenes": [
      "/assets/images/ARMAF/OdysseyAqua/armaf-odyssey-aqua.jpg",
      "/assets/images/ARMAF/OdysseyAqua/armaf-odyssey-aqua-2.jpg",
      "/assets/images/ARMAF/OdysseyAqua/armaf-odyssey-aqua-3.jpg"
    ],
    "imagen": "/assets/images/ARMAF/OdysseyAqua/armaf-odyssey-aqua.jpg"
  },
  {
    "id": 6,
    "slug": "club-de-nuit-untold-edp",
    "marca": "Armaf",
    "nombre": "Club de Nuit Untold EDP",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia ambarada, dulzona y sofisticada. Destaca por su estela envolvente y ligera de azúcar quemado y maderas nobles, célebre por su similitud con Baccarat Rouge 540.",
    "tamanoFrasco": "105 ml",
    "precioFrasco": 250000,
    "precioDecant5": 22000,
    "precioDecant10": 35000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Azafrán",
        "Jazmín"
      ],
      "corazon": [
        "Madera de ámbar",
        "Ámbar gris"
      ],
      "fondo": [
        "Resina de abeto",
        "Madera de cedro"
      ]
    },
    "imagenes": [
      "/assets/images/ARMAF/ClubDeNuitUntold/armaf-cdnu.jpg",
      "/assets/images/ARMAF/ClubDeNuitUntold/armaf-cdnu-2.jpg",
      "/assets/images/ARMAF/ClubDeNuitUntold/armaf-cdnu-3.jpg"
    ],
    "imagen": "/assets/images/ARMAF/ClubDeNuitUntold/armaf-cdnu.jpg"
  },
  {
    "id": 7,
    "slug": "liquid-brun",
    "marca": "French Avenue",
    "nombre": "Liquid Brun",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia gourmand, cálida y ultra seductora. Fusiona un dulzor especiado de canela con una rica vainilla Bourbon y praliné sobre maderas cremosas, famosa por su gran similitud con Parfums de Marly Althaïr.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 225000,
    "precioDecant5": 20000,
    "precioDecant10": 30000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Canela",
        "Cardamomo",
        "Flor de Azahar",
        "Naranjo",
        "Bergamota"
      ],
      "corazon": [
        "Vainilla Bourbon",
        "Elemí"
      ],
      "fondo": [
        "Praliné",
        "Ambroxan",
        "Madera de gaiac",
        "Almizcle"
      ]
    },
    "imagenes": [
      "/assets/images/FRENCH-AVENUE/fa-liquid-brun.jpg",
      "/assets/images/FRENCH-AVENUE/fa-liquid-brun-2.jpg",
      "/assets/images/FRENCH-AVENUE/fa-liquid-brun-3.jpg"
    ],
    "imagen": "/assets/images/FRENCH-AVENUE/fa-liquid-brun.jpg"
  },
  {
    "id": 8,
    "slug": "vulcan-feu",
    "marca": "French Avenue",
    "nombre": "Vulcan Feu",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia exótica, tropical y magnética que cautiva desde la primera atomización. Famosa por su similitud con God of Fire, ofrece un aroma vibrante donde la jugosidad del mango se fusiona con jengibre y especias sobre una base ambarada.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 250000,
    "precioDecant5": 22000,
    "precioDecant10": 35000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Mango",
        "Jengibre",
        "Limón",
        "Ruibarbo"
      ],
      "corazon": [
        "Pimienta rosa",
        "Jazmín",
        "Praliné",
        "Violeta"
      ],
      "fondo": [
        "Ámbar gris",
        "Haba tonka",
        "Madera de cedro",
        "Musgo"
      ]
    },
    "imagenes": [
      "/assets/images/FRENCH-AVENUE/fa-vulcan-feu.jpg",
      "/assets/images/FRENCH-AVENUE/fa-vulcan-feu-2.jpg",
      "/assets/images/FRENCH-AVENUE/fa-vulcan-feu-3.jpg"
    ],
    "imagen": "/assets/images/FRENCH-AVENUE/fa-vulcan-feu.jpg"
  },
  {
    "id": 9,
    "slug": "hawas-kobra",
    "marca": "Rasasi",
    "nombre": "Hawas Kobra",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia citrica, fresca y elegante. Destaca por una salida chispeante de jengibre y cítricos con un corazón limpio de té verde y neroli sobre un fondo amaderado, famosa por recordar al estilo de Louis Vuitton Imagination.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 240000,
    "precioDecant5": 22000,
    "precioDecant10": 35000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Jengibre",
        "Bergamota",
        "Naranja Tangerina"
      ],
      "corazon": [
        "Té verde",
        "Canela",
        "Neroli"
      ],
      "fondo": [
        "Almizcle",
        "Notas Amaderadas",
        "Ámbar"
      ]
    },
    "imagenes": [
      "/assets/images/RASASI/KOBRA/rasasi-hawas-kobra.jpg",
      "/assets/images/RASASI/rasasi-hawas-kobra-2.jpg",
      "/assets/images/RASASI/rasasi-hawas-kobra-3.jpg"
    ],
    "imagen": "/assets/images/RASASI/KOBRA/rasasi-hawas-kobra.jpg"
  },
  {
    "id": 10,
    "slug": "hawas-ice",
    "marca": "Rasasi",
    "nombre": "Hawas Ice",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia acuática, frutal y helada de enorme proyección. Reinterpreta el ADN del Hawas original añadiéndole una salida de manzana congelada y cítricos sobre un corazón de ciruela y un fondo limpio de musgo y maderas.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 260000,
    "precioDecant5": 22000,
    "precioDecant10": 35000,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Manzana Helada",
        "Limón Italiano",
        "Bergamota de Sicilia",
        "Anís estrellado"
      ],
      "corazon": [
        "Ciruela",
        "Flor de Azahar",
        "Cardamomo"
      ],
      "fondo": [
        "Almizcle",
        "Ámbar",
        "Driftwood",
        "Musgo"
      ]
    },
    "imagenes": [
      "/assets/images/RASASI/ICE/rasasi-ice.jpg",
      "/assets/images/RASASI/rasasi-hawas-ice-2.jpg",
      "/assets/images/RASASI/rasasi-hawas-ice-3.jpg"
    ],
    "imagen": "/assets/images/RASASI/ICE/rasasi-ice.jpg"
  },
  {
    "id": 11,
    "slug": "9pm-out-night",
    "marca": "Afnan",
    "nombre": "9PM Out Night",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia seductora y magnética, perfecta para la noche. Combina una salida dulce de manzana jugosa y canela especiada con un fondo envolvente de vainilla, haba tonka y ámbar. Un aroma nocturno de alta proyección diseñado para destacar.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": null,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Agotado",
    "notas": {
      "salida": [
        "Pitahaya",
        "Coñac",
        "Manzana",
        "Bergamota",
        "Lavanda"
      ],
      "corazon": [
        "Tófe",
        "Gamuza",
        "Cardamomo",
        "Cedro"
      ],
      "fondo": [
        "Haba tonka",
        "AmbroFix",
        "Akigalawood",
        "Pachulí"
      ]
    },
    "imagenes": [
      null,
      null,
      null
    ],
    "imagen": ""
  },
  {
    "id": 12,
    "slug": "hawas-tropical",
    "marca": "Rasasi",
    "nombre": "Hawas Tropical",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia exótica, cremosa y veraniega. Combina acordes frescos de agua de coco y hojas de higuera con un toque mentolado y un fondo cálido de sándalo y tonka, famosa por recordar a Le Beau Paradise Garden.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 250000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Agua de coco",
        "Hojas de higuera",
        "Jengibre"
      ],
      "corazon": [
        "Coco",
        "Higo",
        "Menta"
      ],
      "fondo": [
        "Sándalo",
        "Haba tonka",
        "Almizcle",
        "Ámbar"
      ]
    },
    "imagenes": [
      "/assets/images/RASASI/TROPICAL/rasasi-tropical.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/RASASI/TROPICAL/rasasi-tropical.jpg"
  },
  {
    "id": 13,
    "slug": "khamrah",
    "marca": "Lattafa",
    "nombre": "Khamrah",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia gourmand, cálida y opulenta. Combina un rico acorde dulce de dátiles y praliné especiado con canela sobre un fondo resinoso de vainilla y tonka, famosa por recordar al estilo de Angels' Share.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 190000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Canela",
        "Nuez moscada",
        "Bergamota"
      ],
      "corazon": [
        "Dátiles",
        "Praliné",
        "Nardos",
        "Mahonial"
      ],
      "fondo": [
        "Vainilla",
        "Haba tonka",
        "Benjuí",
        "Madera de ámbar",
        "Mirra",
        "Akigalawood"
      ]
    },
    "imagenes": [
      "/assets/images/LATTAFA/KHAMRAH/lattafa-khamrah.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/LATTAFA/KHAMRAH/lattafa-khamrah.jpg"
  },
  {
    "id": 14,
    "slug": "asad",
    "marca": "Lattafa",
    "nombre": "Asad",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia oriental, cálida y especiada de gran carácter. Combina pimienta negra y tabaco con toques de café sobre un fondo profundo de vainilla y ámbar, famosa por su estilo similar a Sauvage Elixir.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 185000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Pimienta negra",
        "Tabaco",
        "Piña"
      ],
      "corazon": [
        "Pachulí",
        "Café",
        "Iris"
      ],
      "fondo": [
        "Vainilla",
        "Ámbar",
        "Madera seca",
        "Benjuí",
        "Ládano"
      ]
    },
    "imagenes": [
      "/assets/images/LATTAFA/ASAD/lattafa-asad.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/LATTAFA/ASAD/lattafa-asad.jpg"
  },
  {
    "id": 15,
    "slug": "bourbon",
    "marca": "Lattafa",
    "nombre": "Bourbon",
    "categoria": "Hombre",
    "generos": [
      "Hombre"
    ],
    "descripcion": "Fragancia cálida, gourmet y especiada. Reinterpreta la línea Asad añadiendo una salida ahumada y frutal con un corazón de cacao especiado y un fondo cremoso de vainilla Bourbon y ámbar, conocida por su estilo similar a Azzaro The Most Wanted.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 200000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Lavanda",
        "Ciruela",
        "Mirabel",
        "Pimienta rosa"
      ],
      "corazon": [
        "Cacao",
        "Nuez moscada",
        "Davana"
      ],
      "fondo": [
        "Vainilla Bourbon",
        "Ámbar",
        "Vetiver"
      ]
    },
    "imagenes": [
      "/assets/images/LATTAFA/BOURBON/lattafa-bourbon.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/LATTAFA/BOURBON/lattafa-bourbon.jpg"
  },
  {
    "id": 16,
    "slug": "art-of-universe",
    "marca": "Lattafa",
    "nombre": "Art Of Universe",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia cítrica, frutal y moderna de vibra futurista. Destaca por una chispeante apertura de bergamota y menta con un corazón de pera jugosa y un fondo almizclado, inspirada en Blue Talisman de Ex Nihilo.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 265000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Mandarina",
        "Bergamota",
        "Jengibre",
        "Menta"
      ],
      "corazon": [
        "Pera",
        "Flor de Azahar (Naranjo)"
      ],
      "fondo": [
        "Almizcle",
        "Ámbar",
        "Cedro"
      ]
    },
    "imagenes": [
      "/assets/images/LATTAFA/ART-OF-UNIVERSE/lattafa-aou.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/LATTAFA/ART-OF-UNIVERSE/lattafa-aou.jpg"
  },
  {
    "id": 17,
    "slug": "qahwa",
    "marca": "Lattafa",
    "nombre": "Qahwa",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia gourmand, cálida y envolvente. Evoluciona el ADN dulce de Khamrah agregando una nota distintiva de café arábica especiado con cardamomo sobre un fondo cremoso de praliné, vainilla y tonka.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 200000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Canela",
        "Cardamomo",
        "Jengibre"
      ],
      "corazon": [
        "Praliné",
        "Frutas confitadas",
        "Flores blancas"
      ],
      "fondo": [
        "Café",
        "Vainilla",
        "Haba tonka",
        "Benjuí",
        "Almizcle"
      ]
    },
    "imagenes": [
      "/assets/images/LATTAFA/QAHWA/lattafa-qahwa.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/LATTAFA/QAHWA/lattafa-qahwa.jpg"
  },
  {
    "id": 18,
    "slug": "nebras-elixir",
    "marca": "Lattafa",
    "nombre": "Nebras Elixir",
    "categoria": "Unisex",
    "generos": [
      "Hombre",
      "Mujer",
      "Unisex"
    ],
    "descripcion": "Fragancia gourmand, rica y profundamente seductora. Combina un acorde adictivo de frutos rojos y cacao con un corazón floral cálido sobre una base cremosa de vainilla y ámbar, destacando por su gran dulzura y estela envolvente.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 240000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Frutos rojos",
        "Mandarina"
      ],
      "corazon": [
        "Cacao",
        "Rosa",
        "Flores blancas"
      ],
      "fondo": [
        "Vainilla",
        "Ámbar",
        "Almizcle",
        "Haba tonka"
      ]
    },
    "imagenes": [
      "/assets/images/LATTAFA/NEBRAS-ELIXIR/lattafa-NElixir.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/LATTAFA/NEBRAS-ELIXIR/lattafa-NElixir.jpg"
  },
  {
    "id": 19,
    "slug": "yum-yum",
    "marca": "Armaf",
    "nombre": "Yum Yum",
    "categoria": "Mujer",
    "generos": [
      "Mujer"
    ],
    "descripcion": "Fragancia femenina, divertida y muy golosa. Destaca por una salida jugosa de cereza y frutos rojos que se transforma en un corazón cremoso de vainilla y flores, evocado con el estilo dulce de un batido de frutas.",
    "tamanoFrasco": "100 ml",
    "precioFrasco": 250000,
    "precioDecant5": null,
    "precioDecant10": null,
    "disponibilidad": "Preventa",
    "notas": {
      "salida": [
        "Cereza",
        "Bayas silvestres",
        "Naranja",
        "Bergamota"
      ],
      "corazon": [
        "Vainilla",
        "Flores blancas",
        "Rosa"
      ],
      "fondo": [
        "Notas atalcadas",
        "Ámbar",
        "Almizcle",
        "AmbroFix"
      ]
    },
    "imagenes": [
      "/assets/images/ARMAF/YUM-YUM/armaf-yumyum.jpg",
      null,
      null
    ],
    "imagen": "/assets/images/ARMAF/YUM-YUM/armaf-yumyum.jpg"
  }
];

// Calcular cantidad de fragancias por marca
MARCAS.forEach((m) => {
  m.fragancias = PRODUCTOS.filter(
    (p) => p.marca.toLowerCase() === m.nombre.toLowerCase()
  ).length;
});
