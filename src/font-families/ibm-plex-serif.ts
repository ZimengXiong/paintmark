import regular from "../../fonts/ibm-plex-serif/Regular.ttf";
import italic from "../../fonts/ibm-plex-serif/Italic.ttf";
import bold from "../../fonts/ibm-plex-serif/Semibold.ttf";
import bolditalic from "../../fonts/ibm-plex-serif/SemiboldItalic.ttf";
import { createFontFamily } from "../fonts.js";

export const loadIbmPlexSerif = () => createFontFamily({ regular, italic, bold, bolditalic }, "ibm-plex-serif");
