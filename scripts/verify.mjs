import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRenderer, decodeImage } from "../dist/index.js";
import { loadInter } from "../dist/inter.js";

const markdown = `# Paintdown

This verification document exercises the public API, embedded fonts, image decoding, display-list pagination, and native PDF output.

## Wide image

The wide image is capped at the content width without distortion or upscaling.

![Wide example](./demo/images/wide.png "Wide image capped at content width")

## Portrait image

The portrait image remains in normal reading flow and moves intact when the remaining page space is too small.

![Portrait example](./demo/images/portrait.png "Portrait image kept intact")

This paragraph should wrap beside the portrait image with a measured gutter. It exercises the native display-list float rather than relying on HTML or browser layout behavior. Structural blocks that follow clear the figure automatically.

---

## Very tall image

The very tall image is fitted to the usable page box and top-aligned.

![Tall example](./demo/images/tall.png "Very tall image fitted to the page")

Supporting prose wraps beside a tall figure while landscape artwork remains a full-width block. Captions stay attached and do not enter the wrapped text column.

| Feature | Result | Notes |
| --- | --- | --- |
| Aspect ratio | Preserved | No distortion |
| Pagination | Atomic | No clipping |
`;

const inter = loadInter();
const renderer = createRenderer({
  fonts: [inter.body, inter.display],
  config: { bodyFont: inter.body.id, headingFont: inter.display.id, blankSpaceDecoration: "dot-grid" },
  imageResolver: async source => decodeImage(new Uint8Array(await readFile(new URL(`../${source.replace(/^\.\//, "")}`, import.meta.url))), source),
});
await mkdir(new URL("../output/pdf/", import.meta.url), { recursive: true });
await writeFile(new URL("../output/pdf/verification.pdf", import.meta.url), await renderer.pdf(markdown));
