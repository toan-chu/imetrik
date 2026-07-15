(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  IMK.escape = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  IMK.toast = function (message, kind) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show " + (kind || "");
    clearTimeout(IMK.toastTimer);
    IMK.toastTimer = setTimeout(function () { toast.className = "toast"; }, 2800);
  };

  IMK.isAbortError = function (err) {
    return !!err && (err.name === "AbortError" || /aborted|cancelled|canceled/i.test(err.message || ""));
  };

  IMK.errorMessage = function (err) {
    if (IMK.isAbortError(err)) return IMK.i18n.t("folderCancelled");
    return err && err.message ? err.message : IMK.i18n.t("operationFailed");
  };

  async function runBusy(button, action, startKey, doneKey) {
    if (button.dataset.busy === "true") return;
    var original = button.innerHTML;
    button.dataset.busy = "true";
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.innerHTML = IMK.Icons.markup("loader-circle", IMK.i18n.t(startKey)) + IMK.i18n.t(startKey);
    IMK.Icons.refresh();
    IMK.toast(IMK.i18n.t(startKey));
    try {
      var result = await action();
      IMK.toast(IMK.i18n.t(doneKey));
      return result;
    } catch (err) {
      IMK.toast(IMK.errorMessage(err), "err");
    } finally {
      button.dataset.busy = "false";
      button.removeAttribute("aria-busy");
      button.innerHTML = original;
      button.disabled = !IMK.Store.activeDataset();
      IMK.Icons.refresh();
    }
  }

  async function sheetResolver(fileName, sheets) {
    var dialog = document.getElementById("sheetDialog");
    var choices = document.getElementById("sheetChoices");
    choices.innerHTML = "";
    return new Promise(function (resolve) {
      sheets.forEach(function (sheet) {
        var btn = document.createElement("button");
        btn.value = sheet;
        btn.textContent = fileName + " - " + sheet;
        btn.onclick = function () { resolve(sheet); dialog.close(); };
        choices.appendChild(btn);
      });
      dialog.showModal();
    });
  }

  async function importFiles(files) {
    try {
      var parsed = [];
      for (var i = 0; i < files.length; i++) parsed.push(await IMK.Parser.parseFile(files[i], sheetResolver));
      var bundle = IMK.MergeEngine.merge(parsed);
      IMK.Store.setDatasets(bundle);
      autoSuggest();
      IMK.renderAll();
      IMK.toast(IMK.i18n.t("importDone") + ": " + parsed.length + " file(s)");
    } catch (err) {
      IMK.toast(IMK.errorMessage(err), "err");
    }
  }

  function autoSuggest() {
    var dataset = IMK.Store.activeDataset();
    if (!dataset) return;
    var page = IMK.Store.activePage();
    page.tiles = [];
    var measures = dataset.columns.filter(function (c) { return c.role === "measure"; });
    var dims = dataset.columns.filter(function (c) { return c.role === "dimension" && c.name !== "_source"; });
    var dates = dataset.columns.filter(function (c) { return c.type === "date"; });
    var measure = measures[0] ? measures[0].name : "";
    page.tiles.push(Object.assign(IMK.Tiles.newTile("kpi"), { title: IMK.i18n.t("countRows"), agg: "count", measure: "", layout: { x: 0, y: 0, w: 3, h: 2 } }));
    if (measure) page.tiles.push(Object.assign(IMK.Tiles.newTile("kpi"), { title: "SUM " + measure, agg: "sum", measure: measure, layout: { x: 3, y: 0, w: 3, h: 2 } }));
    if (dates[0]) page.tiles.push(Object.assign(IMK.Tiles.newTile("line"), { title: measure ? measure + " by month" : "Rows by month", dim: dates[0].name, measure: measure, agg: measure ? "sum" : "count", layout: { x: 0, y: 2, w: 8, h: 4 } }));
    if (dims[0]) page.tiles.push(Object.assign(IMK.Tiles.newTile("bar"), { title: (measure || "Rows") + " by " + dims[0].name, dim: dims[0].name, measure: measure, agg: measure ? "sum" : "count", topN: 10, layout: { x: 8, y: 2, w: 4, h: 4 } }));
    if (dims[0] && dims[1] && measure) page.tiles.push(Object.assign(IMK.Tiles.newTile("matrix"), { title: "Matrix", dim: dims[0].name, dim2: dims[1].name, measure: measure, agg: "sum", layout: { x: 0, y: 6, w: 8, h: 4 } }));
    if (measures[0] && measures[1]) page.tiles.push(Object.assign(IMK.Tiles.newTile("scatter"), { title: measures[1].name + " vs " + measures[0].name, dim: measures[0].name, measure: measures[1].name, layout: { x: 8, y: 6, w: 4, h: 4 } }));
  }

  IMK.renderAll = function () {
    var dataset = IMK.Store.activeDataset();
    if (IMK.i18n.applyStatic) IMK.i18n.applyStatic();
    document.body.dataset.theme = IMK.Store.state.theme;
    document.getElementById("brandLogo").src = window.APP_CONFIG.LOGO;
    document.getElementById("emptyLogo").src = window.APP_CONFIG.LOGO;
    document.getElementById("reportName").value = IMK.Store.state.reportName;
    document.getElementById("emptyState").hidden = !!dataset;
    document.getElementById("board").hidden = !dataset;
    ["btnAuto", "btnSave", "btnPresent", "btnPng", "btnPdf"].forEach(function (id) {
      var button = document.getElementById(id);
      button.disabled = !dataset || button.dataset.busy === "true";
    });
    document.getElementById("btnLang").textContent = IMK.i18n.lang === "vi" ? "VN" : "EN";
    document.getElementById("btnTheme").innerHTML = IMK.Icons.markup(IMK.Store.state.theme === "dark" ? "sun" : "moon", "Toggle theme");
    document.getElementById("datasetStatus").textContent = dataset ? dataset.name + " · " + IMK.i18n.number(dataset.rows.length) + " " + IMK.i18n.t("rows") : IMK.i18n.t("noData");
    document.getElementById("boardPageName").textContent = IMK.Store.activePage().name;
    IMK.Pages.renderTabs();
    renderSidebar(dataset);
    if (dataset) IMK.Tiles.render();
    IMK.Icons.refresh();
  };

  function renderSidebar(dataset) {
    var dsList = document.getElementById("datasetList");
    var fieldList = document.getElementById("fieldList");
    dsList.innerHTML = "";
    fieldList.innerHTML = "";
    IMK.Store.state.datasets.forEach(function (ds) {
      var btn = document.createElement("button");
      btn.className = ds.id === IMK.Store.state.activeDatasetId ? "active" : "";
      btn.textContent = ds.name + " (" + ds.rows.length + ")";
      btn.onclick = function () { IMK.Store.state.activeDatasetId = ds.id; IMK.renderAll(); };
      dsList.appendChild(btn);
    });
    document.getElementById("datasetCount").textContent = IMK.Store.state.datasets.length;
    document.getElementById("fieldCount").textContent = dataset ? dataset.columns.length : 0;
    if (dataset) dataset.columns.forEach(function (c) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "field-item";
      item.draggable = true;
      item.title = IMK.i18n.t("fieldHint");
      item.setAttribute("aria-label", c.name + ". " + IMK.i18n.t("fieldHint"));
      item.innerHTML = "<span>" + (c.type === "number" ? "123" : c.type === "date" ? "DATE" : "ABC") + "</span><b>" + IMK.escape(c.name) + "</b><i data-lucide='arrow-up-right' aria-hidden='true'></i>";
      item.onclick = function () { IMK.Tiles.useField(c.name); };
      item.ondragstart = function (event) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", c.name);
        item.classList.add("dragging");
      };
      item.ondragend = function () { item.classList.remove("dragging"); };
      fieldList.appendChild(item);
    });
    IMK.Slicers.render();
    var warnings = document.getElementById("warningList");
    warnings.innerHTML = "";
    document.getElementById("warningCount").textContent = IMK.Store.state.warnings.length;
    IMK.Store.state.warnings.slice(0, 20).forEach(function (w) {
      var div = document.createElement("div");
      div.textContent = w.message;
      warnings.appendChild(div);
    });
    if (!warnings.children.length) warnings.innerHTML = "<small>No warnings</small>";
    IMK.Icons.refresh();
  }

  document.getElementById("fileInput").onchange = function (e) { importFiles(Array.from(e.target.files)); e.target.value = ""; };
  document.getElementById("btnImport").onclick = document.getElementById("btnImportEmpty").onclick = function () { document.getElementById("fileInput").click(); };
  document.getElementById("btnFolder").onclick = document.getElementById("btnFolderEmpty").onclick = async function () {
    try {
      await IMK.FolderScanner.chooseFolder(importFiles);
      IMK.FolderScanner.startPolling(importFiles);
    } catch (err) { IMK.toast(IMK.errorMessage(err), IMK.isAbortError(err) ? "" : "err"); }
  };
  document.getElementById("btnAuto").onclick = function () { autoSuggest(); IMK.renderAll(); };
  document.getElementById("btnAddVisual").onclick = function () { IMK.Tiles.openCreator(); };
  document.getElementById("btnSave").onclick = function () { IMK.ReportIO.save().catch(function (err) { IMK.toast(err.message, "err"); }); };
  document.getElementById("btnLoad").onclick = function () { document.getElementById("reportFileInput").click(); };
  document.getElementById("reportFileInput").onchange = function (e) { if (e.target.files[0]) IMK.ReportIO.loadFile(e.target.files[0]); };
  document.getElementById("btnReportsFolder").onclick = function () { IMK.ReportIO.chooseReportsFolder().catch(function (err) { IMK.toast(IMK.errorMessage(err), IMK.isAbortError(err) ? "" : "err"); }); };
  document.getElementById("btnPresent").onclick = function () { IMK.Present.start(); };
  document.getElementById("btnPng").onclick = function () { runBusy(this, IMK.Export.png, "pngPreparing", "pngDone"); };
  document.getElementById("btnPdf").onclick = function () { runBusy(this, IMK.Export.pdf, "pdfPreparing", "pdfDone"); };
  document.getElementById("btnTheme").onclick = function () { IMK.Store.state.theme = IMK.Store.state.theme === "dark" ? "light" : "dark"; IMK.renderAll(); };
  document.getElementById("btnLang").onclick = function () { IMK.i18n.setLang(IMK.i18n.lang === "vi" ? "en" : "vi"); IMK.renderAll(); };
  document.getElementById("reportName").onchange = function (e) { IMK.Store.state.reportName = e.target.value || IMK.i18n.t("untitled"); };
  document.getElementById("btnResetFilters").onclick = function () { IMK.Store.state.filters = {}; IMK.renderAll(); };
  document.getElementById("btnClearHighlight").onclick = function () { IMK.Store.state.highlight = null; IMK.renderAll(); };

  IMK.renderAll();
  if (IMK.FolderScanner.restoreSaved) {
    IMK.FolderScanner.restoreSaved(importFiles, false).catch(function () { /* A stored handle may need a user gesture. */ });
  }
})();
