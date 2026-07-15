import regular from "../../fonts/fira-sans/Regular.ttf";
import italic from "../../fonts/fira-sans/Italic.ttf";
import bold from "../../fonts/fira-sans/Semibold.ttf";
import bolditalic from "../../fonts/fira-sans/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadFiraSans = () => createFontFamily({ regular, italic, bold, bolditalic }, "fira-sans");
