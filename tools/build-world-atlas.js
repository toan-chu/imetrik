"use strict";

const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  throw new Error("Usage: node tools/build-world-atlas.js <countries-110m.json> <output.js>");
}

const topology = JSON.parse(fs.readFileSync(inputPath, "utf8"));
if (!topology.objects || !topology.objects.countries) {
  throw new Error("Input does not contain a countries topology.");
}

const banner = [
  "/* world-atlas 2.0.2 countries-110m.json",
  " * Derived from Natural Earth Admin 0 boundaries.",
  " * Source: https://github.com/topojson/world-atlas",
  " * License: ISC; see LICENSE-world-atlas.txt.",
  " */",
  ""
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, banner + "window.IMK_WORLD_ATLAS = " + JSON.stringify(topology) + ";\n", "utf8");

