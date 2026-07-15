import type { DrawItem, TextItem } from "./types.js";

type MathNode =
  | { type: "sequence"; children: MathNode[] }
  | { type: "symbol"; value: string; roman?: boolean }
  | { type: "fraction"; numerator: MathNode; denominator: MathNode }
  | { type: "sqrt"; body: MathNode }
  | { type: "script"; base: MathNode; superscript?: MathNode; subscript?: MathNode };

const SYMBOLS: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ϵ", zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ",
  iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", varpi: "ϖ", rho: "ρ", varrho: "ϱ", sigma: "σ",
  varsigma: "ς", tau: "τ", upsilon: "υ", phi: "φ", varphi: "ϕ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
  sum: "∑", prod: "∏", int: "∫", iint: "∬", iiint: "∭", oint: "∮", partial: "∂", nabla: "∇", infty: "∞",
  pm: "±", mp: "∓", times: "×", div: "÷", cdot: "·", ast: "∗", circ: "∘", bullet: "•", cap: "∩", cup: "∪",
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", approx: "≈", equiv: "≡", sim: "∼", propto: "∝",
  in: "∈", notin: "∉", ni: "∋", subset: "⊂", subseteq: "⊆", supset: "⊃", supseteq: "⊇", emptyset: "∅",
  forall: "∀", exists: "∃", neg: "¬", land: "∧", lor: "∨", therefore: "∴", because: "∵",
  to: "→", rightarrow: "→", leftarrow: "←", leftrightarrow: "↔", Rightarrow: "⇒", Leftarrow: "⇐", Leftrightarrow: "⇔",
  mapsto: "↦", ldots: "…", cdots: "⋯", vdots: "⋮", ddots: "⋱", prime: "′", hbar: "ℏ", ell: "ℓ", Re: "ℜ", Im: "ℑ",
  sin: "sin", cos: "cos", tan: "tan", cot: "cot", sec: "sec", csc: "csc", arcsin: "arcsin", arccos: "arccos", arctan: "arctan",
  log: "log", ln: "ln", exp: "exp", lim: "lim", max: "max", min: "min", det: "det", gcd: "gcd",
  langle: "⟨", rangle: "⟩", vert: "|", Vert: "‖", lbrace: "{", rbrace: "}", percent: "%", _: "_", " ": " ",
};

const ROMAN_COMMANDS = new Set(["mathrm", "mathbf", "text", "operatorname", "mathsf", "mathtt", "textrm"]);

class Parser {
  private index = 0;
  constructor(private readonly source: string) {}

  parse(stop = false): MathNode {
    const children: MathNode[] = [];
    while (this.index < this.source.length) {
      const char = this.source[this.index]!;
      if (stop && char === "}") { this.index++; break; }
      if (/\s/.test(char)) { this.index++; if (children.length && children.at(-1)?.type !== "symbol") children.push({ type: "symbol", value: " ", roman: true }); continue; }
      if (char === "^") { this.index++; this.attachScript(children, true); continue; }
      if (char === "_") { this.index++; this.attachScript(children, false); continue; }
      children.push(this.atom());
    }
    return children.length === 1 ? children[0]! : { type: "sequence", children };
  }

  private atom(): MathNode {
    const char = this.source[this.index++]!;
    if (char === "{") return this.parse(true);
    if (char !== "\\") return { type: "symbol", value: char, roman: !/[A-Za-z]/.test(char) };
    const start = this.index;
    while (/[A-Za-z]/.test(this.source[this.index] ?? "")) this.index++;
    const command = this.source.slice(start, this.index) || this.source[this.index++] || "";
    if (["left", "right"].includes(command)) return this.atom();
    if (["frac", "dfrac", "tfrac"].includes(command)) return { type: "fraction", numerator: this.argument(), denominator: this.argument() };
    if (command === "sqrt") {
      if (this.source[this.index] === "[") while (this.index < this.source.length && this.source[this.index++] !== "]") { /* root index is intentionally ignored */ }
      return { type: "sqrt", body: this.argument() };
    }
    if (ROMAN_COMMANDS.has(command) || ["mathit", "mathcal", "mathbb"].includes(command)) {
      const node = this.argument();
      if (ROMAN_COMMANDS.has(command)) this.makeRoman(node);
      return node;
    }
    if ([",", ";", ":", "!", "quad", "qquad"].includes(command)) return { type: "symbol", value: command === "qquad" ? "  " : " ", roman: true };
    return { type: "symbol", value: SYMBOLS[command] ?? `\\${command}`, roman: Boolean(SYMBOLS[command]) };
  }

  private argument(): MathNode {
    while (/\s/.test(this.source[this.index] ?? "")) this.index++;
    return this.atom();
  }

  private attachScript(children: MathNode[], superscript: boolean) {
    const argument = this.argument(), previous = children.pop() ?? { type: "symbol", value: "", roman: true } as MathNode;
    const script = previous.type === "script" ? previous : { type: "script", base: previous } as Extract<MathNode, { type: "script" }>;
    if (superscript) script.superscript = argument; else script.subscript = argument;
    children.push(script);
  }

  private makeRoman(node: MathNode) {
    if (node.type === "symbol") node.roman = true;
    else if (node.type === "sequence") node.children.forEach(child => this.makeRoman(child));
    else if (node.type === "script") { this.makeRoman(node.base); if (node.superscript) this.makeRoman(node.superscript); if (node.subscript) this.makeRoman(node.subscript); }
    else if (node.type === "fraction") { this.makeRoman(node.numerator); this.makeRoman(node.denominator); }
    else this.makeRoman(node.body);
  }
}

const superscript: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", n: "ⁿ", i: "ⁱ" };
const subscript: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎", a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ" };

function plain(node: MathNode): string {
  if (node.type === "symbol") return node.value;
  if (node.type === "sequence") return node.children.map(plain).join("");
  if (node.type === "sqrt") return `√(${plain(node.body)})`;
  if (node.type === "fraction") return `(${plain(node.numerator)})⁄(${plain(node.denominator)})`;
  const base = plain(node.base), sup = node.superscript ? scriptText(plain(node.superscript), superscript, "^") : "", sub = node.subscript ? scriptText(plain(node.subscript), subscript, "_") : "";
  return base + sup + sub;
}

function scriptText(value: string, map: Record<string, string>, fallback: string): string {
  return [...value].every(char => map[char]) ? [...value].map(char => map[char]).join("") : `${fallback}(${value})`;
}

export function latexToText(source: string): string {
  return plain(new Parser(source).parse()).replace(/\s+/g, " ").trim();
}

interface Box { width: number; ascent: number; descent: number; items: DrawItem[] }
type Measure = (text: string, size: number, italic: boolean) => number;

function shift(box: Box, x: number, baseline: number): DrawItem[] {
  return box.items.map(item => {
    const copy = { ...item } as DrawItem;
    if (copy.type === "text" || copy.type === "rect" || copy.type === "image") { copy.x += x; copy.y += baseline; }
    else { copy.x1 += x; copy.x2 += x; copy.y1 += baseline; copy.y2 += baseline; }
    return copy;
  });
}

function layoutNode(node: MathNode, size: number, family: string, measure: Measure): Box {
  if (node.type === "symbol") {
    const italic = !node.roman && /^[A-Za-zα-ωΑ-Ω]$/.test(node.value), width = measure(node.value, size, italic);
    const item: TextItem = { type: "text", x: 0, y: -0.82 * size, size, text: node.value, family, italic, color: [0.19, 0.21, 0.24] };
    return { width, ascent: 0.86 * size, descent: 0.28 * size, items: [item] };
  }
  if (node.type === "sequence") {
    let x = 0, ascent = 0, descent = 0; const items: DrawItem[] = [];
    for (const child of node.children) { const box = layoutNode(child, size, family, measure); items.push(...shift(box, x, 0)); x += box.width; ascent = Math.max(ascent, box.ascent); descent = Math.max(descent, box.descent); }
    return { width: x, ascent, descent, items };
  }
  if (node.type === "fraction") {
    const numerator = layoutNode(node.numerator, size * 0.78, family, measure), denominator = layoutNode(node.denominator, size * 0.78, family, measure);
    const pad = size * 0.2, gap = size * 0.16, width = Math.max(numerator.width, denominator.width) + 2 * pad;
    const numeratorBaseline = -gap - numerator.descent, denominatorBaseline = gap + denominator.ascent;
    return { width, ascent: -numeratorBaseline + numerator.ascent, descent: denominatorBaseline + denominator.descent,
      items: [...shift(numerator, (width - numerator.width) / 2, numeratorBaseline), { type: "line", x1: 0, y1: 0, x2: width, y2: 0, width: Math.max(0.65, size * 0.055), color: [0.19, 0.21, 0.24] }, ...shift(denominator, (width - denominator.width) / 2, denominatorBaseline)] };
  }
  if (node.type === "sqrt") {
    const body = layoutNode(node.body, size, family, measure), rootSize = Math.max(size, (body.ascent + body.descent) * 0.92), root = layoutNode({ type: "symbol", value: "√", roman: true }, rootSize, family, measure);
    const overlap = size * 0.08, x = Math.max(root.width - overlap, size * 0.55), top = -body.ascent - size * 0.08;
    return { width: x + body.width, ascent: Math.max(root.ascent, body.ascent + size * 0.08), descent: Math.max(root.descent, body.descent),
      items: [...shift(root, 0, 0), { type: "line", x1: x - size * 0.08, y1: top, x2: x + body.width, y2: top, width: Math.max(0.6, size * 0.05), color: [0.19, 0.21, 0.24] }, ...shift(body, x, 0)] };
  }
  const base = layoutNode(node.base, size, family, measure), scriptSize = size * 0.67;
  const sup = node.superscript ? layoutNode(node.superscript, scriptSize, family, measure) : undefined;
  const sub = node.subscript ? layoutNode(node.subscript, scriptSize, family, measure) : undefined;
  const scriptX = base.width + size * 0.04, supBaseline = sup ? -base.ascent + sup.ascent * 0.55 : 0, subBaseline = sub ? base.descent + sub.ascent * 0.72 : 0;
  return { width: scriptX + Math.max(sup?.width ?? 0, sub?.width ?? 0), ascent: Math.max(base.ascent, sup ? sup.ascent - supBaseline : 0), descent: Math.max(base.descent, sub ? subBaseline + sub.descent : 0),
    items: [...base.items, ...(sup ? shift(sup, scriptX, supBaseline) : []), ...(sub ? shift(sub, scriptX, subBaseline) : [])] };
}

export function typesetDisplayMath(source: string, size: number, family: string, measure: Measure): { width: number; height: number; items: DrawItem[] } {
  const box = layoutNode(new Parser(source).parse(), size, family, measure), pad = size * 0.3;
  return { width: box.width, height: box.ascent + box.descent + 2 * pad, items: shift(box, 0, box.ascent + pad) };
}
