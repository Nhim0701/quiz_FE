import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
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
