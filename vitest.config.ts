import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["packages/*"],
    coverage: {
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/tests/**",
        "**/*.config.*"
      ]
    }
  }
})
