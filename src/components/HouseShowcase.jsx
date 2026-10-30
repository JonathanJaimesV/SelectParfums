import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import { IMAGE_MANIFEST } from "../data/imageManifest";
import { slugify } from "../utils";

// Logo de la casa: public/assets/images/brands/<nombre-en-minúsculas-con-guiones>.png.
// Convención: logo NEGRO sobre fondo blanco o transparente; el CSS lo invierte a blanco sobre la tarjeta negra.
// Si el archivo no existe, la tarjeta muestra el nombre de la casa en tipografía serif (nunca una imagen rota).
export const logoOf = (nombre) => {
  const slug = slugify(nombre);
  const fileName = slug === "french-avenue" ? "frenchavenue" : slug;
  const src = `/assets/images/brands/${fileName}.png`;
  return IMAGE_MANIFEST.has(src) ? src : null;
};

/**
 * Casas. variant="row": portada (fila escalonada en escritorio, carrusel táctil en móvil).
 * variant="grid": página /marcas (cuadrícula con descripción).
 */
export default function HouseShowcase({ marcas, variant = "row" }) {
  return (
    <ul className={`houses houses--${variant}`}>
      {marcas.map((m, i) => {
        const logo = logoOf(m.nombre);
        const total = `${m.fragancias} fragancia${m.fragancias !== 1 ? "s" : ""}`;
        return (
          <li key={m.id} className="house">
            <Reveal as={Link} to={`/catalogo?marca=${encodeURIComponent(m.nombre)}`} className="house__link" aria-label={`Ver ${total} de ${m.nombre}`}>
              <span className="house__media">
                {logo
                  ? <img className="house__logo" src={logo} alt="" width="526" height="526" loading="lazy" decoding="async" />
                  : <span className="house__wordmark" aria-hidden="true">{m.nombre}</span>}
                <span className="house__index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="house__info">
                  {/* El logo ya muestra el nombre; se conserva para lectores de pantalla */}
                  <h3 className="house__name sr-only">{m.nombre}</h3>
                  <span className="house__meta">{total}</span>
                </span>
                <span className="house__arrow" aria-hidden="true">&rarr;</span>
              </span>
              {variant === "grid" && m.descripcion && <span className="house__desc">{m.descripcion}</span>}
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
