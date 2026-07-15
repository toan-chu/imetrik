(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  function pageTemplate(name) {
    return { id: "page_" + Date.now() + "_" + Math.random().toString(16).slice(2), name: name || "Page 1", tiles: [] };
  }

  var state = {
    reportName: "Untitled report",
    datasets: [],
    activeDatasetId: null,
    anchors: [],
    warnings: [],
    pages: [pageTemplate("Page 1")],
    activePageId: null,
    filters: {},
    highlight: null,
    theme: "light"
  };
  state.activePageId = state.pages[0].id;

  IMK.Store = {
    state: state,
    setDatasets: function (bundle) {
      state.datasets = bundle.datasets || [];
      state.anchors = bundle.anchors || [];
      state.warnings = bundle.warnings || [];
      state.activeDatasetId = state.datasets[0] ? state.datasets[0].id : null;
      state.filters = {};
      state.highlight = null;
    },
    activeDataset: function () {
      return state.datasets.find(function (d) { return d.id === state.activeDatasetId; }) || state.datasets[0] || null;
    },
    activePage: function () {
      return state.pages.find(function (p) { return p.id === state.activePageId; }) || state.pages[0];
    },
    addPage: function () {
      var page = pageTemplate("Page " + (state.pages.length + 1));
      state.pages.push(page);
      state.activePageId = page.id;
      return page;
    },
    removePage: function (id) {
      if (state.pages.length <= 1) return;
      state.pages = state.pages.filter(function (p) { return p.id !== id; });
      state.activePageId = state.pages[0].id;
    },
    addTile: function (tile) {
      this.activePage().tiles.push(tile);
    },
    serialize: function () {
      return {
        version: 1,
        reportName: state.reportName,
        pages: state.pages,
        theme: state.theme,
        lang: IMK.i18n.lang
      };
    },
    applyReport: function (report) {
      state.reportName = report.reportName || state.reportName;
      state.pages = report.pages && report.pages.length ? report.pages : [pageTemplate("Page 1")];
      state.activePageId = state.pages[0].id;
      state.theme = report.theme || "light";
      if (report.lang) IMK.i18n.setLang(report.lang);
      remapTilesToActiveDataset();
    }
  };

  function remapField(name, columns) {
    if (!name) return name;
    var exact = columns.find(function (c) { return c.name === name; });
    if (exact) return exact.name;
    var normalized = IMK.MergeEngine.normalizeText(name);
    var best = null;
    columns.forEach(function (col) {
      var distance = IMK.MergeEngine.levenshtein(normalized, col.normalizedName);
      if (distance <= window.APP_CONFIG.FUZZY_MAX_EDITS && (!best || distance < best.distance)) best = { name: col.name, distance: distance };
    });
    return best ? best.name : "";
  }

  function remapTilesToActiveDataset() {
    var dataset = IMK.Store.activeDataset();
    if (!dataset) return;
    state.pages.forEach(function (page) {
      page.tiles.forEach(function (tile) {
        tile.dim = remapField(tile.dim, dataset.columns);
        tile.dim2 = remapField(tile.dim2, dataset.columns);
        tile.measure = remapField(tile.measure, dataset.columns);
        tile.series = remapField(tile.series, dataset.columns);
      });
    });
  }
})();
