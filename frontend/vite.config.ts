import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx,js,jsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "src/**/__tests__/**"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    }
  }
} as any);
