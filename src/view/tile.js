(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  var types = [
    { id: "bar", label: "Column", icon: "bar-chart-3" },
    { id: "hbar", label: "Bar", icon: "bar-chart-horizontal" },
    { id: "sbar", label: "Stacked", icon: "layers" },
    { id: "line", label: "Line", icon: "line-chart" },
    { id: "area", label: "Area", icon: "area-chart" },
    { id: "map", label: "Map", icon: "map" },
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
    var resolvedType = type || defaultTypeForField(field);
    return {
      id: "tile_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      type: resolvedType,
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
      layout: { x: 0, y: 0, w: resolvedType === "map" ? 8 : 6, h: resolvedType === "kpi" ? 2 : resolvedType === "map" ? 5 : 4 }
    };
  }

  function fieldGroups() {
    var dataset = IMK.Store.activeDataset();
    var cols = dataset ? dataset.columns : [];
    return {
      cols: cols,
      dims: cols.filter(function (column) { return column.role === "dimension" && column.name !== "_source"; }),
      nums: cols.filter(function (column) { return column.role === "measure"; })
    };
  }

  function selectControl(label, id, cols, selected, allowBlank) {
    return "<label class='control-field'><span>" + label + "</span><select id='" + id + "'>" + optionList(cols, selected, allowBlank) + "</select></label>";
  }

  function inputControl(label, id, value, type, attributes) {
    return "<label class='control-field'><span>" + label + "</span><input id='" + id + "' type='" + (type || "text") + "' value='" + IMK.escape(value == null ? "" : value) + "' " + (attributes || "") + "></label>";
  }

  function basicDataControls(type, config, prefix) {
    var groups = fieldGroups();
    var html = "";
    if (type === "text") {
      return "<label class='control-field control-field-wide'><span>" + IMK.i18n.t("content") + "</span><textarea id='" + prefix + "Text' placeholder='" + IMK.i18n.t("textPlaceholder") + "'>" + IMK.escape(config.text || "") + "</textarea></label>";
    }
    if (type === "table") return "";
    if (type === "kpi") {
      html += selectControl(IMK.i18n.t("measure"), prefix + "Measure", groups.nums, config.measure, true);
      html += aggregateControl(prefix, config.agg);
      return html;
    }
    if (type === "scatter") {
      html += selectControl(IMK.i18n.t("xMeasure"), prefix + "Dim", groups.nums, config.dim, false);
      html += selectControl(IMK.i18n.t("yMeasure"), prefix + "Measure", groups.nums, config.measure, false);
      return html;
    }
    if (type === "matrix") {
      html += selectControl(IMK.i18n.t("rowDimension"), prefix + "Dim", groups.dims, config.dim, false);
      html += selectControl(IMK.i18n.t("columnDimension"), prefix + "Dim2", groups.dims, config.dim2, false);
      html += selectControl(IMK.i18n.t("measure"), prefix + "Measure", groups.nums, config.measure, true);
      html += aggregateControl(prefix, config.agg);
      return html;
    }
    html += selectControl(IMK.i18n.t(type === "map" ? "geography" : "dimension"), prefix + "Dim", groups.dims.length ? groups.dims : groups.cols, config.dim, false);
    html += selectControl(IMK.i18n.t("measure"), prefix + "Measure", groups.nums, config.measure, true);
    html += aggregateControl(prefix, config.agg);
    return html;
  }

  function advancedDataControls(type, config, prefix) {
    var groups = fieldGroups();
    var html = "";
    if (type === "text") return html;
    if (type === "table") return inputControl(IMK.i18n.t("topN"), prefix + "TopN", config.topN || 50, "number", "min='1' max='500'");
    if (type === "kpi") return currencyControl(prefix, config.currency);
    if (type === "scatter") {
      html += selectControl(IMK.i18n.t("series"), prefix + "Series", groups.dims, config.series, true);
      html += currencyControl(prefix, config.currency);
      return html;
    }
    if (type === "matrix" || type === "map") return currencyControl(prefix, config.currency);
    html += selectControl(IMK.i18n.t("series"), prefix + "Series", groups.dims, config.series, true);
    html += inputControl(IMK.i18n.t("topN"), prefix + "TopN", config.topN || 10, "number", "min='0' max='50'");
    html += currencyControl(prefix, config.currency);
    return html;
  }

  function dataControls(type, config, prefix) {
    return basicDataControls(type, config, prefix) + advancedDataControls(type, config, prefix);
  }

  function aggregateControl(prefix, selected) {
    return "<label class='control-field'><span>" + IMK.i18n.t("aggregate") + "</span><select id='" + prefix + "Agg'>" + ["sum", "avg", "count", "countd", "min", "max", "pct"].map(function (value) { return "<option value='" + value + "' " + (value === (selected || "sum") ? "selected" : "") + ">" + (value === "countd" ? "DISTINCT" : value === "pct" ? "% Yes" : value.toUpperCase()) + "</option>"; }).join("") + "</select></label>";
  }

  function currencyControl(prefix, currency) {
    var selected = currency && currency.code ? currency.code.toLowerCase() : "";
    return "<label class='control-field'><span>" + IMK.i18n.t("currency") + "</span><select id='" + prefix + "Currency'><option value='' " + (!selected ? "selected" : "") + ">" + IMK.i18n.t("number") + "</option><option value='vnd' " + (selected === "vnd" ? "selected" : "") + ">" + IMK.i18n.t("vndSuffix") + "</option><option value='usd' " + (selected === "usd" ? "selected" : "") + ">" + IMK.i18n.t("usdPrefix") + "</option><option value='eur' " + (selected === "eur" ? "selected" : "") + ">" + IMK.i18n.t("eurPrefix") + "</option></select></label>";
  }

  function currencyValue(value) {
    return value === "vnd" ? { symbol: "đ", position: "suffix", code: "VND" } : value === "usd" ? { symbol: "$", position: "prefix", code: "USD" } : value === "eur" ? { symbol: "€", position: "prefix", code: "EUR" } : null;
  }

  function controlValue(root, id, fallback) {
    var input = root.querySelector("#" + id);
    return input ? input.value : fallback;
  }

  function readConfig(root, config, prefix) {
    config.title = controlValue(root, prefix + "Title", config.title);
    config.dim = controlValue(root, prefix + "Dim", config.dim);
    config.dim2 = controlValue(root, prefix + "Dim2", config.dim2);
    config.measure = controlValue(root, prefix + "Measure", config.measure);
    config.agg = controlValue(root, prefix + "Agg", config.agg);
    config.series = controlValue(root, prefix + "Series", config.series);
    config.topN = Number(controlValue(root, prefix + "TopN", config.topN || 0));
    config.text = controlValue(root, prefix + "Text", config.text);
    config.currency = currencyValue(controlValue(root, prefix + "Currency", config.currency && config.currency.code ? config.currency.code.toLowerCase() : ""));
    return config;
  }

  function suggestedTitle(type, config) {
    if (type === "text") return IMK.i18n.t("textTile");
    if (type === "table") return IMK.i18n.t("visualTable");
    if (type === "matrix") return IMK.i18n.t("visualMatrix");
    if (type === "scatter") return (config.measure || IMK.i18n.t("yMeasure")) + " / " + (config.dim || IMK.i18n.t("xMeasure"));
    if (type === "kpi") return config.measure ? IMK.i18n.t("sumLabel") + " " + config.measure : IMK.i18n.t("countRows");
    if (type === "map") return (config.measure ? IMK.i18n.t("sumLabel") + " " + config.measure : IMK.i18n.t("countRows")) + " " + IMK.i18n.t("byWord") + " " + (config.dim || IMK.i18n.t("geography"));
    return (config.measure ? IMK.i18n.t("sumLabel") + " " + config.measure : IMK.i18n.t("countRows")) + (config.dim ? " " + IMK.i18n.t("byWord") + " " + config.dim : "");
  }

  function validConfig(type, config) {
    if (type === "scatter") return !!(config.dim && config.measure);
    if (type === "matrix") return !!(config.dim && config.dim2);
    if (["bar", "hbar", "sbar", "line", "area", "map", "donut", "combo"].indexOf(type) >= 0) return !!config.dim;
    return true;
  }

  function openCreator(options) {
    options = options || {};
    var dialog = document.getElementById("visualDialog");
    var dataset = IMK.Store.activeDataset();
    var selectedField = dataset && dataset.columns.find(function (c) { return c.name === options.fieldName; });
    var draft = newTile(options.type || defaultTypeForField(selectedField), options.fieldName);
    draft.palette = draft.type === "map" ? "ocean" : "auto";
    draft.title = suggestedTitle(draft.type, draft);

    function renderCreator() {
      dialog.innerHTML = "<form method='dialog'><div class='visual-dialog-head'><div><span>" + IMK.i18n.t("chooseVisualEyebrow") + "</span><h2 id='visualDialogTitle'>" + IMK.i18n.t("chooseVisual") + "</h2><p class='visual-dialog-context'>" + IMK.i18n.t("visualSettingsHint") + "</p></div><button class='icon-btn dialog-close' value='cancel' aria-label='" + IMK.i18n.t("cancel") + "'>" + IMK.Icons.markup("x", IMK.i18n.t("cancel")) + "</button></div>" +
        "<div class='visual-builder'><section class='visual-type-section'><h3>" + IMK.i18n.t("visualType") + "</h3><div class='visual-type-grid'>" + types.map(function (type) { return "<button type='button' class='visual-type-option " + (type.id === draft.type ? "selected" : "") + "' data-type='" + type.id + "'>" + IMK.Icons.markup(type.icon, typeLabel(type)) + "<span>" + typeLabel(type) + "</span></button>"; }).join("") + "</div></section>" +
        "<section class='visual-config-section'><h3>" + IMK.i18n.t("visualData") + "</h3><div class='visual-config-grid'>" + inputControl(IMK.i18n.t("title"), "crTitle", draft.title) + dataControls(draft.type, draft, "cr") + "</div><details class='style-disclosure'><summary>" + IMK.i18n.t("visualStyle") + "</summary>" + paletteMarkup(draft.palette) + "</details><p class='visual-config-error' hidden>" + IMK.i18n.t("requiredFields") + "</p></section></div>" +
        "<div class='dialog-actions'><button class='btn' value='cancel'>" + IMK.i18n.t("cancel") + "</button><button type='button' class='btn accent create-visual'>" + IMK.Icons.markup("plus", IMK.i18n.t("createVisual")) + IMK.i18n.t("createVisual") + "</button></div></form>";
      dialog.querySelectorAll(".visual-type-option").forEach(function (button) {
        button.onclick = function () {
          readConfig(dialog, draft, "cr");
          var previousType = draft.type;
          draft.type = button.dataset.type;
          if (draft.type === "map" && previousType !== "map" && draft.palette === "auto") draft.palette = "ocean";
          draft.title = suggestedTitle(draft.type, draft);
          renderCreator();
        };
      });
      dialog.querySelectorAll(".palette-option").forEach(function (button) {
        button.onclick = function () { draft.palette = button.dataset.palette; renderCreator(); dialog.querySelector(".style-disclosure").open = true; };
      });
      dialog.querySelector(".create-visual").onclick = function () {
        readConfig(dialog, draft, "cr");
        if (!validConfig(draft.type, draft)) { dialog.querySelector(".visual-config-error").hidden = false; return; }
        draft.layout = { x: 0, y: 0, w: draft.type === "map" ? 8 : 6, h: draft.type === "kpi" ? 2 : draft.type === "map" ? 5 : 4 };
        IMK.Store.addTile(draft);
        IMK.Store.state.activeTileId = draft.id;
        dialog.close();
        IMK.renderAll();
      };
      IMK.Icons.refresh();
    }

    renderCreator();
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
      item.innerHTML = "<div class='grid-stack-item-content tile " + (IMK.Store.state.activeTileId === tile.id ? "is-selected" : "") + "'><div class='tile-header'><span class='drag-handle' title='" + IMK.i18n.t("dragVisual") + "' aria-label='" + IMK.i18n.t("dragVisual") + "' tabindex='0'>" + IMK.Icons.markup("grip-vertical", IMK.i18n.t("dragVisual")) + "</span><input aria-label='Visual title' title='" + IMK.escape(tile.title || "") + "' value='" + IMK.escape(tile.title || "") + "'><span class='tile-actions'><button class='btn edit edit-visual-btn' title='" + IMK.i18n.t("editVisualHint") + "' aria-label='" + IMK.i18n.t("editVisual") + ": " + IMK.escape(tile.title || "") + "'>" + IMK.Icons.markup("sliders-horizontal", IMK.i18n.t("editVisual")) + "<span>" + IMK.i18n.t("editVisual") + "</span></button><button class='icon-btn dup' title='" + IMK.i18n.t("duplicateVisual") + "' aria-label='" + IMK.i18n.t("duplicateVisual") + "'>" + IMK.Icons.markup("copy", IMK.i18n.t("duplicateVisual")) + "</button><button class='icon-btn danger del' title='" + IMK.i18n.t("deleteVisual") + "' aria-label='" + IMK.i18n.t("deleteVisual") + "'>" + IMK.Icons.markup("trash-2", IMK.i18n.t("deleteVisual")) + "</button></span></div><div class='tile-body'></div></div>";
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
        var deletedIndex = page.tiles.indexOf(tile);
        page.tiles = page.tiles.filter(function (t) { return t.id !== tile.id; });
        if (IMK.Store.state.activeTileId === tile.id) IMK.Store.state.activeTileId = null;
        IMK.renderAll();
        IMK.toast(IMK.i18n.t("visualDeleted"), "", {
          label: IMK.i18n.t("undo"),
          run: function () {
            page.tiles.splice(Math.max(0, deletedIndex), 0, tile);
            IMK.Store.state.activeTileId = tile.id;
            IMK.renderAll();
          }
        });
      };
      canvas.appendChild(item);
      grid.makeWidget(item);
      IMK.Charts.render(item.querySelector(".tile-body"), IMK.Store.activeDataset(), tile);
    });
    var validTileIds = [];
    IMK.Store.state.pages.forEach(function (statePage) {
      statePage.tiles.forEach(function (stateTile) { validTileIds.push(stateTile.id); });
    });
    IMK.Charts.prune(validTileIds);
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
    } else if (tile.type === "map") {
      tile.dim = field.name;
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
    openCreator({ fieldName: fieldName });
  }

  function duplicate(tile) {
    var copy = JSON.parse(JSON.stringify(tile));
    copy.id = "tile_" + Date.now();
    copy.title = copy.title + " " + IMK.i18n.t("copySuffix");
    copy.layout = { x: 0, y: 0, w: tile.layout.w, h: tile.layout.h };
    IMK.Store.addTile(copy);
    IMK.renderAll();
  }

  function optionList(cols, selected, allowBlank) {
    var html = allowBlank ? "<option value=''>" + IMK.i18n.t("none") + "</option>" : "";
    return html + cols.map(function (c) { return "<option value='" + IMK.escape(c.name) + "' " + (c.name === selected ? "selected" : "") + ">" + IMK.escape(c.name) + "</option>"; }).join("");
  }

  function openInspector(tile, options) {
    options = options || {};
    var dataset = IMK.Store.activeDataset();
    if (!dataset) return;
    var inspector = document.getElementById("inspector");
    IMK.Store.state.activeTileId = tile.id;
    inspector.hidden = false;
    inspector.innerHTML = "<div class='inspector-head'><div><span>" + IMK.i18n.t("visualSettings") + "</span><h2>" + IMK.i18n.t("inspectorTitle") + "</h2><p class='inspector-editing'>" + IMK.i18n.t("editingVisual") + " <strong>" + IMK.escape(tile.title || typeLabel(types.find(function (type) { return type.id === tile.type; }))) + "</strong></p></div><button class='icon-btn close' title='" + IMK.i18n.t("closeInspector") + "' aria-label='" + IMK.i18n.t("closeInspector") + "'>" + IMK.Icons.markup("x", IMK.i18n.t("closeInspector")) + "</button></div>" +
      "<div class='inspector-guide'><p>" + IMK.i18n.t("editVisualGuide") + "</p><div class='edit-capabilities'><span>" + IMK.i18n.t("visualData") + "</span><span>" + IMK.i18n.t("calculation") + "</span><span>" + IMK.i18n.t("visualStyleShort") + "</span></div></div>" +
      "<section class='settings-block basic-settings'><div class='settings-heading'><span class='setting-step'>1</span><div><h3>" + IMK.i18n.t("basicSettings") + "</h3><p>" + IMK.i18n.t("basicSettingsHint") + "</p></div></div><div class='visual-config-grid'><label class='control-field'><span>" + IMK.i18n.t("type") + "</span><select id='inType'>" + types.map(function (t) { return "<option value='" + t.id + "' " + (tile.type === t.id ? "selected" : "") + ">" + typeLabel(t) + "</option>"; }).join("") + "</select></label>" + inputControl(IMK.i18n.t("title"), "inTitle", tile.title || "") + basicDataControls(tile.type, tile, "in") + "</div></section>" +
      "<details class='settings-block advanced-settings' " + (options.advancedOpen ? "open" : "") + "><summary><span class='setting-step'>2</span><div><h3>" + IMK.i18n.t("advancedSettings") + "</h3><p>" + IMK.i18n.t("advancedSettingsHint") + "</p></div>" + IMK.Icons.markup("chevron-down", IMK.i18n.t("advancedSettings")) + "</summary><div class='advanced-content'><div class='visual-config-grid'>" + advancedDataControls(tile.type, tile, "in") + "</div><div class='advanced-style'><h4>" + IMK.i18n.t("visualStyle") + "</h4>" + paletteMarkup(tile.palette || "auto") + "</div></div></details>";
    inspector.querySelector(".close").onclick = function () { inspector.hidden = true; };
    IMK.Icons.refresh();
    inspector.querySelectorAll(".palette-option").forEach(function (button) {
      button.onclick = function () {
        tile.palette = button.dataset.palette;
        IMK.renderAll();
        openInspector(tile, { advancedOpen: true });
      };
    });
    inspector.querySelectorAll("input,select,textarea").forEach(function (input) {
      input.onchange = function () {
        var previousType = tile.type;
        var advancedOpen = !!input.closest(".advanced-settings");
        tile.type = controlValue(inspector, "inType", tile.type);
        readConfig(inspector, tile, "in");
        if (previousType !== tile.type) tile.title = suggestedTitle(tile.type, tile);
        IMK.renderAll();
        openInspector(tile, { advancedOpen: advancedOpen });
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
