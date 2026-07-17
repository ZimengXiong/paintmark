import { cp, mkdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

await promisify(execFile)("npm", ["run", "build"]);
await rm("site", { recursive: true, force: true });
await mkdir("site/demo", { recursive: true });
await mkdir("site/exports", { recursive: true });
await cp("index.html", "site/index.html");
await cp("demo/dist", "site/demo/dist", { recursive: true });
await cp("demo/images", "site/demo/images", { recursive: true });
await promisify(execFile)("node", ["dist/cli.js", "sample.md", "-o", "site/exports/paintmark.html", "--no-open"]);
await promisify(execFile)("node", ["dist/cli.js", "sample.md", "-o", "site/exports/paintmark.pdf", "--no-open"]);
