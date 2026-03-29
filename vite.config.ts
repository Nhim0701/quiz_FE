import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import devtoolsJson from "vite-plugin-devtools-json";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [devtoolsJson(), tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: ["katex", "@platejs/math", "react-tweet"],
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["quiz-harinezumi.uk"],
    proxy: {
      "/api/v1/": {
        target: "https://quiz-harinezumi.uk",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
