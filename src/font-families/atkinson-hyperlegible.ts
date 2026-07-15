import regular from "../../fonts/atkinson-hyperlegible/Regular.ttf";
import italic from "../../fonts/atkinson-hyperlegible/Italic.ttf";
import bold from "../../fonts/atkinson-hyperlegible/Semibold.ttf";
import bolditalic from "../../fonts/atkinson-hyperlegible/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadAtkinsonHyperlegible = () => createFontFamily({ regular, italic, bold, bolditalic }, "atkinson-hyperlegible");
