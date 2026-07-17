import paletteBytes from "../assets/emoji/1f3a8.png";
import documentBytes from "../assets/emoji/1f4c4.png";
import { decodeImage } from "./images.js";
import type { Block, ImageAsset, InlineRun, MarkdownDocument } from "./types.js";

const colorEmoji = new Map<string, ImageAsset>([
  ["🎨", { ...decodeImage(paletteBytes, "paintmark:emoji:palette", "image/png"), widthEm: 1, heightEm: 1, baselineRatio: 0.82 }],
  ["📄", { ...decodeImage(documentBytes, "paintmark:emoji:document", "image/png"), widthEm: 1, heightEm: 1, baselineRatio: 0.82 }],
]);

function colorRuns(runs: InlineRun[]): InlineRun[] {
  const result: InlineRun[] = [];
  for (const run of runs) {
    let text = "";
    const flush = () => {
      if (text) result.push({ ...run, text });
      text = "";
    };
    for (const character of run.text) {
      const asset = colorEmoji.get(character);
      if (!asset) {
        text += character;
        continue;
      }
      flush();
      result.push({ ...run, text: character, mathAsset: asset });
    }
    flush();
  }
  return result;
}

function colorBlock(block: Block): Block {
  if (block.type === "paragraph" || block.type === "heading") return { ...block, runs: colorRuns(block.runs) };
  if (block.type === "list") return { ...block, items: block.items.map(item => ({ ...item, runs: colorRuns(item.runs) })) };
  if (block.type === "table") return {
    ...block,
    header: block.header.map(colorRuns),
    rows: block.rows.map(row => row.map(colorRuns)),
  };
  if (block.type === "quote") return { ...block, children: block.children.map(colorBlock) };
  return block;
}

export function resolveColorEmoji(document: MarkdownDocument): MarkdownDocument {
  return { ...document, blocks: document.blocks.map(colorBlock) };
}
