import { build } from "esbuild";
import { chmod, copyFile, rm, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import packageJson from "../package.json" with { type: "json" };

await rm("dist", { recursive: true, force: true });
await rm("demo/dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await mkdir("demo/dist", { recursive: true });
await build({
  entryPoints: ["src/index.ts", "src/browser.ts"], outdir: "dist", format: "esm", platform: "neutral",
  bundle: true, sourcemap: true, target: "es2022", external: [], loader: { ".wasm": "binary", ".ttf": "binary", ".png": "binary" },
});
await build({
  entryPoints: ["src/inter.ts", "src/bundled-fonts.ts"], outdir: "dist", format: "esm", platform: "browser", bundle: true, sourcemap: true,
  target: "es2022", loader: { ".ttf": "binary" },
});
await build({
  entryPoints: ["src/cli.ts"], outdir: "dist", format: "esm", platform: "node", bundle: true, sourcemap: false,
  target: "node20", loader: { ".ttf": "binary", ".wasm": "binary", ".png": "binary" }, banner: { js: "#!/usr/bin/env node" },
  define: { __PAINTMARK_VERSION__: JSON.stringify(packageJson.version) },
});
await chmod("dist/cli.js", 0o755);
await mkdir("packages/fonts/dist", { recursive: true });
await build({
  entryPoints: { index: "src/bundled-fonts.ts" }, outdir: "packages/fonts/dist", format: "esm", platform: "neutral",
  bundle: true, sourcemap: false, target: "es2022", loader: { ".ttf": "binary" },
});
await copyFile("fonts/INTER-LICENSE.txt", "packages/fonts/dist/OFL.txt");
await copyFile("LICENSE", "packages/fonts/dist/LICENSE");
await promisify(execFile)("npx", ["tsc", "--emitDeclarationOnly"]);
await build({
  entryPoints: { demo: "demo/app.ts" }, outdir: "demo/dist", format: "esm", platform: "browser", bundle: true, sourcemap: true,
  splitting: true, target: "es2022", loader: { ".ttf": "binary", ".wasm": "binary", ".png": "binary", ".md": "text" },
});
