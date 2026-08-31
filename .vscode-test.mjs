import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  tests: [
    {
      files: "out/test/**/*.test.js",
    },
  ],
  coverage: {
    reporter: ["text", "lcov", "json-summary"],
    output: "coverage",
  },
});
