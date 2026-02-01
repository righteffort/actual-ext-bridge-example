import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

/**
 * Custom plugin to update the manifest.json with package.json details
 * and copy it to the dist folder.
 */
const manifestPlugin = () => {
  return {
    name: "update-manifest",
    writeBundle() {
      const packageJson = JSON.parse(
        fs.readFileSync(resolve(__dirname, "package.json"), "utf-8"),
      );
      const manifestPath = resolve(__dirname, "src/manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      // Strictly using package.json fields as requested
      manifest.name = packageJson.name;
      manifest.description = packageJson.description;
      manifest.version = packageJson.version;

      // Ensure side_panel path matches output
      if (manifest.side_panel && manifest.side_panel.default_path) {
          manifest.side_panel.default_path = "sidepanel.html";
      }

      const distPath = resolve(__dirname, "dist/manifest.json");
      if (!fs.existsSync(resolve(__dirname, "dist"))) {
        fs.mkdirSync(resolve(__dirname, "dist"));
      }
      fs.writeFileSync(distPath, JSON.stringify(manifest, null, 2));
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), manifestPlugin()],
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/sidepanel/index.html"),
        background: resolve(__dirname, "src/background/service-worker.ts"),
        content: resolve(__dirname, "src/content/connector.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "service-worker.js";
          }
          if (chunkInfo.name === "content") {
            return "content.js";
          }
          return "[name].js";
        },
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
    },
  },
});
