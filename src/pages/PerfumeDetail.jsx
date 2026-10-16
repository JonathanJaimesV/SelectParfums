import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Accordion from "../components/Accordion.jsx";
import Carousel from "../components/Carousel.jsx";
import FragranceNotes from "../components/FragranceNotes.jsx";
import { WhatsAppIcon } from "../components/Icons.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { NOTAS } from "../data/notes";
import { defaultSizeKey, formatPrice, galleryOf, perfumeSlug, sizeOptions, useTitle, waUrl } from "../utils";

export default function PerfumeDetail() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { productos: PRODUCTOS } = useCatalog();
  // Formato elegido en esta ficha (ligado al slug para no arrastrarlo al navegar a otro perfume)
  const [pick, setPick] = useState({ slug: null, key: null });
  const p = PRODUCTOS.find((x) => perfumeSlug(x) === slug || String(x.id) === slug);
  useTitle(p ? `${p.marca} ${p.nombre} | SelectParfums` : "SelectParfums");
  if (!p) return <Navigate to="/catalogo" replace />;
  // links viejos con el id (/perfume/3) se redirigen al nombre (/perfume/dunescape)
  if (slug !== perfumeSlug(p)) return <Navigate to={`/perfume/${perfumeSlug(p)}`} replace />;

  const notes = p.notas || NOTAS[p.id] || {};
  const opts = sizeOptions(p);
  const fromUrl = opts.find((o) => o.key === params.get("t"))?.key; // ?t=5 | 10 | full (viene de la tarjeta)
  const selKey = (pick.slug === slug && pick.key) || fromUrl || defaultSizeKey(p);
  const sel = opts.find((o) => o.key === selKey) || opts[0];
  const consult = sel.price == null;
  const wa = waUrl(`Hola, me interesa ${p.marca} ${p.nombre} (${sel.label}). ¿Me das más información?`);

  const generos = Array.isArray(p.generos) && p.generos.length ? p.generos.join(" · ") : p.categoria;

  return (
    <>
      <section className="detail">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Migas de pan">
            <Link to="/">Inicio</Link><span>/</span><Link to="/catalogo">Catálogo</Link><span>/</span><span>{p.nombre}</span>
          </nav>
          <div className="detail__grid">
            <div className="detail__gallery">
              <Carousel key={p.id} images={galleryOf(p)} alt={`${p.marca} ${p.nombre}`} />
            </div>
            <div className="detail__info">
              <p className="product-card__brand">{p.marca}</p>
              <h1 className="detail__name">{p.nombre}</h1>
              <div className="detail__tags">
                <span>{p.categoria}</span>
                {p.disponibilidad && <span>{p.disponibilidad}</span>}
              </div>

              <div className="detail__priceblock" aria-live="polite">
                <span className="detail__price-label">{sel.label}</span>
                <span className={`detail__price${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
              </div>
              <div className="size-pills size-pills--lg" role="radiogroup" aria-label="Elegir formato">
                {opts.map((o) => (
                  <button key={o.key} type="button" role="radio" aria-checked={o.key === sel.key}
                    className={`size-pill${o.price == null ? " is-consult" : ""}`} onClick={() => setPick({ slug, key: o.key })}>
                    <span className="size-pill__type">{o.type}</span>
                    <span className="size-pill__size">{o.size}</span>
                    <span className="size-pill__price">{formatPrice(o.price)}</span>
                  </button>
                ))}
              </div>

              <a className="product-card__buy detail__cta" target="_blank" rel="noopener noreferrer" href={wa}>
                <WhatsAppIcon /> Consultar por WhatsApp
              </a>

              <p className="detail__desc">{p.descripcion}</p>

              <Accordion
                defaultOpen={[]}
                items={[
                  {
                    id: "detalles",
                    title: "Detalles",
                    content: (
                      <dl className="acc-dl">
                        <dt>Género</dt><dd>{generos}</dd>
                        <dt>Frasco</dt><dd>{p.tamanoFrasco}</dd>
                        {p.disponibilidad && (<><dt>Estado</dt><dd>{p.disponibilidad}</dd></>)}
                      </dl>
                    ),
                  },
                ]}
              />
              <Link to="/catalogo" className="detail__back">&larr; Volver al catálogo</Link>
            </div>
          </div>
        </div>
      </section>

      <FragranceNotes notes={notes} perfumeName={`${p.marca} ${p.nombre}`} />

      {/* Barra de compra fija (solo móvil): siempre a mano, con el formato elegido */}
      <div className="buybar">
        <div className="buybar__info">
          <span className="buybar__label">{sel.label}</span>
          <span className={`buybar__price${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
        </div>
        <a className="product-card__buy" target="_blank" rel="noopener noreferrer" href={wa}>
          <WhatsAppIcon /> Consultar
        </a>
      </div>
    </>
  );
}
