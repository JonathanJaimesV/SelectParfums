import { getNoteInfo } from "../data/notes";
import { useMediaQuery } from "../utils";
import Accordion from "./Accordion.jsx";

const STAGES = [
  {
    key: "salida",
    title: "Notas de Salida",
    image: "/assets/images/notes/opening-notes.jpg",
    alt: "Notas de salida - Primeros acordes cítricos y frescos",
  },
  {
    key: "corazon",
    title: "Notas de Corazón",
    image: "/assets/images/notes/heart-notes.jpg",
    alt: "Notas de corazón - Flores y notas medias",
  },
  {
    key: "fondo",
    title: "Notas de Fondo",
    image: "/assets/images/notes/base-notes.jpg",
    alt: "Notas de fondo - Maderas, resinas y fijación",
  },
];

function NoteList({ list }) {
  if (list.length === 0) return <p className="fragrance-notes__empty">Notas próximamente</p>;
  return (
    <ul className="fragrance-notes__list">
      {list.map((rawNote, idx) => {
        const info = getNoteInfo(rawNote);
        return (
          <li key={`${info.name}-${idx}`} className="fragrance-notes__item">
            <span className="fragrance-notes__icon-wrap">
              <img
                src={info.icon}
                alt=""
                className="fragrance-notes__icon-img"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              />
            </span>
            <span className="fragrance-notes__name">{info.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function FragranceNotes({ notes, perfumeName }) {
  // Escritorio: 3 tarjetas con foto. Móvil/tablet: acordeón (sin scroll interminable).
  const wide = useMediaQuery("(min-width: 960px)");
  if (!notes) return null;

  const imgAlt = (stage) => `${stage.alt}${perfumeName ? ` de ${perfumeName}` : ""}`;

  return (
    <section className="fragrance-notes-section" id="notas-olfativas" aria-label="Notas olfativas">
      <div className="container">
        <div className="fragrance-notes__header">
          <p className="section-label">Pirámide Olfativa</p>
          <h2 className="fragrance-notes__title">Descubre las Notas</h2>
          <p className="fragrance-notes__subtitle">
            Explora la evolución aromática de la fragancia desde la salida hasta el fondo
          </p>
        </div>

        {wide ? (
          <div className="fragrance-notes__grid">
            {STAGES.map((stage) => (
              <div key={stage.key} className="fragrance-notes__card">
                <div className="fragrance-notes__card-media">
                  <img src={stage.image} alt={imgAlt(stage)} loading="lazy" className="fragrance-notes__card-img" />
                </div>
                <div className="fragrance-notes__card-body">
                  <h3 className="fragrance-notes__card-title">{stage.title}</h3>
                  <div className="fragrance-notes__card-divider" />
                  <NoteList list={notes[stage.key] || []} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fragrance-notes__acc">
            <Accordion
              defaultOpen={["salida"]}
              items={STAGES.map((stage) => {
                const list = notes[stage.key] || [];
                return {
                  id: stage.key,
                  title: stage.title,
                  meta: list.length ? String(list.length) : undefined,
                  media: <img src={stage.image} alt="" loading="lazy" />,
                  content: <NoteList list={list} />,
                };
              })}
            />
          </div>
        )}
      </div>
    </section>
  );
}
