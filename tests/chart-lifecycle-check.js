const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
let createCount = 0;
let destroyCount = 0;
let reduceMotion = false;

function element(tagName) {
  return {
    tagName,
    children: [],
    parentNode: null,
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    appendChild(child) { child.parentNode = this; this.children.push(child); },
    removeChild(child) { this.children = this.children.filter((item) => item !== child); child.parentNode = null; }
  };
}

function Chart(canvas, config) {
  createCount += 1;
  this.canvas = canvas;
  this.config = { type: config.type, data: config.data, options: config.options };
  this.data = config.data;
  this.options = config.options;
  this.updateModes = [];
}
Chart.defaults = { font: {} };
Chart.prototype.destroy = function () { destroyCount += 1; };
Chart.prototype.resize = function () { this.resizeCount = (this.resizeCount || 0) + 1; };
Chart.prototype.update = function (mode) { this.updateModes.push(mode || "animated"); };

const body = { classList: { contains: () => false } };
const sandbox = {
  window: {
    APP_CONFIG: {
      ANIM_MAX_POINTS: 10,
      VISUAL_PALETTES: { auto: { light: ["#277DA1"], dark: ["#7DD3FC"] } }
    },
    IMK: {
      Store: { state: { theme: "light", highlight: null } },
      Query: { summarize: () => ({ labels: ["A", "B"], datasets: [{ label: "Revenue", data: [10, 20] }] }) },
      i18n: { t: (key) => key, number: (value) => String(value), percent: (value) => String(value), money: (value) => String(value) },
      escape: (value) => String(value),
      renderAll: () => {}
    },
    matchMedia: () => ({ matches: reduceMotion })
  },
  document: { body, createElement: element },
  getComputedStyle: () => ({ getPropertyValue: () => "#667176" }),
  Chart,
  console
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "src/view/charts.js"), "utf8"), sandbox, { filename: "src/view/charts.js" });

const el = element("div");
Object.defineProperty(el, "innerHTML", {
  get() { return ""; },
  set() { this.children.forEach((child) => { child.parentNode = null; }); this.children = []; }
});
const tile = { id: "tile_reuse", type: "bar", palette: "auto", dim: "Country", measure: "Revenue", agg: "sum" };
const dataset = { rows: [] };

sandbox.window.IMK.Charts.render(el, dataset, tile);
const first = sandbox.window.IMK.Charts.instances[tile.id];
const firstCanvas = first.canvas;
const firstMount = firstCanvas.$imkMount;
sandbox.window.IMK.Charts.detachAll();
sandbox.window.IMK.Charts.render(el, dataset, tile);

if (createCount !== 1) throw new Error(`Compatible rerender created ${createCount} Chart instances`);
if (destroyCount !== 0) throw new Error("Compatible rerender destroyed the existing Chart instance");
if (sandbox.window.IMK.Charts.instances[tile.id] !== first || first.canvas !== firstCanvas) throw new Error("Chart instance or canvas was not preserved");
if (!firstMount || firstCanvas.$imkMount !== firstMount || firstMount.parentNode !== el) throw new Error("Stable chart mount was not preserved across the dashboard rebuild");
if (!first.resizeCount) throw new Error("Retained chart was not resized after its mount moved");
if (first.updateModes[0] !== "animated") throw new Error("Normal in-place update did not animate");

reduceMotion = true;
sandbox.window.IMK.Charts.detachAll();
sandbox.window.IMK.Charts.render(el, dataset, tile);
if (first.updateModes[1] !== "none") throw new Error("Reduced-motion rerender did not disable animation");

console.log("chart-lifecycle-check passed");
