import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "@aptos-labs/wallet-adapter-react",
      "@aptos-labs/wallet-adapter-core",
      "@aptos-labs/ts-sdk",
      "petra-plugin-wallet-adapter",
    ],
    esbuildOptions: {
      // Use a more compatible target for dependencies
      target: "es2020",
      // Keep names to prevent initialization issues
      keepNames: true,
      // Avoid problematic transformations
      minifyIdentifiers: false,
    },
  },
  define: {
    global: "window",
    // Add process polyfill for better compatibility
    "process.env": {},
  },
  build: {
    rollupOptions: {
      output: {
        // More aggressive manual chunking to prevent symbol collisions
        manualChunks(id: string) {
          // Separate all wallet-related packages into individual chunks
          if (id.includes("@aptos-labs/wallet-adapter-core")) {
            return "wallet-adapter-core";
          }
          if (id.includes("@aptos-labs/wallet-adapter-react")) {
            return "wallet-adapter-react";
          }
          if (id.includes("petra-plugin-wallet-adapter")) {
            return "petra-wallet-adapter";
          }
          if (id.includes("@aptos-labs/ts-sdk")) {
            return "aptos-ts-sdk";
          }
          // Separate React and React DOM
          if (id.includes("react") && !id.includes("react-dom")) {
            return "react-vendor";
          }
          if (id.includes("react-dom")) {
            return "react-dom-vendor";
          }
          // Separate large libraries
          if (id.includes("framer-motion")) {
            return "framer-motion";
          }
          if (id.includes("@tanstack/react-query")) {
            return "react-query";
          }
          // Put all other node_modules in vendor chunk but with more granular separation
          if (id.includes("node_modules")) {
            // Try to separate wallet-related modules that might conflict
            if (id.includes("wallet") || id.includes("adapter")) {
              return "wallet-vendor";
            }
            return "vendor";
          }
        },
        // Enhanced output options to prevent naming conflicts
        entryFileNames: `assets/entry-[name]-[hash].js`,
        chunkFileNames: `assets/chunk-[name]-[hash].js`,
        assetFileNames: `assets/asset-[name]-[hash].[ext]`,
      },
      // Add external dependencies that might cause conflicts
      external: [],
      // Preserve entry signatures to avoid symbol collisions
      preserveEntrySignatures: "strict",
    },
    // Enhanced build options
    chunkSizeWarningLimit: 2000,
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    // Add esbuild options to handle initialization issues
    esbuildOptions: {
      // Keep function names to prevent initialization errors
      keepNames: true,
      // Use more conservative target to avoid compatibility issues
      target: "es2020",
      // Avoid mangling that might cause initialization issues
      minifyIdentifiers: false,
      // Don't mangle specific problematic patterns
      reserveProps: /^(Gh|Qc|qe|Ge)$/,
    },
  },
});
