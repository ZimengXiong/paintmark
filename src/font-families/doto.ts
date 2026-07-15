import regular from "../../fonts/doto/Regular.ttf";
import { createFontFamily } from "../fonts.js";

/** Doto intentionally uses one decorative dotted design for every emphasis slot. */
export const loadDoto = () => createFontFamily({ regular, bold: regular, italic: regular, bolditalic: regular }, "doto");
