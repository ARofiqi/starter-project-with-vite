import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        app: resolve(__dirname, "src/scripts/index.js"),
        sw: resolve(__dirname, "src/scripts/sw.js"),
      },
      output: {
        entryFileNames: "scripts/[name].js",
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif)$/.test(name ?? '')) {
            return 'assets/images/[name].[ext]'
          }
          return 'assets/[name].[ext]'
        }
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      'leaflet/images': resolve(__dirname, 'node_modules/leaflet/dist/images')
    },
  },

  optimizeDeps: {
    include: [
      'leaflet',
      'leaflet/dist/leaflet.css'
    ],
  },
});