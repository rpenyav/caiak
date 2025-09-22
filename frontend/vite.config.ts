import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";
import path from "path";
import dts from "vite-plugin-dts";
import sass from "sass"; // Asegúrate de instalarlo

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    dts({
      tsconfigPath: path.resolve(__dirname, "./tsconfig.app.json"),
      rollupTypes: true,
      insertTypesEntry: true,
      outDir: "dist",
    }),
    {
      name: "sass",
      transform(code, id) {
        if (id.endsWith(".scss")) {
          return sass.compileString(code, { sourceMap: true }).css;
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/adapters"),
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@ui": path.resolve(__dirname, "./src/ui"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        // 👇 salto de línea al final para no “pegarse” con la primera línea del .scss
        additionalData: `@use "@/styles/variables.scss" as *;\n`,
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3004,
    strictPort: true,
    cors: {
      origin: "*",
      credentials: true,
    },
    fs: {
      allow: [".", "../shared"],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: "dist",
    minify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
});
