import regular from "../../fonts/geist-mono/Regular.ttf";
import italic from "../../fonts/geist-mono/Italic.ttf";
import bold from "../../fonts/geist-mono/Semibold.ttf";
import bolditalic from "../../fonts/geist-mono/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadGeistMono = () => createFontFamily({ regular, italic, bold, bolditalic }, "geist-mono");
