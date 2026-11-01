import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5170,
    proxy: {
      "/api": "http://127.0.0.1:4000",
    },
  },
});
