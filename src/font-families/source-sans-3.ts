import regular from "../../fonts/source-sans-3/SourceSans3-Regular.ttf";
import italic from "../../fonts/source-sans-3/SourceSans3-Italic.ttf";
import bold from "../../fonts/source-sans-3/SourceSans3-Semibold.ttf";
import bolditalic from "../../fonts/source-sans-3/SourceSans3-SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadSourceSans3 = () => createFontFamily({ regular, italic, bold, bolditalic }, "source-sans-3");
