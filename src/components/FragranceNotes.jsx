import { getNoteInfo } from "../data/notes";

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

export default function FragranceNotes({ notes, perfumeName }) {
  if (!notes) return null;

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

        <div className="fragrance-notes__grid">
          {STAGES.map((stage) => {
            const list = notes[stage.key] || [];
            return (
              <div key={stage.key} className="fragrance-notes__card">
                <div className="fragrance-notes__card-media">
                  <img
                    src={stage.image}
                    alt={`${stage.alt}${perfumeName ? ` de ${perfumeName}` : ""}`}
                    loading="lazy"
                    className="fragrance-notes__card-img"
                  />
                </div>
                <div className="fragrance-notes__card-body">
                  <h3 className="fragrance-notes__card-title">{stage.title}</h3>
                  <div className="fragrance-notes__card-divider" />
                  {list.length > 0 ? (
                    <ul className="fragrance-notes__list">
                      {list.map((rawNote, idx) => {
                        const info = getNoteInfo(rawNote);
                        return (
                          <li
                            key={`${info.name}-${idx}`}
                            className="fragrance-notes__item"
                          >
                            <span className="fragrance-notes__icon-wrap">
                              {info.icon ? (
                                <img
                                  src={info.icon}
                                  alt={info.name}
                                  className="fragrance-notes__icon-img"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="fragrance-notes__icon-emoji">{info.emoji}</span>
                              )}
                            </span>
                            <span className="fragrance-notes__name">{info.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="fragrance-notes__empty">Notas próximamente</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
