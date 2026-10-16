import { useRef, useState } from "react";

const SLOTS = ["Principal", "Adicional 1", "Adicional 2"];
const MAX_SIDE = 800; // px — las fotos subidas se reducen para no llenar el almacenamiento del navegador

/** Reduce y comprime una imagen subida → data URL JPEG (fondo blanco para PNG transparentes). */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("El archivo no es una imagen."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagen no válida."));
      img.onload = () => {
        const k = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** 3 espacios (principal + 2 adicionales): cada uno acepta ruta/URL o archivo subido. */
export default function ImageManager({ value, onChange }) {
  const [errors, setErrors] = useState({});
  const [broken, setBroken] = useState({});
  const fileRefs = [useRef(null), useRef(null), useRef(null)];

  const set = (i, v) => { const n = [...value]; n[i] = v || null; onChange(n); setBroken((b) => ({ ...b, [i]: false })); };
  const upload = async (i, file) => {
    if (!file) return;
    try { set(i, await fileToDataUrl(file)); setErrors((e) => ({ ...e, [i]: "" })); }
    catch (err) { setErrors((e) => ({ ...e, [i]: err.message })); }
  };

  return (
    <div className="adm-images">
      {SLOTS.map((label, i) => {
        const src = value[i];
        const isData = src?.startsWith("data:");
        return (
          <div key={i} className="adm-image">
            <div className="adm-image__preview">
              {src && !broken[i]
                ? <img src={src} alt={`Vista previa: ${label}`} onError={() => setBroken((b) => ({ ...b, [i]: true }))} />
                : <span>{src ? "No se encuentra la imagen" : "Sin imagen"}</span>}
            </div>
            <p className="adm-image__label">{label}</p>
            <input className="adm-input adm-input--sm" aria-label={`Ruta o URL de la imagen ${label}`}
              placeholder="/assets/images/… o https://…" value={isData ? "(archivo subido)" : src || ""}
              readOnly={isData} onChange={(e) => set(i, e.target.value.trim())} />
            <div className="adm-image__actions">
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => fileRefs[i].current?.click()}>Subir</button>
              {src && <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => set(i, null)}>Quitar</button>}
              <input ref={fileRefs[i]} type="file" accept="image/*" hidden onChange={(e) => { upload(i, e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            {errors[i] && <p className="adm-error" role="alert">{errors[i]}</p>}
          </div>
        );
      })}
    </div>
  );
}
