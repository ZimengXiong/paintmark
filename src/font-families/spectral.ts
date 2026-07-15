import regular from "../../fonts/spectral/Regular.ttf";
import italic from "../../fonts/spectral/Italic.ttf";
import bold from "../../fonts/spectral/Semibold.ttf";
import bolditalic from "../../fonts/spectral/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadSpectral = () => createFontFamily({ regular, italic, bold, bolditalic }, "spectral");
