// Package the Vite text assets with the serverless route for the private Sites preview.
import { build } from "vite";
import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
const files = {};
const mime = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
};
for (const file of await readdir("dist", { recursive: true })) {
  const type = mime[path.extname(file)];
  if (type)
    files["/" + file.replaceAll("\\", "/")] = [
      type,
      await readFile(path.join("dist", file), "utf8"),
    ];
}
await build({
  configFile: false,
  plugins: [
    {
      name: "embed-assets",
      resolveId(id) {
        if (id === "virtual:quizplay-assets") return "\0" + id;
      },
      load(id) {
        if (id === "\0virtual:quizplay-assets")
          return "export default " + JSON.stringify(files);
      },
    },
  ],
  build: {
    outDir: "dist/server",
    lib: {
      entry: "server/worker.js",
      formats: ["es"],
      fileName: () => "index.js",
    },
    minify: false,
  },
});
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
