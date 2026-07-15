import regular from "../../fonts/jetbrains-mono/Regular.ttf";
import italic from "../../fonts/jetbrains-mono/Italic.ttf";
import bold from "../../fonts/jetbrains-mono/Semibold.ttf";
import bolditalic from "../../fonts/jetbrains-mono/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadJetBrainsMono = () => createFontFamily({ regular, italic, bold, bolditalic }, "jetbrains-mono");
