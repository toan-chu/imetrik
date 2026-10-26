const fs = require("fs");
const path = require("path");
const vm = require("vm");
const XLSX = require("../vendor/xlsx.full.min.js");

const root = path.resolve(__dirname, "..");
const workbookPath = path.join(root, "docs", "imetrik-full-function-test.xlsx");
if (!fs.existsSync(workbookPath)) throw new Error("Full-function workbook is missing from docs");

const workbook = XLSX.read(new Uint8Array(fs.readFileSync(workbookPath)), { type: "array", cellDates: true });
const expectedSheets = ["00_READ_ME", "Sales_Main", "Sales_Extra", "Large_2601", "Expected_Results"];
if (JSON.stringify(workbook.SheetNames) !== JSON.stringify(expectedSheets)) throw new Error("Unexpected workbook sheet roster");

const sandbox = {
  window: {
    APP_CONFIG: { FUZZY_MAX_EDITS: 2, UNION_THRESHOLD: 0.70, ANCHOR_MIN_COLS: 2 },
    IMK: {}
  },
  XLSX,
  Date,
  FileReader: function () {},
  DOMException,
  console
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "src", "data", "merge-engine.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "src", "data", "parser.js"), "utf8"), sandbox);

const parser = sandbox.window.IMK.Parser;
const mainPreview = parser.previewSheet(workbook, "Sales_Main", 30);
if (parser.suggestedHeaderRow(mainPreview) !== 3) throw new Error("Sales_Main header should be suggested at Excel row 4");

function parsedSheet(sheetName, headerRow) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: headerRow, defval: null, raw: true });
  return {
    name: `imetrik-full-function-test.xlsx / ${sheetName}`,
    rows,
    columns: parser.inferColumns(rows)
  };
}

const parsed = [parsedSheet("Sales_Main", 3), parsedSheet("Sales_Extra", 0), parsedSheet("Large_2601", 0)];
if (parsed[0].rows.length !== 72 || parsed[1].rows.length !== 16 || parsed[2].rows.length !== 2601) throw new Error("Workbook row counts drifted");

const typeByName = Object.fromEntries(parsed[0].columns.map((column) => [column.name, column.type]));
const expectedTypes = { OrderDate: "date", Country: "text", RevenueUSD: "number", OnTime: "boolean", OnTimeFlag: "number" };
Object.entries(expectedTypes).forEach(([name, type]) => {
  if (typeByName[name] !== type) throw new Error(`${name} inferred as ${typeByName[name]}, expected ${type}`);
});

const marginCell = workbook.Sheets.Sales_Main.N5;
if (marginCell.f !== "L5-M5" || marginCell.v !== 22880) throw new Error("Margin formula or cached result is invalid");

const bundle = sandbox.window.IMK.MergeEngine.merge(parsed);
const rowCounts = bundle.datasets.map((dataset) => dataset.rows.length).sort((a, b) => a - b);
if (JSON.stringify(rowCounts) !== JSON.stringify([88, 2601])) throw new Error("Workbook no longer produces the expected dataset groups");
if (!bundle.datasets.some((dataset) => dataset.rows.length === 88 && dataset.sources.length === 2)) throw new Error("Sales sheets no longer union into one two-source dataset");
if (!bundle.warnings.some((warning) => warning.kind === "missing-column") || !bundle.warnings.some((warning) => warning.kind === "blank")) throw new Error("Intentional data-quality warnings are missing");

const expectedSheet = workbook.Sheets.Expected_Results;
const expectedValues = { B7: 88, B10: 9138000, B11: 3123770, B12: 0, B18: 2, B19: 2601 };
Object.entries(expectedValues).forEach(([cell, value]) => {
  if (!expectedSheet[cell] || expectedSheet[cell].v !== value) throw new Error(`Expected result ${cell} drifted`);
});

const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
if (!readme.includes("docs/imetrik-full-function-test.xlsx") || !readme.includes("Tạo đủ 13 visual")) throw new Error("README full-function test guide is missing");

console.log("full-test-workbook-check passed");
