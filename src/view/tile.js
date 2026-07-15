(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  var types = [
    ["bar", "Column"], ["hbar", "Bar"], ["sbar", "Stacked"], ["line", "Line"], ["area", "Area"], ["donut", "Donut"],
    ["scatter", "Scatter"], ["table", "Table"], ["matrix", "Matrix"], ["kpi", "KPI"], ["combo", "Combo"], ["text", "Text"]
  ];

  function newTile(type) {
    var dataset = IMK.Store.activeDataset();
    var cols = dataset ? dataset.columns : [];
    var dim = (cols.find(function (c) { return c.role === "dimension"; }) || cols[0] || {}).name || "";
    var measure = (cols.find(function (c) { return c.role === "measure"; }) || cols[0] || {}).name || "";
    return {
      id: "tile_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      type: type || "bar",
      title: "New visual",
      dim: dim,
      dim2: dim,
      measure: measure,
      agg: measure ? "sum" : "count",
      series: "",
      topN: 10,
      granularity: "month",
      text: "Double-click to write an insight.",
      layout: { x: 0, y: 0, w: 6, h: type === "kpi" ? 2 : 4 }
    };
  }

  function renderTiles() {
    var page = IMK.Store.activePage();
    var canvas = document.getElementById("pageCanvas");
    var grid = IMK.Layout.init();
    canvas.innerHTML = "";
    page.tiles.forEach(function (tile) {
      var item = document.createElement("div");
      item.className = "grid-stack-item";
      item.dataset.tileId = tile.id;
      item.setAttribute("gs-x", tile.layout.x);
      item.setAttribute("gs-y", tile.layout.y);
      item.setAttribute("gs-w", tile.layout.w);
      item.setAttribute("gs-h", tile.layout.h);
      item.innerHTML = "<div class='grid-stack-item-content tile'><div class='tile-header'><input value='" + IMK.escape(tile.title || "") + "'><span><button class='icon-btn edit'>⚙</button><button class='icon-btn dup'>⧉</button><button class='icon-btn del'>×</button></span></div><div class='tile-body'></div></div>";
      item.querySelector(".tile-header input").onchange = function (event) { tile.title = event.target.value; };
      item.querySelector(".edit").onclick = function () { openInspector(tile); };
      item.querySelector(".dup").onclick = function () { duplicate(tile); };
      item.querySelector(".del").onclick = function () {
        page.tiles = page.tiles.filter(function (t) { return t.id !== tile.id; });
        IMK.renderAll();
      };
      canvas.appendChild(item);
      grid.makeWidget(item);
      IMK.Charts.render(item.querySelector(".tile-body"), IMK.Store.activeDataset(), tile);
    });
    var add = document.createElement("button");
    add.className = "add-tile";
    add.textContent = "+ Add visual";
    add.onclick = function () {
      IMK.Store.addTile(newTile("bar"));
      IMK.renderAll();
    };
    canvas.appendChild(add);
  }

  function duplicate(tile) {
    var copy = JSON.parse(JSON.stringify(tile));
    copy.id = "tile_" + Date.now();
    copy.title = copy.title + " copy";
    copy.layout = { x: 0, y: 0, w: tile.layout.w, h: tile.layout.h };
    IMK.Store.addTile(copy);
    IMK.renderAll();
  }

  function optionList(cols, selected, allowBlank) {
    var html = allowBlank ? "<option value=''>None</option>" : "";
    return html + cols.map(function (c) { return "<option value='" + IMK.escape(c.name) + "' " + (c.name === selected ? "selected" : "") + ">" + IMK.escape(c.name) + "</option>"; }).join("");
  }

  function openInspector(tile) {
    var dataset = IMK.Store.activeDataset();
    if (!dataset) return;
    var cols = dataset.columns;
    var dims = cols.filter(function (c) { return c.role === "dimension"; });
    var nums = cols.filter(function (c) { return c.role === "measure"; });
    var inspector = document.getElementById("inspector");
    inspector.hidden = false;
    inspector.innerHTML = "<div class='inspector-head'><h2>Visual</h2><button class='icon-btn close'>×</button></div>" +
      "<label>Type<select id='inType'>" + types.map(function (t) { return "<option value='" + t[0] + "' " + (tile.type === t[0] ? "selected" : "") + ">" + t[1] + "</option>"; }).join("") + "</select></label>" +
      "<label>Title<input id='inTitle' value='" + IMK.escape(tile.title || "") + "'></label>" +
      "<label>X / Row<select id='inDim'>" + optionList(cols, tile.dim) + "</select></label>" +
      "<label>Column / Matrix<select id='inDim2'>" + optionList(dims, tile.dim2) + "</select></label>" +
      "<label>Measure<select id='inMeasure'>" + optionList(nums.concat(cols.filter(function (c) { return c.role !== "measure"; })), tile.measure, true) + "</select></label>" +
      "<label>Aggregate<select id='inAgg'><option value='sum'>SUM</option><option value='avg'>AVG</option><option value='count'>COUNT</option><option value='countd'>DISTINCT</option><option value='min'>MIN</option><option value='max'>MAX</option><option value='pct'>% Yes</option></select></label>" +
      "<label>Series<select id='inSeries'>" + optionList(dims, tile.series, true) + "</select></label>" +
      "<label>Top N<input id='inTopN' type='number' min='0' max='50' value='" + (tile.topN || 0) + "'></label>" +
      "<label>Currency<select id='inCurrency'><option value=''>Number</option><option value='vnd'>VND suffix</option><option value='usd'>USD prefix</option><option value='eur'>EUR prefix</option></select></label>" +
      "<label>Text<textarea id='inText'>" + IMK.escape(tile.text || "") + "</textarea></label>";
    inspector.querySelector(".close").onclick = function () { inspector.hidden = true; };
    inspector.querySelector("#inAgg").value = tile.agg || "sum";
    inspector.querySelector("#inCurrency").value = tile.currency ? tile.currency.code.toLowerCase() : "";
    inspector.querySelectorAll("input,select,textarea").forEach(function (input) {
      input.onchange = function () {
        tile.type = inspector.querySelector("#inType").value;
        tile.title = inspector.querySelector("#inTitle").value;
        tile.dim = inspector.querySelector("#inDim").value;
        tile.dim2 = inspector.querySelector("#inDim2").value;
        tile.measure = inspector.querySelector("#inMeasure").value;
        tile.agg = inspector.querySelector("#inAgg").value;
        tile.series = inspector.querySelector("#inSeries").value;
        tile.topN = Number(inspector.querySelector("#inTopN").value || 0);
        tile.text = inspector.querySelector("#inText").value;
        var cur = inspector.querySelector("#inCurrency").value;
        tile.currency = cur === "vnd" ? { symbol: "đ", position: "suffix", code: "VND" } : cur === "usd" ? { symbol: "$", position: "prefix", code: "USD" } : cur === "eur" ? { symbol: "€", position: "prefix", code: "EUR" } : null;
        IMK.renderAll();
        openInspector(tile);
      };
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === "d") {
      var page = IMK.Store.activePage();
      if (page.tiles.length) {
        event.preventDefault();
        duplicate(page.tiles[page.tiles.length - 1]);
      }
    }
  });

  IMK.Tiles = { render: renderTiles, newTile: newTile, openInspector: openInspector, duplicate: duplicate };
})();
