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
    slicerOpen: {},
    activeTileId: null,
    highlight: null,
    theme: "light"
  };
  state.activePageId = state.pages[0].id;

  IMK.Store = {
    state: state,
    setDatasets: function (bundle, options) {
      options = options || {};
      var previousFilters = state.filters;
      state.datasets = bundle.datasets || [];
      state.anchors = bundle.anchors || [];
      state.warnings = bundle.warnings || [];
      state.activeDatasetId = state.datasets[0] ? state.datasets[0].id : null;
      state.filters = options.preserveFilters ? previousFilters : {};
      state.slicerOpen = {};
      if (!state.pages.some(function (page) { return page.tiles.some(function (tile) { return tile.id === state.activeTileId; }); })) state.activeTileId = null;
      state.highlight = null;
      pruneFilters();
      remapTilesToActiveDataset();
    },
    activeDataset: function () {
      return state.datasets.find(function (d) { return d.id === state.activeDatasetId; }) || state.datasets[0] || null;
    },
    activePage: function () {
      return state.pages.find(function (p) { return p.id === state.activePageId; }) || state.pages[0];
    },
    addPage: function (name) {
      var page = pageTemplate(name || "Page " + (state.pages.length + 1));
      state.pages.push(page);
      state.activePageId = page.id;
      return page;
    },
    removePage: function (id) {
      if (state.pages.length <= 1) return false;
      var removedIndex = state.pages.findIndex(function (p) { return p.id === id; });
      state.pages = state.pages.filter(function (p) { return p.id !== id; });
      state.activePageId = state.pages[Math.min(Math.max(removedIndex, 0), state.pages.length - 1)].id;
      return true;
    },
    addTile: function (tile) {
      this.activePage().tiles.push(tile);
    },
    serialize: function () {
      return {
        version: 2,
        reportName: state.reportName,
        pages: state.pages,
        activePageId: state.activePageId,
        filters: state.filters,
        theme: state.theme,
        lang: IMK.i18n.lang
      };
    },
    applyReport: function (report) {
      state.reportName = report.reportName || state.reportName;
      state.pages = report.pages && report.pages.length ? report.pages : [pageTemplate("Page 1")];
      state.activePageId = state.pages.some(function (page) { return page.id === report.activePageId; }) ? report.activePageId : state.pages[0].id;
      state.filters = reviveFilters(report.filters || {});
      state.theme = report.theme || "light";
      if (report.lang) IMK.i18n.setLang(report.lang);
      pruneFilters();
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

  function reviveFilters(filters) {
    var revived = {};
    Object.keys(filters || {}).forEach(function (key) {
      var filter = Object.assign({}, filters[key]);
      if (filter.kind === "range") {
        filter.from = filter.from ? new Date(filter.from) : null;
        filter.to = filter.to ? new Date(filter.to) : null;
        if (filter.from && Number.isNaN(+filter.from)) filter.from = null;
        if (filter.to && Number.isNaN(+filter.to)) filter.to = null;
      }
      revived[key] = filter;
    });
    return revived;
  }

  function pruneFilters() {
    var dataset = IMK.Store.activeDataset();
    if (!dataset) return;
    var available = new Set(dataset.columns.map(function (column) { return column.name; }));
    Object.keys(state.filters).forEach(function (field) {
      if (!available.has(field)) delete state.filters[field];
    });
  }
})();
