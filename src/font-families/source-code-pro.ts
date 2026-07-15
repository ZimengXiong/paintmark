import regular from "../../fonts/source-code-pro/Regular.ttf";
import italic from "../../fonts/source-code-pro/Italic.ttf";
import bold from "../../fonts/source-code-pro/Semibold.ttf";
import bolditalic from "../../fonts/source-code-pro/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadSourceCodePro = () => createFontFamily({ regular, italic, bold, bolditalic }, "source-code-pro");
