import regular from "../../fonts/alegreya-sans/Regular.ttf";
import italic from "../../fonts/alegreya-sans/Italic.ttf";
import bold from "../../fonts/alegreya-sans/Semibold.ttf";
import bolditalic from "../../fonts/alegreya-sans/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadAlegreyaSans = () => createFontFamily({ regular, italic, bold, bolditalic }, "alegreya-sans");
