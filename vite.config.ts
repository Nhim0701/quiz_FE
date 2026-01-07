import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["harinezumi.myddns.me"],
    proxy: {
      "/api/v1/": {
        target: "https://harinezumi.myddns.me/api/v1/",
        changeOrigin: false,
        secure: false,
      },
    },
  },
});
