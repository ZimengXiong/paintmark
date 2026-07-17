import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [{
    name: "paintmark-binary-png",
    enforce: "pre",
    load(id) {
      const path = id.split("?")[0]!;
      if (!path.endsWith(".png")) return;
      return `export default Uint8Array.from(${JSON.stringify([...readFileSync(path)])})`;
    },
  }],
});
