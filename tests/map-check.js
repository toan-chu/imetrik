const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const features = [
  { id: "840", properties: { name: "United States of America" } },
  { id: "704", properties: { name: "Vietnam" } },
  { id: "250", properties: { name: "France" } }
];

const IMK = {
  i18n: {
    t: (key) => ({ blank: "(blank)", countRows: "Row count" }[key] || key),
    number: (value) => String(value),
    percent: (value) => `${value}%`,
    money: (value) => `$${value}`
  },
  Query: { filteredRows: (dataset) => dataset.rows },
  Measures: {
    aggregate(rows, measure, agg) {
      if (agg === "count") return rows.length;
      return rows.reduce((total, row) => total + Number(row[measure] || 0), 0);
    }
  },
  escape: (value) => String(value)
};

const sandbox = {
  window: {
    IMK,
    ChartGeo: { topojson: { feature: () => ({ features }) } },
    IMK_WORLD_ATLAS: { objects: { countries: {} } }
  },
  console
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "src/view/map.js"), "utf8"), sandbox, { filename: "src/view/map.js" });

const dataset = {
  rows: [
    { Country: "USA", Revenue: 10 },
    { Country: "United States", Revenue: 15 },
    { Country: "Việt Nam", Revenue: 20 },
    { Country: "Atlantis", Revenue: 5 },
    { Country: "", Revenue: 7 }
  ]
};
const tile = { dim: "Country", measure: "Revenue", agg: "sum" };
const prepared = sandbox.window.IMK.Map.prepare(dataset, tile);

if (prepared.matched.length !== 2) throw new Error(`Expected 2 matched regions, got ${prepared.matched.length}`);
if (prepared.unmatched.length !== 2) throw new Error(`Expected 2 unmatched labels, got ${prepared.unmatched.length}`);
const usa = prepared.data.find((item) => item.feature.id === "840");
const vietnam = prepared.data.find((item) => item.feature.id === "704");
if (!usa || usa.value !== 25) throw new Error("Country aliases were not aggregated into the United States feature");
if (!vietnam || vietnam.value !== 20) throw new Error("Accent-insensitive Vietnam matching failed");
if (sandbox.window.IMK.Map.resolve("704").id !== "704") throw new Error("Numeric ISO country matching failed");
if (!prepared.unmatched.some((item) => item.label === "Atlantis")) throw new Error("Unknown geography was silently dropped");

console.log("map-check passed");

