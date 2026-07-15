import regular from "../../fonts/roboto-mono/Regular.ttf";
import italic from "../../fonts/roboto-mono/Italic.ttf";
import bold from "../../fonts/roboto-mono/Semibold.ttf";
import bolditalic from "../../fonts/roboto-mono/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadRobotoMono = () => createFontFamily({ regular, italic, bold, bolditalic }, "roboto-mono");
