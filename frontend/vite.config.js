import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // libraries rarely change, so keeping them in their own files lets
        // visitors reuse them from cache after every deploy
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          socket: ["socket.io-client"],
        },
      },
    },
  },
});