import type { Color } from "./types.js";

export type CodeToken = "plain" | "comment" | "string" | "keyword" | "number" | "function" | "type" | "variable";
export interface CodeRun { text: string; token: CodeToken }

export const CODE_COLORS: Record<CodeToken, Color> = {
  plain: [0.19, 0.21, 0.24], comment: [0.43, 0.47, 0.51], string: [0.04, 0.19, 0.41],
  keyword: [0.81, 0.13, 0.18], number: [0.02, 0.31, 0.68], function: [0.51, 0.31, 0.87],
  type: [0.58, 0.22, 0], variable: [0.07, 0.39, 0.31],
};

const keywordText: Record<string, string> = {
  js: "as async await break case catch class const continue debugger default delete do else export extends false finally for from function get if import in instanceof let new null of return set static super switch this throw true try typeof undefined var void while with yield",
  py: "and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield",
  sh: "case do done elif else esac export fi for function if in local readonly return set shift then trap unset until while",
  css: "important inherit initial none revert unset var calc auto block flex grid inline relative absolute fixed sticky",
  sql: "alter and as asc begin between by case create delete desc distinct drop else end exists from group having in index insert into is join like limit not null on or order outer primary references select set table union unique update values view when where",
};
const keywords = Object.fromEntries(Object.entries(keywordText).map(([lang, text]) => [lang, new Set(text.split(" "))]));

export function normalizeLanguage(language = ""): string {
  const lang = language.toLowerCase();
  if (["javascript", "jsx", "typescript", "tsx", "node", "mjs", "cjs"].includes(lang)) return "js";
  if (["python", "py3"].includes(lang)) return "py";
  if (["bash", "shell", "zsh", "fish", "console"].includes(lang)) return "sh";
  if (["scss", "sass", "less"].includes(lang)) return "css";
  if (["c++", "cc", "cxx"].includes(lang)) return "cpp";
  if (["c#", "cs"].includes(lang)) return "csharp";
  if (["htm", "xhtml", "xml", "svg"].includes(lang)) return "html";
  return lang;
}

export function highlightCodeLine(line: string, language = ""): CodeRun[] {
  const lang = normalizeLanguage(language);
  const output: CodeRun[] = [];
  const push = (text: string, token: CodeToken = "plain") => {
    if (!text) return;
    const last = output.at(-1);
    if (last?.token === token) last.text += text;
    else output.push({ text, token });
  };
  let index = 0;
  while (index < line.length) {
    if (lang === "html" && line.startsWith("<!--", index)) {
      const end = line.indexOf("-->", index + 4);
      push(line.slice(index, end < 0 ? line.length : end + 3), "comment");
      index = end < 0 ? line.length : end + 3; continue;
    }
    if ((["js", "css", "java", "c", "cpp", "csharp", "go", "rust", "swift", "kotlin"].includes(lang) && line.startsWith("//", index)) ||
        (["py", "sh", "ruby", "yaml", "yml", "toml"].includes(lang) && line[index] === "#")) {
      push(line.slice(index), "comment"); break;
    }
    if (line.startsWith("/*", index)) {
      const end = line.indexOf("*/", index + 2);
      push(line.slice(index, end < 0 ? line.length : end + 2), "comment");
      index = end < 0 ? line.length : end + 2; continue;
    }
    const char = line[index]!;
    if (char === '"' || char === "'" || char === "`") {
      let end = index + 1;
      while (end < line.length) {
        if (line[end] === "\\") { end += 2; continue; }
        if (line[end] === char) { end++; break; }
        end++;
      }
      push(line.slice(index, end), lang === "json" && /^\s*:/.test(line.slice(end)) ? "variable" : "string");
      index = end; continue;
    }
    const number = /^(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i.exec(line.slice(index));
    if (number) { push(number[0], "number"); index += number[0].length; continue; }
    const variable = lang === "sh" ? /^\$\{?[A-Za-z_][\w]*\}?/.exec(line.slice(index)) : null;
    if (variable) { push(variable[0], "variable"); index += variable[0].length; continue; }
    const identifier = /^[A-Za-z_$][\w$-]*/.exec(line.slice(index));
    if (identifier) {
      const word = identifier[0];
      const rest = line.slice(index + word.length);
      let token: CodeToken = keywords[lang]?.has(word) ? "keyword" : "plain";
      if (/^\s*\(/.test(rest)) token = "function";
      if (/^[A-Z]/.test(word) && token === "plain") token = "type";
      if (["json", "yaml", "yml", "css"].includes(lang) && /^\s*:/.test(rest)) token = "variable";
      if (lang === "html" && /<\/?\s*$/.test(line.slice(0, index))) token = "keyword";
      else if (lang === "html" && /^\s*=/.test(rest)) token = "variable";
      push(word, token); index += word.length; continue;
    }
    push(char); index++;
  }
  return output.length ? output : [{ text: " ", token: "plain" }];
}
