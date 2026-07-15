import regular from "../../fonts/cascadia-mono/Regular.ttf";
import italic from "../../fonts/cascadia-mono/Italic.ttf";
import bold from "../../fonts/cascadia-mono/Semibold.ttf";
import bolditalic from "../../fonts/cascadia-mono/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadCascadiaMono = () => createFontFamily({ regular, italic, bold, bolditalic }, "cascadia-mono");
