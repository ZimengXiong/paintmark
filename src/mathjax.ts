import { mathjax } from "@mathjax/src/js/mathjax.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { SVG } from "@mathjax/src/js/output/svg.js";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { decodeImage } from "./images.js";
import type { Block, MarkdownDocument } from "./types.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const document = mathjax.document("", {
  InputJax: new TeX(),
  OutputJax: new SVG({ fontCache: "none", linebreaks: { inline: false } }),
});
let wasm: Promise<void> | undefined;
const ready = () => wasm ??= initWasm(resvgWasm);
const cache = new Map<string, Promise<ReturnType<typeof decodeImage>>>();

/** Typeset TeX with MathJax 4 and rasterize its self-contained SVG at print density. */
export async function renderMathAsset(source: string, display = true) {
  const key = `${display ? "display" : "inline"}:${source}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = (async () => {
      const node = document.convert(source, { display });
      const output = adaptor.outerHTML(node);
      const svg = output.replace(/^<mjx-container[^>]*>/, "").replace(/<\/mjx-container>$/, "").replaceAll("currentColor", "#30363d");
      const widthEx = Number(/\bwidth="([\d.]+)ex"/.exec(svg)?.[1] ?? 1);
      const heightEx = Number(/\bheight="([\d.]+)ex"/.exec(svg)?.[1] ?? 1);
      const viewBox = /\bviewBox="[\d.-]+\s+([\d.-]+)\s+[\d.-]+\s+([\d.-]+)"/.exec(svg);
      const ascent = Math.abs(Number(viewBox?.[1] ?? 0)), total = Number(viewBox?.[2] ?? 1);
      await ready();
      const renderer = new Resvg(svg, { fitTo: { mode: "zoom", value: 3 }, background: "rgba(255,255,255,0)" });
      const rendered = renderer.render(), png = rendered.asPng();
      rendered.free(); renderer.free();
      return { ...decodeImage(png, `math:${source}`, "image/png"), pixelRatio: 3,
        widthEm: widthEx * 0.5, heightEm: heightEx * 0.5, vectorSvg: svg,
        baselineRatio: total > 0 ? ascent / total : 0.8 };
    })();
    cache.set(key, pending);
  }
  return pending;
}

async function resolveBlocks(blocks: Block[]): Promise<Block[]> {
  return Promise.all(blocks.map(async block => {
    if (block.type === "math") return { ...block, asset: await renderMathAsset(block.source, true) };
    if (block.type === "quote") return { ...block, children: await resolveBlocks(block.children) };
    if (block.type === "paragraph" || block.type === "heading") return { ...block, runs: await resolveRuns(block.runs) };
    if (block.type === "list") return { ...block, items: await Promise.all(block.items.map(async item => ({ ...item, runs: await resolveRuns(item.runs) }))) };
    if (block.type === "table") return { ...block,
      header: await Promise.all(block.header.map(resolveRuns)),
      rows: await Promise.all(block.rows.map(row => Promise.all(row.map(resolveRuns)))) };
    return block;
  }));
}

async function resolveRuns(runs: import("./types.js").InlineRun[]) {
  return Promise.all(runs.map(async run => run.mathSource ? { ...run, mathAsset: await renderMathAsset(run.mathSource, false) } : run));
}

export async function resolveDocumentMath(input: MarkdownDocument): Promise<MarkdownDocument> {
  return { ...input, blocks: await resolveBlocks(input.blocks) };
}
