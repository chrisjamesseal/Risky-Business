/// <reference types="node" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// GitHub Pages project site is served from /<repo>/.
// Override with a VITE_BASE env var for other hosts (e.g. "/").
export default defineConfig({
  base: process.env.VITE_BASE ?? "/Risky-Business/",
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
  },
});
