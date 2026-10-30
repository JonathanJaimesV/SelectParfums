-- ════════════════════════════════════════════════════════════════════════════════
-- Semilla del catálogo REAL de Select Parfums Colombia (19 perfumes × 3 presentaciones).
-- GENERADO por scripts/export-seed-sql.mjs desde src/data/products.js — no editar a mano.
-- Idempotente: «on conflict do nothing» → volver a ejecutarlo NO pisa precios ni cambios hechos desde el panel.
-- Presentaciones con precio null = "Consultar" (no se pueden pedir). Todas quedan habilitadas, como en la web actual.
-- ════════════════════════════════════════════════════════════════════════════════
insert into public.products
  (id, slug, brand, name, description, bottle_size, category, genders, notes, images, status, availability, featured, sort_order)
values
  (1, '9pm', 'Afnan', '9PM', 'Fragancia seductora y dulce con salida de manzana verde, lavanda y canela, sobre un fondo cálido de abundante vainilla, haba tonka y ámbar. Un perfume nocturno de gran proyección e impacto, ideal para destacar en salidas y eventos', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Bergamota","Lavanda silvestre","Canela","Manzana"],"corazon":["Lirio de los valles","Flor de Azahar"],"fondo":["Pachulí","Ámbar","Vainilla","Haba tonka"]}'::jsonb, '["/assets/images/AFNAN/9PM/afnan-9pm.jpg"]'::jsonb, 'published', 'Preventa', false, 0),
  (2, '9am', 'Afnan', '9AM', 'Fragancia marina y citrica ultra fresca. Destaca por sus notas vibrantes de limon, bergamota y menta, entrelazadas con lavanda y un fondo limpio de cedro y pimienta rosa. Versatil, energica e ideal para el dia a dia en climas calidos', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Mandarina","Limón","Cardamomo","Pimienta rosa"],"corazon":["Lavanda","Manzana verde","Flor de Azahar","Rosa"],"fondo":["Almizcle","Musgo","Cedro","Pachulí"]}'::jsonb, '["/assets/images/AFNAN/9AM/afnan-9am.jpg"]'::jsonb, 'published', 'Preventa', false, 1),
  (3, 'dunescape', 'Armaf', 'Dunescape', 'Fragancia azul, cítrica y aromática de gran frescura. Combina una chispeante apertura de cítricos y jengibre con matices ozónicos, sobre una base amaderada y limpia de excelente versatilidad diaria', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Naranja sanguina","Bergamota","Mandarina","Limón (lima ácida)","Jengibre","Salvia","Enebro"],"corazon":["Manzana","Notas ozónicas","Cachemira","Geranio","Rosa"],"fondo":["Almizcle","Sándalo","Ámbar"]}'::jsonb, '["/assets/images/ARMAF/Dunescape/armaf-dunescape.jpg"]'::jsonb, 'published', 'Preventa', false, 2),
  (4, 'club-de-nuit-intense-man-edt', 'Armaf', 'Club de Nuit Intense Man EDT', 'Icono masculino de enorme proyección. Destaca por una vibrante salida de limón y piña ahumada que evoluciona hacia un cuerpo de abedul con un fondo amaderado y sensual.', '105 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Limón","Piña","Bergamota","Grosella negra","Manzana"],"corazon":["Abedul","Rosa","Jazmín"],"fondo":["Almizcle","Ámbar gris","Pachulí","Vainilla"]}'::jsonb, '["/assets/images/ARMAF/ClubDeNuitIntenseMan/armaf-cdnim.jpg"]'::jsonb, 'published', 'Disponible', false, 3),
  (5, 'odyssey-aqua', 'Armaf', 'Odyssey Aqua', 'Fragancia acuática y citrica de intensa frescura. Su apertura cítrica y mentolada brinda un aroma limpio tipo "recién bañado" con un fondo moderno de ambroxán, ideal para el día a día y climas cálidos', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Toronja","Naranja","Abrótano"],"corazon":["Menta","Lavanda"],"fondo":["Ambroxan","Ciprés","Pachulí"]}'::jsonb, '["/assets/images/ARMAF/OdysseyAqua/armaf-odyssey-aqua.jpg"]'::jsonb, 'published', 'Preventa', false, 4),
  (6, 'club-de-nuit-untold-edp', 'Armaf', 'Club de Nuit Untold EDP', 'Fragancia ambarada, dulzona y sofisticada. Destaca por su estela envolvente y ligera de azúcar quemado y maderas nobles, célebre por su similitud con Baccarat Rouge 540.', '105 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Azafrán","Jazmín"],"corazon":["Madera de ámbar","Ámbar gris"],"fondo":["Resina de abeto","Madera de cedro"]}'::jsonb, '["/assets/images/ARMAF/ClubDeNuitUntold/armaf-cdnu.jpg"]'::jsonb, 'published', 'Preventa', false, 5),
  (7, 'liquid-brun', 'French Avenue', 'Liquid Brun', 'Fragancia gourmand, cálida y ultra seductora. Fusiona un dulzor especiado de canela con una rica vainilla Bourbon y praliné sobre maderas cremosas, famosa por su gran similitud con Parfums de Marly Althaïr.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Canela","Cardamomo","Flor de Azahar","Naranjo","Bergamota"],"corazon":["Vainilla Bourbon","Elemí"],"fondo":["Praliné","Ambroxan","Madera de gaiac","Almizcle"]}'::jsonb, '["/assets/images/FRENCH-AVENUE/fa-liquid-brun.jpg"]'::jsonb, 'published', 'Preventa', false, 6),
  (8, 'vulcan-feu', 'French Avenue', 'Vulcan Feu', 'Fragancia exótica, tropical y magnética que cautiva desde la primera atomización. Famosa por su similitud con God of Fire, ofrece un aroma vibrante donde la jugosidad del mango se fusiona con jengibre y especias sobre una base ambarada.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Mango","Jengibre","Limón","Ruibarbo"],"corazon":["Pimienta rosa","Jazmín","Praliné","Violeta"],"fondo":["Ámbar gris","Haba tonka","Madera de cedro","Musgo"]}'::jsonb, '["/assets/images/FRENCH-AVENUE/VULCAN-FEU/fa-VulcanFeu.jpg"]'::jsonb, 'published', 'Preventa', false, 7),
  (9, 'hawas-kobra', 'Rasasi', 'Hawas Kobra', 'Fragancia citrica, fresca y elegante. Destaca por una salida chispeante de jengibre y cítricos con un corazón limpio de té verde y neroli sobre un fondo amaderado, famosa por recordar al estilo de Louis Vuitton Imagination.', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Jengibre","Bergamota","Naranja Tangerina"],"corazon":["Té verde","Canela","Neroli"],"fondo":["Almizcle","Notas Amaderadas","Ámbar"]}'::jsonb, '["/assets/images/RASASI/KOBRA/rasasi-hawas-kobra.jpg"]'::jsonb, 'published', 'Preventa', false, 8),
  (10, 'hawas-ice', 'Rasasi', 'Hawas Ice', 'Fragancia acuática, frutal y helada de enorme proyección. Reinterpreta el ADN del Hawas original añadiéndole una salida de manzana congelada y cítricos sobre un corazón de ciruela y un fondo limpio de musgo y maderas.', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Manzana Helada","Limón Italiano","Bergamota de Sicilia","Anís estrellado"],"corazon":["Ciruela","Flor de Azahar","Cardamomo"],"fondo":["Almizcle","Ámbar","Driftwood","Musgo"]}'::jsonb, '["/assets/images/RASASI/ICE/rasasi-ice.jpg"]'::jsonb, 'published', 'Preventa', false, 9),
  (11, '9pm-out-night', 'Afnan', '9PM Out Night', 'Fragancia seductora y magnética, perfecta para la noche. Combina una salida dulce de manzana jugosa y canela especiada con un fondo envolvente de vainilla, haba tonka y ámbar. Un aroma nocturno de alta proyección diseñado para destacar.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Pitahaya","Coñac","Manzana","Bergamota","Lavanda"],"corazon":["Tófe","Gamuza","Cardamomo","Cedro"],"fondo":["Haba tonka","AmbroFix","Akigalawood","Pachulí"]}'::jsonb, '[]'::jsonb, 'published', 'Agotado', false, 10),
  (12, 'hawas-tropical', 'Rasasi', 'Hawas Tropical', 'Fragancia exótica, cremosa y veraniega. Combina acordes frescos de agua de coco y hojas de higuera con un toque mentolado y un fondo cálido de sándalo y tonka, famosa por recordar a Le Beau Paradise Garden.', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Agua de coco","Hojas de higuera","Jengibre"],"corazon":["Coco","Higo","Menta"],"fondo":["Sándalo","Haba tonka","Almizcle","Ámbar"]}'::jsonb, '["/assets/images/RASASI/TROPICAL/rasasi-tropical.jpg"]'::jsonb, 'published', 'Preventa', false, 11),
  (13, 'khamrah', 'Lattafa', 'Khamrah', 'Fragancia gourmand, cálida y opulenta. Combina un rico acorde dulce de dátiles y praliné especiado con canela sobre un fondo resinoso de vainilla y tonka, famosa por recordar al estilo de Angels'' Share.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Canela","Nuez moscada","Bergamota"],"corazon":["Dátiles","Praliné","Nardos","Mahonial"],"fondo":["Vainilla","Haba tonka","Benjuí","Madera de ámbar","Mirra","Akigalawood"]}'::jsonb, '["/assets/images/LATTAFA/KHAMRAH/lattafa-khamrah.jpg"]'::jsonb, 'published', 'Preventa', false, 12),
  (14, 'asad', 'Lattafa', 'Asad', 'Fragancia oriental, cálida y especiada de gran carácter. Combina pimienta negra y tabaco con toques de café sobre un fondo profundo de vainilla y ámbar, famosa por su estilo similar a Sauvage Elixir.', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Pimienta negra","Tabaco","Piña"],"corazon":["Pachulí","Café","Iris"],"fondo":["Vainilla","Ámbar","Madera seca","Benjuí","Ládano"]}'::jsonb, '["/assets/images/LATTAFA/ASAD/lattafa-asad.jpg"]'::jsonb, 'published', 'Preventa', false, 13),
  (15, 'bourbon', 'Lattafa', 'Bourbon', 'Fragancia cálida, gourmet y especiada. Reinterpreta la línea Asad añadiendo una salida ahumada y frutal con un corazón de cacao especiado y un fondo cremoso de vainilla Bourbon y ámbar, conocida por su estilo similar a Azzaro The Most Wanted.', '100 ml', 'Hombre', array['Hombre']::text[], '{"salida":["Lavanda","Ciruela","Mirabel","Pimienta rosa"],"corazon":["Cacao","Nuez moscada","Davana"],"fondo":["Vainilla Bourbon","Ámbar","Vetiver"]}'::jsonb, '["/assets/images/LATTAFA/BOURBON/lattafa-bourbon.jpg"]'::jsonb, 'published', 'Preventa', false, 14),
  (16, 'art-of-universe', 'Lattafa', 'Art Of Universe', 'Fragancia cítrica, frutal y moderna de vibra futurista. Destaca por una chispeante apertura de bergamota y menta con un corazón de pera jugosa y un fondo almizclado, inspirada en Blue Talisman de Ex Nihilo.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Mandarina","Bergamota","Jengibre","Menta"],"corazon":["Pera","Flor de Azahar (Naranjo)"],"fondo":["Almizcle","Ámbar","Cedro"]}'::jsonb, '["/assets/images/LATTAFA/ART-OF-UNIVERSE/lattafa-aou.jpg"]'::jsonb, 'published', 'Preventa', false, 15),
  (17, 'qahwa', 'Lattafa', 'Qahwa', 'Fragancia gourmand, cálida y envolvente. Evoluciona el ADN dulce de Khamrah agregando una nota distintiva de café arábica especiado con cardamomo sobre un fondo cremoso de praliné, vainilla y tonka.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Canela","Cardamomo","Jengibre"],"corazon":["Praliné","Frutas confitadas","Flores blancas"],"fondo":["Café","Vainilla","Haba tonka","Benjuí","Almizcle"]}'::jsonb, '["/assets/images/LATTAFA/QAHWA/lattafa-qahwa.jpg"]'::jsonb, 'published', 'Preventa', false, 16),
  (18, 'nebras-elixir', 'Lattafa', 'Nebras Elixir', 'Fragancia gourmand, rica y profundamente seductora. Combina un acorde adictivo de frutos rojos y cacao con un corazón floral cálido sobre una base cremosa de vainilla y ámbar, destacando por su gran dulzura y estela envolvente.', '100 ml', 'Unisex', array['Hombre', 'Mujer', 'Unisex']::text[], '{"salida":["Frutos rojos","Mandarina"],"corazon":["Cacao","Rosa","Flores blancas"],"fondo":["Vainilla","Ámbar","Almizcle","Haba tonka"]}'::jsonb, '["/assets/images/LATTAFA/NEBRAS-ELIXIR/lattafa-NElixir.jpg"]'::jsonb, 'published', 'Preventa', false, 17),
  (19, 'yum-yum', 'Armaf', 'Yum Yum', 'Fragancia femenina, divertida y muy golosa. Destaca por una salida jugosa de cereza y frutos rojos que se transforma en un corazón cremoso de vainilla y flores, evocado con el estilo dulce de un batido de frutas.', '100 ml', 'Mujer', array['Mujer']::text[], '{"salida":["Cereza","Bayas silvestres","Naranja","Bergamota"],"corazon":["Vainilla","Flores blancas","Rosa"],"fondo":["Notas atalcadas","Ámbar","Almizcle","AmbroFix"]}'::jsonb, '["/assets/images/ARMAF/YUM-YUM/armaf-yumyum.jpg"]'::jsonb, 'published', 'Preventa', false, 18)
on conflict (id) do nothing;

insert into public.product_presentations (product_id, kind, enabled, price_cop)
values
  (1, '5', true, 20000),
  (1, '10', true, 27000),
  (1, 'full', true, 200000),
  (2, '5', true, null),
  (2, '10', true, null),
  (2, 'full', true, 220000),
  (3, '5', true, 23000),
  (3, '10', true, 33000),
  (3, 'full', true, 280000),
  (4, '5', true, 20000),
  (4, '10', true, 33000),
  (4, 'full', true, 230000),
  (5, '5', true, 23000),
  (5, '10', true, 33000),
  (5, 'full', true, 280000),
  (6, '5', true, 22000),
  (6, '10', true, 35000),
  (6, 'full', true, 250000),
  (7, '5', true, 20000),
  (7, '10', true, 30000),
  (7, 'full', true, 225000),
  (8, '5', true, 22000),
  (8, '10', true, 35000),
  (8, 'full', true, 250000),
  (9, '5', true, 22000),
  (9, '10', true, 35000),
  (9, 'full', true, 240000),
  (10, '5', true, 22000),
  (10, '10', true, 35000),
  (10, 'full', true, 260000),
  (11, '5', true, null),
  (11, '10', true, null),
  (11, 'full', true, null),
  (12, '5', true, null),
  (12, '10', true, null),
  (12, 'full', true, 250000),
  (13, '5', true, null),
  (13, '10', true, null),
  (13, 'full', true, 190000),
  (14, '5', true, null),
  (14, '10', true, null),
  (14, 'full', true, 185000),
  (15, '5', true, null),
  (15, '10', true, null),
  (15, 'full', true, 200000),
  (16, '5', true, null),
  (16, '10', true, null),
  (16, 'full', true, 265000),
  (17, '5', true, null),
  (17, '10', true, null),
  (17, 'full', true, 200000),
  (18, '5', true, null),
  (18, '10', true, null),
  (18, 'full', true, 240000),
  (19, '5', true, null),
  (19, '10', true, null),
  (19, 'full', true, 250000)
on conflict (product_id, kind) do nothing;

-- La secuencia de ids continúa después del mayor id existente (los perfumes nuevos no chocan con los actuales).
select setval(pg_get_serial_sequence('public.products', 'id'), (select max(id) from public.products));
