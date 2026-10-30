import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Accordion from "../components/Accordion.jsx";
import Carousel from "../components/Carousel.jsx";
import FragranceNotes from "../components/FragranceNotes.jsx";
import { WhatsAppIcon } from "../components/Icons.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { NOTAS } from "../data/notes";
import ProductCard from "../components/ProductCard.jsx";
import AddToCartButton from "../cart/AddToCartButton.jsx";
import QuantityStepper from "../cart/QuantityStepper.jsx";
import { useCart } from "../cart/CartContext.jsx";
import NotFound from "./NotFound.jsx";
import { useSeo } from "../seo";
import { SITE_URL } from "../config";
import { SITE_NAME, productSeo } from "../seoData.js";
import { isValidPrice, formatCOP } from "../pricing.js";
import { defaultSizeKey, formatPrice, galleryOf, isSoldOut, perfumePath, perfumeSlug, sizeOptions, waUrl } from "../utils";

/** Otras fragancias: primero de la misma casa y luego del mismo género, sin agotados. */
function relatedOf(p, all) {
  const pool = all.filter((x) => x.id !== p.id && !isSoldOut(x) && x.imagen);
  const score = (x) => (x.marca === p.marca ? 2 : 0) + (x.categoria === p.categoria ? 1 : 0);
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, 4);
}

export default function PerfumeDetail() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { productos: PRODUCTOS } = useCatalog();
  // Formato elegido en esta ficha (ligado al slug para no arrastrarlo al navegar a otro perfume)
  const [pick, setPick] = useState({ slug: null, key: null });
  // Cantidad elegida (también ligada al slug: al ir a otro perfume vuelve a 1)
  const [qtyState, setQtyState] = useState({ slug: null, qty: 1 });
  const qty = qtyState.slug === slug ? qtyState.qty : 1;
  const setQty = (q) => setQtyState({ slug, qty: q });
  const { units } = useCart();
  const p = PRODUCTOS.find((x) => perfumeSlug(x) === slug || String(x.id) === slug);
  const found = Boolean(p);
  const seo = found ? productSeo(p, SITE_URL) : null;
  useSeo(found ? { ...seo, noindex: false } : {
    title: `Perfume no encontrado | ${SITE_NAME}`,
    description: "Este perfume no está en el catálogo.",
    path: `/perfume/${slug}`,
    noindex: true,
  });
  if (!p) return <NotFound />;
  // links viejos con el id (/perfume/3) se redirigen al nombre (/perfume/dunescape)
  if (slug !== perfumeSlug(p)) return <Navigate to={`/perfume/${perfumeSlug(p)}`} replace />;

  const notes = p.notas || NOTAS[p.id] || {};
  const opts = sizeOptions(p);
  const fromUrl = opts.find((o) => o.key === params.get("t"))?.key; // ?t=5 | 10 | full (viene de la tarjeta)
  const selKey = (pick.slug === slug && pick.key) || fromUrl || defaultSizeKey(p);
  const sel = opts.find((o) => o.key === selKey) || opts[0];
  const consult = sel.price == null;
  const soldOut = isSoldOut(p);
  const link = `${window.location.origin}${perfumePath(p)}`;
  const wa = waUrl(
    soldOut
      ? `Hola, vi que ${p.marca} ${p.nombre} figura como agotado. ¿Cuándo podrían tenerlo de nuevo?\n${link}`
      : `Hola, me interesa ${p.marca} ${p.nombre} (${sel.label}${sel.price != null ? ` · ${formatPrice(sel.price)}` : ""}). ¿Me das más información?\n${link}`
  );
  const ctaLabel = soldOut ? "Preguntar por disponibilidad" : "Consultar por WhatsApp";
  const related = relatedOf(p, PRODUCTOS);
  const purchasable = !soldOut && isValidPrice(sel.price);

  const generos = Array.isArray(p.generos) && p.generos.length ? p.generos.join(" · ") : p.categoria;

  return (
    <>
      <section className="detail">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Migas de pan">
            <Link to="/">Inicio</Link><span>/</span><Link to="/catalogo">Catálogo</Link><span>/</span><Link to={`/catalogo?marca=${encodeURIComponent(p.marca)}`}>{p.marca}</Link><span>/</span><span aria-current="page">{p.nombre}</span>
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
                {p.disponibilidad && <span className={soldOut ? "is-soldout" : undefined}>{p.disponibilidad}</span>}
              </div>

              <div className="detail__priceblock" aria-live="polite">
                <span className="detail__price-label">{sel.label}</span>
                <span className={`detail__price${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
              </div>
              <div className="size-pills size-pills--lg" role="group" aria-label="Elegir formato">
                {opts.map((o) => (
                  <button key={o.key} type="button" aria-pressed={o.key === sel.key}
                    className={`size-pill${o.price == null ? " is-consult" : ""}`} onClick={() => setPick({ slug, key: o.key })}>
                    <span className="size-pill__type">{o.type}</span>
                    <span className="size-pill__size">{o.size}</span>
                    <span className="size-pill__price">{formatPrice(o.price)}</span>
                  </button>
                ))}
              </div>

              {purchasable ? (
                <>
                  <div className="detail__buyrow">
                    <QuantityStepper value={qty} onChange={setQty} label={`Cantidad de ${p.marca} ${p.nombre}`} />
                    <AddToCartButton product={p} sizeKey={sel.key} qty={qty} onAdded={() => setQty(1)} className="detail__add" />
                  </div>
                  <p className="detail__subtotal" aria-live="polite">{qty} × {sel.label} = <strong>${formatCOP(sel.price * qty)} COP</strong></p>
                  <a className="btn-outline detail__consult" target="_blank" rel="noopener noreferrer" href={wa}>
                    <WhatsAppIcon /> {ctaLabel}
                  </a>
                </>
              ) : (
                <a className="product-card__buy detail__cta" target="_blank" rel="noopener noreferrer" href={wa}>
                  <WhatsAppIcon /> {ctaLabel}
                </a>
              )}
              {units > 0 && <Link to="/carrito" className="detail__viewcart">Ver mi pedido ({units} {units === 1 ? "unidad" : "unidades"})</Link>}

              {p.descripcion && <p className="detail__desc">{p.descripcion}</p>}

              <Accordion
                level={2}
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

      {related.length > 0 && (
        <section className="catalog-section related" aria-labelledby="related-title">
          <div className="container">
            <p className="section-label">Sigue explorando</p>
            <h2 className="section-title" id="related-title">Otras fragancias</h2>
            <div className="products-grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
          </div>
        </section>
      )}

      {/* Barra de compra fija (solo móvil): siempre a mano, con el formato elegido */}
      <div className="buybar">
        <div className="buybar__info">
          <span className="buybar__label">{sel.label}</span>
          <span className={`buybar__price${consult ? " is-consult" : ""}`}>{formatPrice(sel.price)}</span>
        </div>
        {purchasable ? (
          <AddToCartButton product={p} sizeKey={sel.key} qty={qty} onAdded={() => setQty(1)} className="cart-add--bar" />
        ) : (
          <a className="product-card__buy" target="_blank" rel="noopener noreferrer" href={wa}>
            <WhatsAppIcon /> {soldOut ? "Preguntar" : "Consultar"}
          </a>
        )}
      </div>
    </>
  );
}
