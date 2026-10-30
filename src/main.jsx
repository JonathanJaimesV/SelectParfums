import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import { CartProvider } from "./cart/CartContext.jsx";
import "./styles.css";
import "./detail.css";
import "./cart/cart.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider><CartProvider><App /></CartProvider></CatalogProvider>
    </BrowserRouter>
  </StrictMode>
);
