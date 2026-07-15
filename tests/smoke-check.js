const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const activeFiles = [
  "index.html",
  "config.js",
  "src/i18n/strings.js",
  "src/i18n/format.js",
  "src/data/merge-engine.js",
  "src/model/measures.js",
  "src/model/dataset-store.js",
  "src/query/query-engine.js"
  ,"src/view/icons.js"
  ,"src/view/pages.js"
  ,"src/view/tile.js"
  ,"src/view/charts.js"
  ,"src/view/present.js"
  ,"src/view/export.js"
];

for (const file of activeFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/Trustana|pptxgen|PptxGenJS|MODES/.test(text)) {
    throw new Error(`Legacy token found in ${file}`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (html.includes('type="module"')) throw new Error("ES modules are not allowed for file://");
if (!html.includes("vendor/gridstack/gridstack-all.js")) throw new Error("Gridstack is not vendored");
if (!html.includes("vendor/lucide/lucide.min.js")) throw new Error("Lucide is not vendored");
if (!/<div class="board-toolbar">[\s\S]*id="btnAddVisual"[\s\S]*<div id="pageCanvas"/.test(html)) {
  throw new Error("Add visual must be outside the Gridstack canvas");
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = match[1];
  if (/^(https?:|data:|#)/.test(ref)) continue;
  if (!fs.existsSync(path.join(root, ref))) throw new Error(`Missing asset referenced by index.html: ${ref}`);
}

const sandbox = {
  window: {},
  document: {
    documentElement: { lang: "vi" }
  },
  console
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
for (const file of ["config.js", "src/i18n/strings.js", "src/i18n/format.js", "src/data/merge-engine.js", "src/model/measures.js", "src/model/dataset-store.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
}

const IMK = sandbox.window.IMK;
const bundle = IMK.MergeEngine.merge([
  {
    name: "A.xlsx",
    columns: [
      { name: "Phòng ban", normalizedName: IMK.MergeEngine.normalizeText("Phòng ban"), type: "text", role: "dimension" },
      { name: "Lương", normalizedName: IMK.MergeEngine.normalizeText("Lương"), type: "number", role: "measure" }
    ],
    rows: [{ "Phòng ban": "Sales", "Lương": 100 }]
  },
  {
    name: "B.xlsx",
    columns: [
      { name: "Phong bann", normalizedName: IMK.MergeEngine.normalizeText("Phong bann"), type: "text", role: "dimension" },
      { name: "Luong", normalizedName: IMK.MergeEngine.normalizeText("Luong"), type: "number", role: "measure" }
    ],
    rows: [{ "Phong bann": "Ops", "Luong": 200 }]
  }
]);
if (bundle.datasets.length !== 1) throw new Error("Fuzzy union failed");
if (IMK.Measures.aggregate(bundle.datasets[0].rows, "Lương", "sum") !== 300) throw new Error("SUM aggregate failed");

const firstPageId = IMK.Store.activePage().id;
const secondPage = IMK.Store.addPage();
if (IMK.Store.state.pages.length !== 2 || IMK.Store.state.activePageId !== secondPage.id) throw new Error("Add page failed");
if (!IMK.Store.removePage(secondPage.id) || IMK.Store.state.activePageId !== firstPageId) throw new Error("Delete page did not select its neighbor");
if (IMK.Store.removePage(firstPageId) !== false || IMK.Store.state.pages.length !== 1) throw new Error("Last page must not be deleted");

const configText = fs.readFileSync(path.join(root, "config.js"), "utf8");
if (!configText.includes('LOGO: "assets/logo-iMetriK.png"')) throw new Error("Supplied PNG logo is not active");
if (!configText.includes('COLOR_PRIMARY: "#303841"') || !configText.includes('COLOR_ACCENT: "#FF5722"')) throw new Error("Day palette is not charcoal and orange");
if (!configText.includes("VISUAL_PALETTES") || !configText.includes('dark: ["#FF5722", "#F5F5F5"')) throw new Error("Adaptive day/night visual palettes are missing");
if (!configText.includes('FONT_DISPLAY: "\'Quicksand\'"') || !configText.includes('FONT_MONO: "\'Montserrat\'"')) throw new Error("Requested fonts are not configured");
const css = fs.readFileSync(path.join(root, "src/view/styles.css"), "utf8");
for (const fontFile of [
  "quicksand-latin-400-normal.woff2",
  "quicksand-vietnamese-700-normal.woff2",
  "montserrat-latin-400-normal.woff2",
  "montserrat-vietnamese-700-normal.woff2"
]) {
  if (!css.includes(fontFile) || !fs.existsSync(path.join(root, "fonts", fontFile))) throw new Error(`Font asset is missing: ${fontFile}`);
}
if (!css.includes(".page-tabs .page-actions .icon-btn{width:32px;height:34px;min-height:34px") || !css.includes("border:0;border-radius:8px;background:transparent")) throw new Error("Flat page action controls are missing");
if (!html.includes('id="btnImport" class="btn accent"')) throw new Error("Import action must use the orange accent");
if (!css.includes(".drag-handle")) throw new Error("Dedicated tile drag handle is missing");
const exportText = fs.readFileSync(path.join(root, "src/view/export.js"), "utf8");
if (!exportText.includes('format: "a4"') || !exportText.includes("nextBreak")) throw new Error("Paginated A4 PDF export is missing");
if (!exportText.includes('pdf.output("blob")') || !exportText.includes("downloadBlob")) throw new Error("Reliable Blob PDF download is missing");
if (!html.includes("assets/logo-iMetriK-data.js") || !fs.existsSync(path.join(root, "assets/logo-iMetriK-data.js"))) throw new Error("Offline-safe embedded export logo is missing");
if (!exportText.includes('"header-" + physicalPageNumber')) throw new Error("Multi-page PDF headers must use unique image aliases");
const layoutText = fs.readFileSync(path.join(root, "src/view/layout.js"), "utf8");
const tileText = fs.readFileSync(path.join(root, "src/view/tile.js"), "utf8");
const mainText = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const chartText = fs.readFileSync(path.join(root, "src/view/charts.js"), "utf8");
const presentText = fs.readFileSync(path.join(root, "src/view/present.js"), "utf8");
if (layoutText.indexOf('innerHTML = ""') > layoutText.indexOf("GridStack.init")) throw new Error("Grid canvas must be cleared before Gridstack init");
if (tileText.includes('canvas.innerHTML = ""')) throw new Error("Tile rendering must not clear an initialized Gridstack canvas");
if (!layoutText.includes("breakpoints") || !layoutText.includes("grid.getColumn() !== 12")) throw new Error("Mobile Gridstack layout guard is missing");
if (!layoutText.includes('window.addEventListener("resize"') || !layoutText.includes("nextMobileViewport")) throw new Error("Responsive Gridstack rebuild is missing");
if (!tileText.includes("mobileY") || !tileText.includes("grid.getColumn() === 1")) throw new Error("Mobile tile stacking is missing");
if (!html.includes('id="visualDialog"') || !tileText.includes("openCreator") || !tileText.includes("palette-picker")) throw new Error("Visual type and palette gallery is missing");
if (/btnAddVisual[^\n]+addTile/.test(mainText) || !mainText.includes("IMK.Tiles.openCreator()")) throw new Error("Add visual must open the gallery without immediately creating a tile");
if (!chartText.includes('IMK.Store.state.theme === "dark"') || !chartText.includes("tile.palette")) throw new Error("Charts do not switch palette by theme and visual");
if (!presentText.includes('addEventListener("fullscreenchange"') || !css.includes("overflow-y:auto;overscroll-behavior:contain")) throw new Error("Present fullscreen exit or scrolling regression");
if (!mainText.includes("IMK.isAbortError") || !mainText.includes('IMK.i18n.t("folderCancelled")')) throw new Error("Folder cancellation is not localized");
if (!fs.readFileSync(path.join(root, "src/view/slicers.js"), "utf8").includes("slicerOpen")) throw new Error("Slicer open state persistence is missing");
if (!mainText.includes("item.draggable = true") || !tileText.includes("useField")) throw new Error("Fields interaction is missing");
if (!configText.includes("ocean:") || !configText.includes("spectrum:")) throw new Error("Expanded chart palettes are missing");
const scannerText = fs.readFileSync(path.join(root, "src/data/folder-scanner.js"), "utf8");
if (scannerText.includes("if (await restoreSaved(onFiles, true)) return true;")) throw new Error("Folder chooser must allow selecting a different folder");
if (!scannerText.includes("lastSeen = {};")) throw new Error("Folder switch must reset last-seen file state");
for (const fixture of ["sample-data/demo-sales-north.xlsx", "sample-data/demo-sales-south.xlsx"]) {
  if (!fs.existsSync(path.join(root, fixture))) throw new Error(`Synthetic sample fixture is missing: ${fixture}`);
}

console.log("smoke-check passed");
