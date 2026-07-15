import regular from "../../fonts/fira-code/Regular.ttf";
import italic from "../../fonts/fira-code/Italic.ttf";
import bold from "../../fonts/fira-code/Semibold.ttf";
import bolditalic from "../../fonts/fira-code/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadFiraCode = () => createFontFamily({ regular, italic, bold, bolditalic }, "fira-code");
