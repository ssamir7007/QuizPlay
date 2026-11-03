import { defineConfig } from "vite";
import { api } from "./server/api.js";
export default defineConfig({
  plugins: [
    {
      name: "quiz-api",
      configureServer(server) {
        server.middlewares.use(api);
      },
      configurePreviewServer(server) {
        server.middlewares.use(api);
      },
    },
  ],
});
