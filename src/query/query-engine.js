(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  function blankLabel() { return IMK.i18n.t("blank"); }

  function dimValue(row, field, granularity) {
    var value = row[field];
    if (value instanceof Date) {
      var y = value.getFullYear();
      var m = String(value.getMonth() + 1).padStart(2, "0");
      if (granularity === "year") return String(y);
      if (granularity === "quarter") return y + "-Q" + Math.ceil((value.getMonth() + 1) / 3);
      if (granularity === "day") return y + "-" + m + "-" + String(value.getDate()).padStart(2, "0");
      return y + "-" + m;
    }
    return value === null || value === undefined || value === "" ? blankLabel() : String(value);
  }

  function filteredRows(dataset) {
    if (!dataset) return [];
    var filters = IMK.Store.state.filters || {};
    return dataset.rows.filter(function (row) {
      return Object.keys(filters).every(function (field) {
        var f = filters[field];
        if (!f || !f.active) return true;
        var v = row[field];
        if (f.kind === "set") return f.values.indexOf(String(v == null || v === "" ? blankLabel() : v)) >= 0;
        if (f.kind === "range") {
          if (!(v instanceof Date)) return false;
          if (f.from && v < f.from) return false;
          if (f.to && v > f.to) return false;
        }
        return true;
      });
    });
  }

  function grouped(rows, tile) {
    var buckets = new Map();
    rows.forEach(function (row) {
      var key = dimValue(row, tile.dim, tile.granularity);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(row);
    });
    return buckets;
  }

  function summarize(dataset, tile) {
    var rows = filteredRows(dataset);
    var buckets = grouped(rows, tile);
    var labels = Array.from(buckets.keys());
    var totals = new Map();
    labels.forEach(function (label) { totals.set(label, IMK.Measures.aggregate(buckets.get(label), tile.measure, tile.agg)); });
    labels.sort(function (a, b) {
      if (/^\d{4}/.test(a) && /^\d{4}/.test(b)) return a.localeCompare(b);
      return (totals.get(b) || 0) - (totals.get(a) || 0);
    });
    if (tile.topN && labels.length > tile.topN) labels = labels.slice(0, tile.topN);
    if (!tile.series) return { labels: labels, datasets: [{ label: tile.measure || IMK.i18n.t("countRows"), data: labels.map(function (l) { return totals.get(l); }) }], rows: rows };

    var seriesKeys = Array.from(new Set(rows.map(function (row) { return String(row[tile.series] == null || row[tile.series] === "" ? blankLabel() : row[tile.series]); }))).slice(0, 8);
    return {
      labels: labels,
      datasets: seriesKeys.map(function (key) {
        return {
          label: key,
          data: labels.map(function (label) {
            var sub = buckets.get(label).filter(function (row) {
              return String(row[tile.series] == null || row[tile.series] === "" ? blankLabel() : row[tile.series]) === key;
            });
            return IMK.Measures.aggregate(sub, tile.measure, tile.agg);
          })
        };
      }),
      rows: rows
    };
  }

  function matrix(dataset, tile) {
    var rows = filteredRows(dataset);
    var rowKeys = Array.from(new Set(rows.map(function (row) { return dimValue(row, tile.dim, tile.granularity); }))).slice(0, 40);
    var colKeys = Array.from(new Set(rows.map(function (row) { return String(row[tile.dim2] == null || row[tile.dim2] === "" ? blankLabel() : row[tile.dim2]); }))).slice(0, 12);
    return { rows: rows, rowKeys: rowKeys, colKeys: colKeys };
  }

  IMK.Query = { filteredRows: filteredRows, summarize: summarize, matrix: matrix, dimValue: dimValue };
})();
