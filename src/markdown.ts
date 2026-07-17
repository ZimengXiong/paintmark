import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { gfm } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { latexToText } from "./math.js";
import type {
  BlockContent, Definition, Image, ImageReference, Link, LinkReference,
  PhrasingContent, Root, RootContent, Table, TableCell,
} from "mdast";
import type {
  Alignment, Block, ImageBlock, InlineRun, ListBlock, ListItem, MarkdownDocument,
} from "./types.js";

interface ParseContext {
  definitions: Map<string, Definition>;
}

function mergeRuns(runs: InlineRun[]): InlineRun[] {
  const out: InlineRun[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const prev = out.at(-1);
    if (prev && prev.bold === run.bold && prev.italic === run.italic && prev.strike === run.strike &&
        prev.code === run.code && prev.link === run.link && prev.math === run.math && !run.mathSource && !prev.mathSource) prev.text += run.text;
    else out.push({ ...run });
  }
  return out;
}

function referenceUrl(node: LinkReference | ImageReference, ctx: ParseContext): string | undefined {
  return ctx.definitions.get(node.identifier.toLowerCase())?.url;
}

function inlineRuns(
  nodes: PhrasingContent[],
  ctx: ParseContext,
  style: Pick<InlineRun, "bold" | "italic" | "strike" | "link"> = {},
): InlineRun[] {
  const runs: InlineRun[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case "text": runs.push({ text: node.value, ...style }); break;
      case "inlineCode": runs.push({ text: node.value, code: true, ...style }); break;
      case "inlineMath": runs.push({ text: latexToText(node.value), math: true, mathSource: node.value, italic: true, ...style }); break;
      case "strong": runs.push(...inlineRuns(node.children, ctx, { ...style, bold: true })); break;
      case "emphasis": runs.push(...inlineRuns(node.children, ctx, { ...style, italic: true })); break;
      case "delete": runs.push(...inlineRuns(node.children, ctx, { ...style, strike: true })); break;
      case "link": runs.push(...inlineRuns((node as Link).children, ctx, { ...style, link: node.url })); break;
      case "linkReference": {
        const url = referenceUrl(node as LinkReference, ctx);
        runs.push(...inlineRuns(node.children, ctx, { ...style, ...(url ? { link: url } : {}) }));
        break;
      }
      case "image": runs.push({ text: node.alt || "image", italic: true, ...style }); break;
      case "imageReference": runs.push({ text: node.alt || "image", italic: true, ...style }); break;
      case "break": runs.push({ text: "\n", ...style }); break;
      case "html": runs.push({ text: node.value, code: true, ...style }); break;
      default: {
        const parent = node as PhrasingContent & { children?: PhrasingContent[] };
        if (parent.children) runs.push(...inlineRuns(parent.children, ctx, style));
      }
    }
  }
  return mergeRuns(runs);
}

function imageFromNode(node: Image | ImageReference, ctx: ParseContext): ImageBlock | undefined {
  const source = node.type === "image" ? node.url : referenceUrl(node, ctx);
  if (!source) return undefined;
  const title = node.type === "image" ? node.title : ctx.definitions.get(node.identifier.toLowerCase())?.title;
  return { type: "image", source, alt: node.alt || "", ...(title ? { title } : {}) };
}

function cellRuns(cell: TableCell, ctx: ParseContext): InlineRun[] {
  return inlineRuns(cell.children, ctx);
}

function tableBlock(node: Table, ctx: ParseContext): Block | undefined {
  const [head, ...body] = node.children;
  if (!head) return undefined;
  const align = (node.align || []).map(value => (value || "left") as Alignment);
  return {
    type: "table",
    header: head.children.map(cell => cellRuns(cell, ctx)),
    rows: body.map(row => row.children.map(cell => cellRuns(cell, ctx))),
    align,
  };
}

function itemText(children: Root["children"], ctx: ParseContext): InlineRun[] {
  const runs: InlineRun[] = [];
  for (const child of children) {
    if (child.type === "paragraph" || child.type === "heading") {
      if (runs.length) runs.push({ text: " " });
      runs.push(...inlineRuns(child.children, ctx));
    }
  }
  return mergeRuns(runs);
}

function flattenList(node: Extract<RootContent, { type: "list" }>, ctx: ParseContext, depth = 0): ListItem[] {
  const items: ListItem[] = [];
  for (const child of node.children) {
    const prefix = child.checked == null ? [] : [{ text: child.checked ? "[x] " : "[ ] ", code: true } satisfies InlineRun];
    items.push({ depth, ordered: !!node.ordered, runs: [...prefix, ...itemText(child.children, ctx)] });
    for (const nested of child.children) {
      if (nested.type === "list") items.push(...flattenList(nested, ctx, depth + 1));
    }
  }
  return items;
}

function blocksFrom(nodes: Root["children"], ctx: ParseContext): Block[] {
  const blocks: Block[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case "paragraph": {
        if (node.children.length === 1 && (node.children[0]?.type === "image" || node.children[0]?.type === "imageReference")) {
          const image = imageFromNode(node.children[0], ctx);
          if (image) blocks.push(image);
        } else blocks.push({ type: "paragraph", runs: inlineRuns(node.children, ctx) });
        break;
      }
      case "heading": blocks.push({
        type: "heading", level: Math.min(node.depth, 3) as 1 | 2 | 3,
        runs: inlineRuns(node.children, ctx),
      }); break;
      case "thematicBreak": blocks.push({ type: "rule" }); break;
      case "code": blocks.push({ type: "code", lang: node.lang || "", lines: node.value.split("\n") }); break;
      case "math": blocks.push({ type: "math", source: node.value }); break;
      case "blockquote": blocks.push({ type: "quote", children: blocksFrom(node.children, ctx) }); break;
      case "list": {
        const list: ListBlock = { type: "list", ordered: !!node.ordered, items: flattenList(node, ctx) };
        blocks.push(list); break;
      }
      case "table": {
        const table = tableBlock(node, ctx);
        if (table) blocks.push(table);
        break;
      }
      case "html": blocks.push({ type: "code", lang: "html", lines: node.value.split("\n") }); break;
      case "definition": break;
      default: break;
    }
  }
  return blocks;
}

export function parseMarkdown(source: string): MarkdownDocument {
  const root = fromMarkdown(source, {
    extensions: [gfm(), mathSyntax()],
    mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()],
  }) as Root;
  const definitions = new Map<string, Definition>();
  for (const node of root.children) if (node.type === "definition") definitions.set(node.identifier.toLowerCase(), node);
  return { source, blocks: blocksFrom(root.children, { definitions }) };
}
