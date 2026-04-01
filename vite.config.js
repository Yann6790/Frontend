import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://ecampus-mmi.onrender.com",
        changeOrigin: true,
        secure: true,
        headers: {
          // Forcer l'Origin et le Referer pour que Better Auth accepte la requête
          Origin: "https://ecampus-mmi.onrender.com",
          Referer: "https://ecampus-mmi.onrender.com/",
        },
      },
    },
  },
});
