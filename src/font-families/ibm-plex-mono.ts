import regular from "../../fonts/ibm-plex-mono/Regular.ttf";
import italic from "../../fonts/ibm-plex-mono/Italic.ttf";
import bold from "../../fonts/ibm-plex-mono/Semibold.ttf";
import bolditalic from "../../fonts/ibm-plex-mono/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadIbmPlexMono = () => createFontFamily({ regular, italic, bold, bolditalic }, "ibm-plex-mono");
