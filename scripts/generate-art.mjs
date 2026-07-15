import { writeFile } from "node:fs/promises";
import { encode } from "fast-png";

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => value * value * (3 - 2 * value);
const mix = (a, b, t) => a + (b - a) * t;
const rgb = hex => [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
const blend = (base, color, alpha) => base.map((channel, index) => mix(channel, color[index], alpha));

function hash(x, y, seed) {
  let value = Math.imul(x ^ seed, 0x45d9f3b) ^ Math.imul(y + seed, 0x119de1f3);
  value = Math.imul(value ^ value >>> 16, 0x45d9f3b);
  return ((value ^ value >>> 16) >>> 0) / 0xffffffff;
}

function noise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  return mix(mix(hash(ix, iy, seed), hash(ix + 1, iy, seed), fx), mix(hash(ix, iy + 1, seed), hash(ix + 1, iy + 1, seed), fx), fy);
}

function fbm(x, y, seed, octaves = 5) {
  let value = 0, amplitude = 0.55, total = 0;
  for (let octave = 0; octave < octaves; octave++) {
    value += amplitude * noise(x, y, seed + octave * 1013); total += amplitude;
    x = x * 2.03 + 17.1; y = y * 2.01 - 9.7; amplitude *= 0.5;
  }
  return value / total;
}

function random(seed) {
  let state = seed >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 0x100000000; };
}

function makeWashes(seed, count, palette, aspect) {
  const rand = random(seed);
  return Array.from({ length: count }, (_, index) => ({
    x: -0.15 + rand() * 1.3,
    y: -0.12 + rand() * 1.24,
    rx: 0.34 + rand() * 0.52,
    ry: (0.32 + rand() * 0.58) / Math.max(0.72, Math.sqrt(aspect)),
    angle: rand() * Math.PI,
    color: palette[(index + 1 + Math.floor(rand() * (palette.length - 1))) % palette.length],
    opacity: 0.28 + rand() * 0.48,
    edge: 0.08 + rand() * 0.12,
    warp: 0.2 + rand() * 0.28,
    seed: seed + index * 7919,
  }));
}

function render({ width, height, seed, colors, direction = "vertical", washes = 10, speckles = 620 }) {
  const palette = colors.map(rgb), data = new Uint8Array(width * height * 3), aspect = width / height;
  const layers = makeWashes(seed, washes, palette, aspect);
  for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
    const x = px / (width - 1), y = py / (height - 1);
    const warpX = fbm(x * 2.1 + 11, y * 2.1 - 7, seed + 31, 4) - 0.5;
    const warpY = fbm(x * 2.1 - 5, y * 2.1 + 13, seed + 67, 4) - 0.5;
    const gradient = direction === "horizontal" ? x : y;
    const palettePosition = clamp(gradient * (palette.length - 1));
    const first = Math.min(palette.length - 2, Math.floor(palettePosition)), fraction = palettePosition - first;
    let color = palette[first].map((channel, index) => mix(channel, palette[first + 1][index], fraction));
    for (const layer of layers) {
      const dx = x + warpX * layer.warp - layer.x, dy = y + warpY * layer.warp - layer.y;
      const c = Math.cos(layer.angle), s = Math.sin(layer.angle);
      const rx = (dx * c - dy * s) / layer.rx, ry = (dx * s + dy * c) / layer.ry;
      const contour = 1 - Math.sqrt(rx * rx + ry * ry) + (fbm(x * 4.2, y * 4.2, layer.seed, 4) - 0.5) * 0.72;
      const alpha = smooth(clamp((contour + layer.edge) / (2 * layer.edge))) * layer.opacity;
      color = blend(color, layer.color, alpha);
    }
    const tooth = (noise(px * 0.41, py * 0.41, seed + 997) - 0.5) * 0.065;
    const granulation = (fbm(x * 58, y * 58, seed + 1597, 3) - 0.5) * 0.045;
    const index = (py * width + px) * 3;
    for (let channel = 0; channel < 3; channel++) data[index + channel] = Math.round(clamp(color[channel] + tooth + granulation) * 255);
  }

  const rand = random(seed ^ 0xa5a5a5a5);
  for (let dot = 0; dot < speckles; dot++) {
    const cx = Math.floor(rand() * width), cy = Math.floor(rand() * height);
    const radius = Math.max(0.7, Math.pow(rand(), 2.4) * Math.min(width, height) * 0.009);
    const dark = rand() > 0.2, opacity = 0.12 + rand() * 0.44;
    const target = dark ? [0.035, 0.03, 0.025] : [0.94, 0.93, 0.86];
    const reach = Math.ceil(radius);
    for (let oy = -reach; oy <= reach; oy++) for (let ox = -reach; ox <= reach; ox++) {
      const distance = Math.sqrt(ox * ox + oy * oy) / radius;
      if (distance > 1 || cx + ox < 0 || cx + ox >= width || cy + oy < 0 || cy + oy >= height) continue;
      const alpha = opacity * smooth(1 - distance);
      const index = ((cy + oy) * width + cx + ox) * 3;
      for (let channel = 0; channel < 3; channel++) data[index + channel] = Math.round(mix(data[index + channel], target[channel] * 255, alpha));
    }
  }
  return encode({ width, height, data, channels: 3, depth: 8 }, { zlib: { level: 7 } });
}

const artworks = [
  { name: "procedural-portrait.png", width: 800, height: 1200, seed: 0x216f3a, colors: ["#273923", "#47624a", "#4d8984", "#8eb7ad", "#c17b50", "#56798e"], washes: 12, speckles: 540 },
  { name: "procedural-wide.png", width: 1600, height: 650, seed: 0x7351aa, colors: ["#172f51", "#385783", "#71668e", "#a36c7d", "#d77c6f", "#f0a28a"], direction: "horizontal", washes: 14, speckles: 620 },
  { name: "procedural-tall.png", width: 600, height: 1800, seed: 0xc84f31, colors: ["#de7c38", "#b74436", "#842e3e", "#62314e", "#3c2545"], washes: 15, speckles: 760 },
];

for (const artwork of artworks) {
  const bytes = render(artwork);
  await writeFile(new URL(`../demo/images/${artwork.name}`, import.meta.url), bytes);
  console.log(`${artwork.name}: ${artwork.width}×${artwork.height}, seed ${artwork.seed}`);
}
