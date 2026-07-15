(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  var types = [
    { id: "bar", label: "Column", icon: "bar-chart-3" },
    { id: "hbar", label: "Bar", icon: "bar-chart-horizontal" },
    { id: "sbar", label: "Stacked", icon: "layers" },
    { id: "line", label: "Line", icon: "line-chart" },
    { id: "area", label: "Area", icon: "area-chart" },
    { id: "donut", label: "Donut", icon: "pie-chart" },
    { id: "scatter", label: "Scatter", icon: "scatter-chart" },
    { id: "table", label: "Table", icon: "table" },
    { id: "matrix", label: "Matrix", icon: "grid" },
    { id: "kpi", label: "KPI", icon: "gauge" },
    { id: "combo", label: "Combo", icon: "combine" },
    { id: "text", label: "Text", icon: "type" }
  ];

  var paletteKeys = ["auto", "orange", "charcoal", "teal", "ocean", "forest", "berry", "spectrum", "sunset"];

  function typeLabel(type) {
    return IMK.i18n.t("visual" + type.id.charAt(0).toUpperCase() + type.id.slice(1));
  }

  function paletteLabel(key) {
    return IMK.i18n.t({ auto: "paletteAuto", orange: "paletteOrange", charcoal: "paletteCharcoal", teal: "paletteTeal", ocean: "paletteOcean", forest: "paletteForest", berry: "paletteBerry", spectrum: "paletteSpectrum", sunset: "paletteSunset" }[key]);
  }

  function paletteMarkup(selected) {
    return "<div class='palette-picker'>" + paletteKeys.map(function (key) {
      var colors = window.APP_CONFIG.VISUAL_PALETTES[key].light.slice(0, 3);
      return "<button type='button' class='palette-option " + (key === selected ? "selected" : "") + "' data-palette='" + key + "' aria-pressed='" + (key === selected) + "'><span class='palette-swatches'>" + colors.map(function (color) { return "<i style='background:" + color + "'></i>"; }).join("") + "</span><b>" + paletteLabel(key) + "</b></button>";
    }).join("") + "</div>";
  }

  function defaultTypeForField(field) {
    if (!field) return "bar";
    if (field.role === "measure") return "kpi";
    if (field.type === "date") return "line";
    return "bar";
  }

  function newTile(type, fieldName) {
    var dataset = IMK.Store.activeDataset();
    var cols = dataset ? dataset.columns : [];
    var field = cols.find(function (c) { return c.name === fieldName; });
    var dim = (cols.find(function (c) { return c.role === "dimension"; }) || cols[0] || {}).name || "";
    var measure = (cols.find(function (c) { return c.role === "measure"; }) || cols[0] || {}).name || "";
    if (field && field.role === "measure") measure = field.name;
    if (field && field.role !== "measure") dim = field.name;
    return {
      id: "tile_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      type: type || defaultTypeForField(field),
      title: IMK.i18n.t("addVisual"),
      dim: dim,
      dim2: dim,
      measure: measure,
      agg: field && field.role === "measure" ? "sum" : measure ? "sum" : "count",
      series: "",
      topN: 10,
      granularity: "month",
      text: "Double-click to write an insight.",
      palette: "auto",
      layout: { x: 0, y: 0, w: 6, h: type === "kpi" ? 2 : 4 }
    };
  }

  function openCreator(options) {
    options = options || {};
    var dialog = document.getElementById("visualDialog");
    var dataset = IMK.Store.activeDataset();
    var selectedField = dataset && dataset.columns.find(function (c) { return c.name === options.fieldName; });
    var selectedType = options.type || defaultTypeForField(selectedField);
    var selectedPalette = "auto";
    dialog.innerHTML = "<form method='dialog'><div class='visual-dialog-head'><div><span>" + IMK.i18n.t("chooseVisualEyebrow") + "</span><h2 id='visualDialogTitle'>" + IMK.i18n.t("chooseVisual") + "</h2>" + (selectedField ? "<p class='visual-dialog-context'>" + IMK.escape(selectedField.name) + "</p>" : "") + "</div><button class='icon-btn dialog-close' value='cancel' aria-label='" + IMK.i18n.t("cancel") + "'>" + IMK.Icons.markup("x", IMK.i18n.t("cancel")) + "</button></div>" +
      "<section><h3>" + IMK.i18n.t("visualType") + "</h3><div class='visual-type-grid'>" + types.map(function (type) {
        return "<button type='button' class='visual-type-option " + (type.id === selectedType ? "selected" : "") + "' data-type='" + type.id + "'>" + IMK.Icons.markup(type.icon, typeLabel(type)) + "<span>" + typeLabel(type) + "</span></button>";
      }).join("") + "</div></section>" +
      "<section><h3>" + IMK.i18n.t("palette") + "</h3>" + paletteMarkup(selectedPalette) + "</section>" +
      "<div class='dialog-actions'><button class='btn' value='cancel'>" + IMK.i18n.t("cancel") + "</button><button type='button' class='btn accent create-visual'>" + IMK.Icons.markup("plus", IMK.i18n.t("createVisual")) + IMK.i18n.t("createVisual") + "</button></div></form>";
    dialog.querySelectorAll(".visual-type-option").forEach(function (button) {
      button.onclick = function () {
        selectedType = button.dataset.type;
        dialog.querySelectorAll(".visual-type-option").forEach(function (item) { item.classList.toggle("selected", item === button); });
      };
    });
    dialog.querySelectorAll(".palette-option").forEach(function (button) {
      button.onclick = function () {
        selectedPalette = button.dataset.palette;
        dialog.querySelectorAll(".palette-option").forEach(function (item) {
          var active = item === button;
          item.classList.toggle("selected", active);
          item.setAttribute("aria-pressed", active);
        });
      };
    });
    dialog.querySelector(".create-visual").onclick = function () {
      var tile = newTile(selectedType, options.fieldName);
      tile.palette = selectedPalette;
      IMK.Store.addTile(tile);
      dialog.close();
      IMK.renderAll();
    };
    IMK.Icons.refresh();
    dialog.showModal();
  }

  function renderTiles() {
    var page = IMK.Store.activePage();
    var canvas = document.getElementById("pageCanvas");
    var grid = IMK.Layout.init();
    canvas.ondragover = function (event) { event.preventDefault(); canvas.classList.add("drop-target"); };
    canvas.ondragleave = function () { canvas.classList.remove("drop-target"); };
    canvas.ondrop = function (event) {
      event.preventDefault();
      canvas.classList.remove("drop-target");
      var fieldName = event.dataTransfer.getData("text/plain");
      if (fieldName) openCreator({ fieldName: fieldName });
    };
    var mobile = grid.getColumn() === 1;
    var mobileY = 0;
    var tiles = mobile ? page.tiles.slice().sort(function (a, b) {
      return a.layout.y - b.layout.y || a.layout.x - b.layout.x;
    }) : page.tiles;
    tiles.forEach(function (tile) {
      var layout = mobile ? { x: 0, y: mobileY, w: 1, h: tile.layout.h } : tile.layout;
      if (mobile) mobileY += layout.h;
      var item = document.createElement("div");
      item.className = "grid-stack-item";
      item.dataset.tileId = tile.id;
      item.setAttribute("gs-x", layout.x);
      item.setAttribute("gs-y", layout.y);
      item.setAttribute("gs-w", layout.w);
      item.setAttribute("gs-h", layout.h);
      item.innerHTML = "<div class='grid-stack-item-content tile " + (IMK.Store.state.activeTileId === tile.id ? "is-selected" : "") + "'><div class='tile-header'><span class='drag-handle' title='" + IMK.i18n.t("dragVisual") + "' aria-label='" + IMK.i18n.t("dragVisual") + "' tabindex='0'>" + IMK.Icons.markup("grip-vertical", IMK.i18n.t("dragVisual")) + "</span><input aria-label='Visual title' value='" + IMK.escape(tile.title || "") + "'><span class='tile-actions'><button class='icon-btn edit' title='" + IMK.i18n.t("editVisual") + "' aria-label='" + IMK.i18n.t("editVisual") + "'>" + IMK.Icons.markup("sliders-horizontal", IMK.i18n.t("editVisual")) + "</button><button class='icon-btn dup' title='" + IMK.i18n.t("duplicateVisual") + "' aria-label='" + IMK.i18n.t("duplicateVisual") + "'>" + IMK.Icons.markup("copy", IMK.i18n.t("duplicateVisual")) + "</button><button class='icon-btn danger del' title='" + IMK.i18n.t("deleteVisual") + "' aria-label='" + IMK.i18n.t("deleteVisual") + "'>" + IMK.Icons.markup("trash-2", IMK.i18n.t("deleteVisual")) + "</button></span></div><div class='tile-body'></div></div>";
      var tileEl = item.querySelector(".tile");
      tileEl.onclick = function (event) {
        if (event.target.closest("button,input,.drag-handle")) return;
        IMK.Store.state.activeTileId = tile.id;
        canvas.querySelectorAll(".tile").forEach(function (el) { el.classList.toggle("is-selected", el === tileEl); });
      };
      tileEl.ondragover = function (event) { event.preventDefault(); tileEl.classList.add("drop-target"); };
      tileEl.ondragleave = function () { tileEl.classList.remove("drop-target"); };
      tileEl.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
        tileEl.classList.remove("drop-target");
        var fieldName = event.dataTransfer.getData("text/plain");
        if (fieldName) applyField(tile, fieldName);
      };
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
    IMK.Icons.refresh();
  }

  function fieldByName(fieldName) {
    var dataset = IMK.Store.activeDataset();
    return dataset && dataset.columns.find(function (col) { return col.name === fieldName; });
  }

  function applyField(tile, fieldName) {
    var field = fieldByName(fieldName);
    if (!field) return;
    if (field.role === "measure") {
      tile.measure = field.name;
      if (!tile.agg || tile.agg === "count") tile.agg = "sum";
    } else if (!tile.dim) {
      tile.dim = field.name;
    } else if (!tile.series) {
      tile.series = field.name;
    } else {
      tile.dim2 = field.name;
    }
    IMK.Store.state.activeTileId = tile.id;
    IMK.renderAll();
    openInspector(tile);
    IMK.toast(IMK.i18n.t("fieldApplied"));
  }

  function useField(fieldName) {
    var page = IMK.Store.activePage();
    var tile = page.tiles.find(function (item) { return item.id === IMK.Store.state.activeTileId; });
    if (tile) return applyField(tile, fieldName);
    openCreator({ fieldName: fieldName });
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
    var html = allowBlank ? "<option value=''>" + IMK.i18n.t("none") + "</option>" : "";
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
    inspector.innerHTML = "<div class='inspector-head'><h2>Visual</h2><button class='icon-btn close' title='Close inspector' aria-label='Close inspector'>" + IMK.Icons.markup("x", "Close inspector") + "</button></div>" +
      "<label>" + IMK.i18n.t("type") + "<select id='inType'>" + types.map(function (t) { return "<option value='" + t.id + "' " + (tile.type === t.id ? "selected" : "") + ">" + typeLabel(t) + "</option>"; }).join("") + "</select></label>" +
      "<label>" + IMK.i18n.t("palette") + paletteMarkup(tile.palette || "auto") + "</label>" +
      "<label>" + IMK.i18n.t("title") + "<input id='inTitle' value='" + IMK.escape(tile.title || "") + "'></label>" +
      "<label>" + IMK.i18n.t("xAxis") + "<select id='inDim'>" + optionList(cols, tile.dim) + "</select></label>" +
      "<label>" + IMK.i18n.t("columnAxis") + "<select id='inDim2'>" + optionList(dims, tile.dim2) + "</select></label>" +
      "<label>" + IMK.i18n.t("measure") + "<select id='inMeasure'>" + optionList(nums.concat(cols.filter(function (c) { return c.role !== "measure"; })), tile.measure, true) + "</select></label>" +
      "<label>" + IMK.i18n.t("aggregate") + "<select id='inAgg'><option value='sum'>SUM</option><option value='avg'>AVG</option><option value='count'>COUNT</option><option value='countd'>DISTINCT</option><option value='min'>MIN</option><option value='max'>MAX</option><option value='pct'>% Yes</option></select></label>" +
      "<label>" + IMK.i18n.t("series") + "<select id='inSeries'>" + optionList(dims, tile.series, true) + "</select></label>" +
      "<label>" + IMK.i18n.t("topN") + "<input id='inTopN' type='number' min='0' max='50' value='" + (tile.topN || 0) + "'></label>" +
      "<label>" + IMK.i18n.t("currency") + "<select id='inCurrency'><option value=''>" + IMK.i18n.t("number") + "</option><option value='vnd'>" + IMK.i18n.t("vndSuffix") + "</option><option value='usd'>" + IMK.i18n.t("usdPrefix") + "</option><option value='eur'>" + IMK.i18n.t("eurPrefix") + "</option></select></label>" +
      "<label>Text<textarea id='inText'>" + IMK.escape(tile.text || "") + "</textarea></label>";
    inspector.querySelector(".close").onclick = function () { inspector.hidden = true; };
    IMK.Icons.refresh();
    inspector.querySelector("#inAgg").value = tile.agg || "sum";
    inspector.querySelector("#inCurrency").value = tile.currency ? tile.currency.code.toLowerCase() : "";
    inspector.querySelectorAll(".palette-option").forEach(function (button) {
      button.onclick = function () {
        tile.palette = button.dataset.palette;
        IMK.renderAll();
        openInspector(tile);
      };
    });
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

  IMK.Tiles = { render: renderTiles, newTile: newTile, openCreator: openCreator, openInspector: openInspector, duplicate: duplicate, useField: useField, applyField: applyField };
})();
