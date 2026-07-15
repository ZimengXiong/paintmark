import regular from "../../fonts/crimson-text/Regular.ttf";
import italic from "../../fonts/crimson-text/Italic.ttf";
import bold from "../../fonts/crimson-text/Semibold.ttf";
import bolditalic from "../../fonts/crimson-text/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadCrimsonText = () => createFontFamily({ regular, italic, bold, bolditalic }, "crimson-text");
