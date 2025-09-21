import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";
import path from "path";
import dts from "vite-plugin-dts";

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
