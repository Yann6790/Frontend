import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        // Backend distant (onrender) en dev.
        // Surchargable via VITE_PROXY_TARGET si besoin.
        target:
          process.env.VITE_PROXY_TARGET || "https://ecampus-mmi.onrender.com",
        changeOrigin: true,
        secure: true,
        headers: {
          Origin: "https://ecampus-mmi.onrender.com",
          Referer: "https://ecampus-mmi.onrender.com/",
        },
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (!Array.isArray(setCookie)) return;

            // Dev localhost over HTTP cannot store Secure cookies.
            // Also drop Domain so browser stores cookie for localhost.
            proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
              cookie
                .replace(/;\s*Secure/gi, "")
                .replace(/;\s*Domain=[^;]+/gi, ""),
            );
          });
        },
      },
    },
  },
});
