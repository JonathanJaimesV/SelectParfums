import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import "./styles.css";
import "./detail.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider><App /></CatalogProvider>
    </BrowserRouter>
  </StrictMode>
);
