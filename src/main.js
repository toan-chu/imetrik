(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  IMK.escape = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  IMK.toast = function (message, kind, action) {
    var toast = document.getElementById("toast");
    toast.innerHTML = "";
    var label = document.createElement("span");
    label.textContent = message;
    toast.appendChild(label);
    if (action && typeof action.run === "function") {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "toast-action";
      button.textContent = action.label || IMK.i18n.t("undo");
      button.onclick = function () {
        clearTimeout(IMK.toastTimer);
        action.run();
        toast.className = "toast";
        toast.innerHTML = "";
      };
      toast.appendChild(button);
    }
    toast.className = "toast show " + (kind || "");
    clearTimeout(IMK.toastTimer);
    IMK.toastTimer = setTimeout(function () { toast.className = "toast"; toast.innerHTML = ""; }, 2800);
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

  async function sheetResolver(fileName, candidates) {
    var dialog = document.getElementById("sheetDialog");
    return new Promise(function (resolve) {
      var state = candidates.map(function (candidate, index) {
        return { candidate: candidate, selected: index === 0, headerRow: candidate.suggestedHeaderRow };
      });
      var activeIndex = 0;
      var settled = false;

      function finish(value) {
        if (settled) return;
        settled = true;
        dialog.close();
        resolve(value);
      }

      function previewMarkup(item) {
        var rows = item.candidate.preview.slice(0, 12);
        var width = Math.min(8, Math.max.apply(null, rows.map(function (row) { return row.length; }).concat([1])));
        return "<div class='import-preview-scroll'><table class='import-preview-table'><tbody>" + rows.map(function (row, rowIndex) {
          var cells = [];
          for (var colIndex = 0; colIndex < width; colIndex++) cells.push("<td>" + IMK.escape(row[colIndex] == null ? "" : row[colIndex]) + "</td>");
          return "<tr class='" + (rowIndex === item.headerRow ? "is-header" : "") + "' data-header-row='" + rowIndex + "'><th>" + (rowIndex + 1) + "</th>" + cells.join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
      }

      function render() {
        var active = state[activeIndex];
        dialog.innerHTML = "<form method='dialog'><div class='dialog-head'><div><p class='dialog-eyebrow'>" + IMK.escape(fileName) + "</p><h2 id='sheetDialogTitle'>" + IMK.i18n.t("importReviewTitle") + "</h2><p>" + IMK.i18n.t("importReviewDescription") + "</p></div><button type='button' class='icon-btn import-cancel' aria-label='" + IMK.i18n.t("cancel") + "'>" + IMK.Icons.markup("x", IMK.i18n.t("cancel")) + "</button></div>" +
          "<div class='import-dialog-body'><section class='sheet-panel'><h3>" + IMK.i18n.t("sheets") + "</h3><div class='sheet-list'>" + state.map(function (item, index) {
            return "<div class='sheet-choice " + (index === activeIndex ? "active" : "") + "'><input type='checkbox' id='sheet-" + index + "' data-sheet-check='" + index + "' " + (item.selected ? "checked" : "") + "><button type='button' data-sheet-active='" + index + "'><strong>" + IMK.escape(item.candidate.name) + "</strong><small>" + IMK.i18n.number(item.candidate.rowCount) + " " + IMK.i18n.t("rows") + "</small></button></div>";
          }).join("") + "</div><p class='import-error' hidden></p></section>" +
          "<section class='preview-panel'><div class='preview-head'><div><h3>" + IMK.i18n.t("preview") + ": " + IMK.escape(active.candidate.name) + "</h3><p>" + IMK.i18n.t("headerRow") + "</p></div><select id='headerRowSelect' aria-label='" + IMK.i18n.t("headerRow") + "'>" + active.candidate.preview.slice(0, 20).map(function (_, index) { return "<option value='" + index + "' " + (index === active.headerRow ? "selected" : "") + ">" + (index + 1) + "</option>"; }).join("") + "</select></div>" + previewMarkup(active) + "</section></div>" +
          "<div class='dialog-actions'><button type='button' class='btn import-cancel'>" + IMK.i18n.t("cancel") + "</button><button type='button' class='btn accent import-confirm'>" + IMK.Icons.markup("check", IMK.i18n.t("useSelectedSheets")) + IMK.i18n.t("useSelectedSheets") + "</button></div></form>";
        dialog.querySelectorAll("[data-sheet-active]").forEach(function (button) {
          button.onclick = function () { activeIndex = Number(button.dataset.sheetActive); render(); };
        });
        dialog.querySelectorAll("[data-sheet-check]").forEach(function (checkbox) {
          checkbox.onchange = function () { state[Number(checkbox.dataset.sheetCheck)].selected = checkbox.checked; };
        });
        dialog.querySelector("#headerRowSelect").onchange = function (event) {
          state[activeIndex].headerRow = Number(event.target.value);
          render();
        };
        dialog.querySelectorAll("[data-header-row]").forEach(function (row) {
          row.onclick = function () { state[activeIndex].headerRow = Number(row.dataset.headerRow); render(); };
        });
        dialog.querySelectorAll(".import-cancel").forEach(function (button) { button.onclick = function () { finish(null); }; });
        dialog.querySelector(".import-confirm").onclick = function () {
          var selected = state.filter(function (item) { return item.selected; });
          if (!selected.length) {
            var error = dialog.querySelector(".import-error");
            error.hidden = false;
            error.textContent = IMK.i18n.t("selectAtLeastOneSheet");
            return;
          }
          finish(selected.map(function (item) { return { sheetName: item.candidate.name, headerRow: item.headerRow }; }));
        };
        IMK.Icons.refresh();
      }

      dialog.oncancel = function (event) { event.preventDefault(); finish(null); };
      render();
      dialog.showModal();
    });
  }

  async function importFiles(files) {
    if (!files || !files.length) return;
    try {
      var parsed = [];
      var hadTiles = IMK.Store.state.pages.some(function (page) { return page.tiles.length > 0; });
      for (var i = 0; i < files.length; i++) {
        var fileResults = await IMK.Parser.parseFile(files[i], sheetResolver, { review: files.length === 1 });
        parsed = parsed.concat(fileResults);
      }
      var bundle = IMK.MergeEngine.merge(parsed);
      IMK.Store.setDatasets(bundle, { preserveFilters: hadTiles });
      if (!hadTiles) autoSuggest(false);
      IMK.renderAll();
      IMK.toast(IMK.i18n.t("importDone") + ": " + IMK.i18n.number(parsed.length));
    } catch (err) {
      IMK.toast(IMK.errorMessage(err), "err");
    }
  }

  function autoSuggest(createNewPage) {
    var dataset = IMK.Store.activeDataset();
    if (!dataset) return;
    var page = IMK.Store.activePage();
    if (createNewPage && page.tiles.length) {
      page = IMK.Store.addPage(IMK.i18n.t("samplePageName") + " " + (IMK.Store.state.pages.length + 1));
    }
    page.tiles = [];
    var measures = dataset.columns.filter(function (c) { return c.role === "measure"; });
    var dims = dataset.columns.filter(function (c) { return c.role === "dimension" && c.name !== "_source"; });
    var dates = dataset.columns.filter(function (c) { return c.type === "date"; });
    var measure = measures[0] ? measures[0].name : "";
    page.tiles.push(Object.assign(IMK.Tiles.newTile("kpi"), { title: IMK.i18n.t("countRows"), agg: "count", measure: "", layout: { x: 0, y: 0, w: 3, h: 2 } }));
    if (measure) page.tiles.push(Object.assign(IMK.Tiles.newTile("kpi"), { title: IMK.i18n.t("sumLabel") + " " + measure, agg: "sum", measure: measure, layout: { x: 3, y: 0, w: 3, h: 2 } }));
    if (dates[0]) page.tiles.push(Object.assign(IMK.Tiles.newTile("line"), { title: measure ? IMK.i18n.t("sumLabel") + " " + measure + " " + IMK.i18n.t("byWord") + " " + dates[0].name : IMK.i18n.t("rowsBy") + " " + dates[0].name, dim: dates[0].name, measure: measure, agg: measure ? "sum" : "count", layout: { x: 0, y: 2, w: 8, h: 4 } }));
    if (dims[0]) page.tiles.push(Object.assign(IMK.Tiles.newTile("bar"), { title: (measure ? IMK.i18n.t("sumLabel") + " " + measure : IMK.i18n.t("countRows")) + " " + IMK.i18n.t("byWord") + " " + dims[0].name, dim: dims[0].name, measure: measure, agg: measure ? "sum" : "count", topN: 10, layout: { x: 8, y: 2, w: 4, h: 4 } }));
    if (dims[0] && dims[1] && measure) page.tiles.push(Object.assign(IMK.Tiles.newTile("matrix"), { title: IMK.i18n.t("visualMatrix"), dim: dims[0].name, dim2: dims[1].name, measure: measure, agg: "sum", layout: { x: 0, y: 6, w: 8, h: 4 } }));
    if (measures[0] && measures[1]) page.tiles.push(Object.assign(IMK.Tiles.newTile("scatter"), { title: measures[1].name + " / " + measures[0].name, dim: measures[0].name, measure: measures[1].name, layout: { x: 8, y: 6, w: 4, h: 4 } }));
    if (createNewPage) IMK.toast(IMK.i18n.t("sampleCreated"));
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
    document.getElementById("datasetStatus").textContent = dataset ? dataset.name + " · " + IMK.i18n.number(dataset.rows.length) + " " + IMK.i18n.t("rows") + (dataset.sources && dataset.sources.length > 1 ? " / " + dataset.sources.length + " " + IMK.i18n.t("files") : "") : IMK.i18n.t("noData");
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
      var row = document.createElement("div");
      row.className = "field-row";
      var item = document.createElement("button");
      item.type = "button";
      item.className = "field-item";
      item.draggable = true;
      item.title = IMK.i18n.t("fieldCreate");
      item.setAttribute("aria-label", c.name + ". " + IMK.i18n.t("fieldCreate"));
      item.innerHTML = "<span>" + (c.type === "number" ? "123" : c.type === "date" ? "DATE" : "ABC") + "</span><b>" + IMK.escape(c.name) + "</b><i data-lucide='plus' aria-hidden='true'></i>";
      item.onclick = function () { IMK.Tiles.openCreator({ fieldName: c.name }); };
      item.ondragstart = function (event) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", c.name);
        item.classList.add("dragging");
      };
      item.ondragend = function () { item.classList.remove("dragging"); };
      row.appendChild(item);
      var activeTile = IMK.Store.activePage().tiles.find(function (tile) { return tile.id === IMK.Store.state.activeTileId; });
      if (activeTile) {
        var apply = document.createElement("button");
        apply.type = "button";
        apply.className = "field-apply icon-btn";
        apply.title = IMK.i18n.t("fieldApply");
        apply.setAttribute("aria-label", c.name + ". " + IMK.i18n.t("fieldApply"));
        apply.innerHTML = IMK.Icons.markup("corner-down-right", IMK.i18n.t("fieldApply"));
        apply.onclick = function () { IMK.Tiles.applyField(activeTile, c.name); };
        row.appendChild(apply);
      }
      fieldList.appendChild(row);
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
    if (!warnings.children.length) warnings.innerHTML = "<small>" + IMK.i18n.t("noWarnings") + "</small>";
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
  document.getElementById("btnAuto").onclick = function () { autoSuggest(true); IMK.renderAll(); };
  document.getElementById("btnAddVisual").onclick = function () { IMK.Tiles.openCreator(); };
  document.getElementById("btnSave").onclick = function () { IMK.ReportIO.save().catch(function (err) { IMK.toast(err.message, "err"); }); };
  document.getElementById("btnLoad").onclick = function () { document.getElementById("reportFileInput").click(); };
  document.getElementById("reportFileInput").onchange = function (e) { if (e.target.files[0]) IMK.ReportIO.loadFile(e.target.files[0]); };
  document.getElementById("btnReportsFolder").onclick = function () { IMK.ReportIO.chooseReportsFolder().catch(function (err) { IMK.toast(IMK.errorMessage(err), IMK.isAbortError(err) ? "" : "err"); }); };
  document.getElementById("btnPresent").onclick = function () { IMK.Present.start(); };
  document.getElementById("btnPng").onclick = function () { runBusy(this, IMK.Export.png, "pngPreparing", "pngDone"); };
  document.getElementById("btnPdf").onclick = function () { runBusy(this, IMK.Export.pdf, "pdfPreparing", "pdfDone"); };
  document.getElementById("btnTheme").onclick = function () { IMK.Store.state.theme = IMK.Store.state.theme === "dark" ? "light" : "dark"; IMK.renderAll(); };
  document.getElementById("btnLang").onclick = function () { IMK.i18n.setLang(IMK.i18n.lang === "vi" ? "en" : "vi"); document.getElementById("inspector").hidden = true; IMK.renderAll(); };
  document.getElementById("reportName").onchange = function (e) { IMK.Store.state.reportName = e.target.value || IMK.i18n.t("untitled"); };
  document.getElementById("btnResetFilters").onclick = function () { IMK.Store.state.filters = {}; IMK.renderAll(); };
  document.getElementById("btnClearHighlight").onclick = function () { IMK.Store.state.highlight = null; IMK.renderAll(); };

  document.getElementById("btnMore").onclick = function (event) {
    event.stopPropagation();
    var panel = document.getElementById("toolbarSecondary");
    var open = panel.classList.toggle("is-open");
    this.setAttribute("aria-expanded", String(open));
  };
  document.getElementById("toolbarSecondary").onclick = function (event) { event.stopPropagation(); };
  document.addEventListener("click", function () {
    document.getElementById("toolbarSecondary").classList.remove("is-open");
    document.getElementById("btnMore").setAttribute("aria-expanded", "false");
  });
  function setSidebarOpen(open) {
    var sidebar = document.getElementById("sidebar");
    var mobile = window.matchMedia("(max-width: 980px)").matches;
    sidebar.hidden = mobile && !open;
    sidebar.classList.toggle("is-open", mobile && open);
    sidebar.inert = mobile && !open;
    sidebar.setAttribute("aria-hidden", String(mobile && !open));
  }
  document.getElementById("btnSidebarOpen").onclick = function () { setSidebarOpen(true); };
  document.getElementById("btnSidebarClose").onclick = function () { setSidebarOpen(false); };
  window.addEventListener("resize", function () { setSidebarOpen(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setSidebarOpen(false);
      document.getElementById("toolbarSecondary").classList.remove("is-open");
      document.getElementById("btnMore").setAttribute("aria-expanded", "false");
    }
  });

  setSidebarOpen(false);
  IMK.renderAll();
  if (IMK.FolderScanner.restoreSaved) {
    IMK.FolderScanner.restoreSaved(importFiles, false).catch(function () { /* A stored handle may need a user gesture. */ });
  }
})();
