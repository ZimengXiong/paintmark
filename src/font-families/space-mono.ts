import regular from "../../fonts/space-mono/Regular.ttf";
import italic from "../../fonts/space-mono/Italic.ttf";
import bold from "../../fonts/space-mono/Semibold.ttf";
import bolditalic from "../../fonts/space-mono/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadSpaceMono = () => createFontFamily({ regular, italic, bold, bolditalic }, "space-mono");
