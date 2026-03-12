import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Phaser is intentionally isolated into its own vendor chunk for a faster first paint.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("/node_modules/phaser/")) {
            return "phaser";
          }
        }
      }
    }
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node"
  }
});
