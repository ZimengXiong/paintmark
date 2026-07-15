import regular from "../../fonts/source-serif-4/SourceSerif4-Regular.ttf";
import italic from "../../fonts/source-serif-4/SourceSerif4-Italic.ttf";
import bold from "../../fonts/source-serif-4/SourceSerif4-Semibold.ttf";
import bolditalic from "../../fonts/source-serif-4/SourceSerif4-SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadSourceSerif4 = () => createFontFamily({ regular, italic, bold, bolditalic }, "source-serif-4");
