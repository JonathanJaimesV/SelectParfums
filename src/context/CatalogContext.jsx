import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import {
  catalogReducer, loadState, saveState, clearStoredState, collectNotes,
} from "../services/catalogService";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [state, dispatch] = useReducer(catalogReducer, undefined, loadState);
  const [saveError, setSaveError] = useState(null);

  // Solo se escribe en localStorage cuando el admin cambió algo (nunca para visitantes normales).
  useEffect(() => {
    if (state.modified) setSaveError(saveState(state));
  }, [state]);

  // Si el admin tiene la tienda abierta en otra pestaña, se mantiene sincronizada.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key.startsWith("selectparfums:catalog")) dispatch({ type: "HYDRATE", state: loadState() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => {
    const marcas = state.marcas.map((m) => ({
      ...m,
      fragancias: state.productos.filter((p) => p.marca.toLowerCase() === m.nombre.toLowerCase()).length,
    }));
    return {
      productos: state.productos,
      marcas,
      notasDisponibles: collectNotes(state.productos),
      modified: state.modified,
      saveError,
      addProduct: (product) => dispatch({ type: "ADD_PRODUCT", product }),
      updateProduct: (product) => dispatch({ type: "UPDATE_PRODUCT", product }),
      deleteProduct: (id) => dispatch({ type: "DELETE_PRODUCT", id }),
      setStatus: (id, status) => dispatch({ type: "SET_STATUS", id, status }),
      addBrand: (brand) => dispatch({ type: "ADD_BRAND", brand }),
      resetCatalog: () => { clearStoredState(); dispatch({ type: "RESET" }); },
      state,
    };
  }, [state, saveError]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  return ctx;
}
