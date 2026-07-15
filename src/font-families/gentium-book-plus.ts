import regular from "../../fonts/gentium-book-plus/Regular.ttf";
import italic from "../../fonts/gentium-book-plus/Italic.ttf";
import bold from "../../fonts/gentium-book-plus/Semibold.ttf";
import bolditalic from "../../fonts/gentium-book-plus/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadGentiumBookPlus = () => createFontFamily({ regular, italic, bold, bolditalic }, "gentium-book-plus");
