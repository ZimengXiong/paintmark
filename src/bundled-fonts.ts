import sourceSansRegular from "../fonts/source-sans-3/SourceSans3-Regular.ttf";
import sourceSansItalic from "../fonts/source-sans-3/SourceSans3-Italic.ttf";
import sourceSansSemibold from "../fonts/source-sans-3/SourceSans3-Semibold.ttf";
import sourceSansSemiboldItalic from "../fonts/source-sans-3/SourceSans3-SemiboldItalic.ttf";
import sourceSerifRegular from "../fonts/source-serif-4/SourceSerif4-Regular.ttf";
import sourceSerifItalic from "../fonts/source-serif-4/SourceSerif4-Italic.ttf";
import sourceSerifSemibold from "../fonts/source-serif-4/SourceSerif4-Semibold.ttf";
import sourceSerifSemiboldItalic from "../fonts/source-serif-4/SourceSerif4-SemiboldItalic.ttf";
import firaRegular from "../fonts/fira-sans/Regular.ttf";
import firaItalic from "../fonts/fira-sans/Italic.ttf";
import firaSemibold from "../fonts/fira-sans/Semibold.ttf";
import firaSemiboldItalic from "../fonts/fira-sans/SemiboldItalic.ttf";
import atkinsonRegular from "../fonts/atkinson-hyperlegible/Regular.ttf";
import atkinsonItalic from "../fonts/atkinson-hyperlegible/Italic.ttf";
import atkinsonSemibold from "../fonts/atkinson-hyperlegible/Semibold.ttf";
import atkinsonSemiboldItalic from "../fonts/atkinson-hyperlegible/SemiboldItalic.ttf";
import alegreyaSansRegular from "../fonts/alegreya-sans/Regular.ttf";
import alegreyaSansItalic from "../fonts/alegreya-sans/Italic.ttf";
import alegreyaSansSemibold from "../fonts/alegreya-sans/Semibold.ttf";
import alegreyaSansSemiboldItalic from "../fonts/alegreya-sans/SemiboldItalic.ttf";
import plexSerifRegular from "../fonts/ibm-plex-serif/Regular.ttf";
import plexSerifItalic from "../fonts/ibm-plex-serif/Italic.ttf";
import plexSerifSemibold from "../fonts/ibm-plex-serif/Semibold.ttf";
import plexSerifSemiboldItalic from "../fonts/ibm-plex-serif/SemiboldItalic.ttf";
import spectralRegular from "../fonts/spectral/Regular.ttf";
import spectralItalic from "../fonts/spectral/Italic.ttf";
import spectralSemibold from "../fonts/spectral/Semibold.ttf";
import spectralSemiboldItalic from "../fonts/spectral/SemiboldItalic.ttf";
import crimsonRegular from "../fonts/crimson-text/Regular.ttf";
import crimsonItalic from "../fonts/crimson-text/Italic.ttf";
import crimsonSemibold from "../fonts/crimson-text/Semibold.ttf";
import crimsonSemiboldItalic from "../fonts/crimson-text/SemiboldItalic.ttf";
import gentiumRegular from "../fonts/gentium-book-plus/Regular.ttf";
import gentiumItalic from "../fonts/gentium-book-plus/Italic.ttf";
import gentiumSemibold from "../fonts/gentium-book-plus/Semibold.ttf";
import gentiumSemiboldItalic from "../fonts/gentium-book-plus/SemiboldItalic.ttf";
import { createFontFamily } from "./fonts.js";
import { loadInter } from "./inter.js";
import { loadSourceCodePro } from "./font-families/source-code-pro.js";
import { loadIbmPlexMono } from "./font-families/ibm-plex-mono.js";
import { loadSpaceMono } from "./font-families/space-mono.js";
import { loadDoto } from "./font-families/doto.js";
import { loadJetBrainsMono } from "./font-families/jetbrains-mono.js";
import { loadFiraCode } from "./font-families/fira-code.js";
import { loadRobotoMono } from "./font-families/roboto-mono.js";
import { loadGeistMono } from "./font-families/geist-mono.js";
import { loadCascadiaMono } from "./font-families/cascadia-mono.js";

/** Load the optional, PDF-embeddable font collection shipped with the package. */
export function loadBundledFonts() {
  const inter = loadInter();
  const sourceSans = createFontFamily({
    regular: sourceSansRegular,
    italic: sourceSansItalic,
    bold: sourceSansSemibold,
    bolditalic: sourceSansSemiboldItalic,
  }, "source-sans-3");
  const sourceSerif = createFontFamily({
    regular: sourceSerifRegular,
    italic: sourceSerifItalic,
    bold: sourceSerifSemibold,
    bolditalic: sourceSerifSemiboldItalic,
  }, "source-serif-4");
  const complete = (regular: Uint8Array, italic: Uint8Array, bold: Uint8Array, bolditalic: Uint8Array, id: string) =>
    createFontFamily({ regular, italic, bold, bolditalic }, id);
  const firaSans = complete(firaRegular, firaItalic, firaSemibold, firaSemiboldItalic, "fira-sans");
  const atkinsonHyperlegible = complete(atkinsonRegular, atkinsonItalic, atkinsonSemibold, atkinsonSemiboldItalic, "atkinson-hyperlegible");
  const alegreyaSans = complete(alegreyaSansRegular, alegreyaSansItalic, alegreyaSansSemibold, alegreyaSansSemiboldItalic, "alegreya-sans");
  const ibmPlexSerif = complete(plexSerifRegular, plexSerifItalic, plexSerifSemibold, plexSerifSemiboldItalic, "ibm-plex-serif");
  const spectral = complete(spectralRegular, spectralItalic, spectralSemibold, spectralSemiboldItalic, "spectral");
  const crimsonText = complete(crimsonRegular, crimsonItalic, crimsonSemibold, crimsonSemiboldItalic, "crimson-text");
  const gentiumBookPlus = complete(gentiumRegular, gentiumItalic, gentiumSemibold, gentiumSemiboldItalic, "gentium-book-plus");
  const sourceCodePro = loadSourceCodePro(), ibmPlexMono = loadIbmPlexMono(), spaceMono = loadSpaceMono(), doto = loadDoto();
  const jetBrainsMono = loadJetBrainsMono(), firaCode = loadFiraCode(), robotoMono = loadRobotoMono();
  const geistMono = loadGeistMono(), cascadiaMono = loadCascadiaMono();
  const all = [inter.body, inter.display, sourceSans, firaSans, atkinsonHyperlegible, alegreyaSans,
    sourceSerif, ibmPlexSerif, spectral, crimsonText, gentiumBookPlus, sourceCodePro, ibmPlexMono, spaceMono,
    jetBrainsMono, firaCode, robotoMono, geistMono, cascadiaMono, doto];
  return {
    inter: inter.body,
    interDisplay: inter.display,
    sourceSans,
    sourceSerif,
    firaSans,
    atkinsonHyperlegible,
    alegreyaSans,
    ibmPlexSerif,
    spectral,
    crimsonText,
    gentiumBookPlus,
    sourceCodePro,
    ibmPlexMono,
    spaceMono,
    jetBrainsMono,
    firaCode,
    robotoMono,
    geistMono,
    cascadiaMono,
    doto,
    all,
  };
}
