import { defineConfig } from "vitest/config";

export default defineConfig({
  // Project site, not a user page: https://frozenmango8.github.io/typing-sprint/
  base: "/typing-sprint/",
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
