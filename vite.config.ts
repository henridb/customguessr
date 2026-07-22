import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from https://<user>.github.io/customguessr/ on GitHub Pages,
// so assets must resolve under the /customguessr/ subpath.
export default defineConfig({
  base: "/customguessr/",
  plugins: [react(), tailwindcss()],
});
