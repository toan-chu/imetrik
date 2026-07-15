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
for (const file of ["config.js", "src/i18n/strings.js", "src/i18n/format.js", "src/data/merge-engine.js", "src/model/measures.js"]) {
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

console.log("smoke-check passed");
