import regular from "../fonts/Inter-Regular.ttf";
import bold from "../fonts/Inter-SemiBold.ttf";
import italic from "../fonts/Inter-Italic.ttf";
import bolditalic from "../fonts/Inter-SemiBoldItalic.ttf";
import displayRegular from "../fonts/InterDisplay-Regular.ttf";
import displayBold from "../fonts/InterDisplay-SemiBold.ttf";
import displayItalic from "../fonts/InterDisplay-Italic.ttf";
import displayBoldItalic from "../fonts/InterDisplay-SemiBoldItalic.ttf";
import { createFontFamily } from "./fonts.js";

export function loadInter() {
  return {
    body: createFontFamily({ regular, bold, italic, bolditalic }, "inter"),
    display: createFontFamily({ regular: displayRegular, bold: displayBold, italic: displayItalic, bolditalic: displayBoldItalic }, "inter-display"),
  };
}
