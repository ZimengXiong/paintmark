import { decode as decodePng } from "fast-png";
import type { Block, ImageAsset, ImageResolver, MarkdownDocument } from "./types.js";

function stableId(source: string, bytes: Uint8Array): string {
  let hash = 2166136261;
  const sample = `${source}:${bytes.length}:${bytes[0] ?? 0}:${bytes.at(-1) ?? 0}`;
  for (let i = 0; i < sample.length; i++) {
    hash ^= sample.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `image-${(hash >>> 0).toString(16)}`;
}

function detectMime(bytes: Uint8Array, hinted?: string): "image/jpeg" | "image/png" {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (hinted?.includes("png")) return "image/png";
  if (hinted?.includes("jpeg") || hinted?.includes("jpg")) return "image/jpeg";
  throw new Error("Only PNG and JPEG images are currently supported");
}

function jpegDimensions(bytes: Uint8Array): { width: number; height: number; channels: 1 | 3 | 4 } {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error("Invalid JPEG signature");
  let offset = 2;
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++]!;
    if (marker === 0xd9 || marker === 0xda) break;
    const length = ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
    if (length < 2 || offset + length > bytes.length) throw new Error("Malformed JPEG segment");
    if (sof.has(marker)) {
      const height = ((bytes[offset + 3] ?? 0) << 8) | (bytes[offset + 4] ?? 0);
      const width = ((bytes[offset + 5] ?? 0) << 8) | (bytes[offset + 6] ?? 0);
      const count = bytes[offset + 7] ?? 3;
      if (count !== 1 && count !== 3 && count !== 4) throw new Error(`Unsupported JPEG channel count: ${count}`);
      return { width, height, channels: count };
    }
    offset += length;
  }
  throw new Error("JPEG dimensions not found");
}

function eightBitPixels(data: Uint8Array | Uint8ClampedArray | Uint16Array, depth: number): Uint8Array {
  if (data instanceof Uint16Array || depth === 16) {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) result[i] = Math.round((data[i] ?? 0) / 257);
    return result;
  }
  if (depth === 8) return new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  const maximum = (1 << depth) - 1;
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) result[i] = Math.round(((data[i] ?? 0) / maximum) * 255);
  return result;
}

export function decodeImage(bytes: Uint8Array, source = "image", hintedMime?: string): ImageAsset {
  const mimeType = detectMime(bytes, hintedMime);
  if (mimeType === "image/jpeg") {
    const { width, height, channels } = jpegDimensions(bytes);
    return { id: stableId(source, bytes), source, format: "jpeg", mimeType, width, height, channels, bytes };
  }
  const png = decodePng(bytes, { checkCrc: true });
  if (png.channels < 1 || png.channels > 4) throw new Error(`Unsupported PNG channel count: ${png.channels}`);
  return {
    id: stableId(source, bytes), source, format: "png", mimeType,
    width: png.width, height: png.height, channels: png.channels as 1 | 2 | 3 | 4,
    bytes, pixels: eightBitPixels(png.data, png.depth),
  };
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function createFetchImageResolver(
  fetcher: typeof fetch = fetch,
  baseUrl?: string,
): ImageResolver {
  return async source => {
    if (source.startsWith("data:")) {
      const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(source);
      if (!match) throw new Error("Malformed image data URL");
      const mime = match[1] || undefined;
      const bytes = match[2] ? decodeBase64(match[3]!) : new TextEncoder().encode(decodeURIComponent(match[3]!));
      return decodeImage(bytes, source, mime);
    }
    const url = baseUrl ? new URL(source, baseUrl).href : source;
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`Unable to load image ${source}: ${response.status} ${response.statusText}`);
    return decodeImage(new Uint8Array(await response.arrayBuffer()), source, response.headers.get("content-type") || undefined);
  };
}

async function resolveBlocks(blocks: Block[], resolver: ImageResolver, cache: Map<string, Promise<ImageAsset>>): Promise<Block[]> {
  return Promise.all(blocks.map(async block => {
    if (block.type === "image") {
      let pending = cache.get(block.source);
      if (!pending) { pending = resolver(block.source); cache.set(block.source, pending); }
      return { ...block, asset: await pending };
    }
    if (block.type === "quote") return { ...block, children: await resolveBlocks(block.children, resolver, cache) };
    return block;
  }));
}

export async function resolveDocumentImages(document: MarkdownDocument, resolver: ImageResolver): Promise<MarkdownDocument> {
  return { ...document, blocks: await resolveBlocks(document.blocks, resolver, new Map()) };
}
