import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { HomePage } from "./pages/HomePage.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

// HashRouter (URLs like /#/admin) so GitHub Pages serves index.html for every
// route without 404s on refresh or deep links.
createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
);
