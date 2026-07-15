(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  function isTruthy(value) {
    if (value === true || value === 1) return true;
    return ["có", "co", "yes", "y", "true", "x", "1", "đúng", "dung", "ok", "on time", "ontime"].indexOf(String(value).trim().toLowerCase()) >= 0;
  }

  function numericValues(rows, field) {
    return rows.map(function (row) { return Number(row[field]); }).filter(function (n) { return !Number.isNaN(n); });
  }

  IMK.Measures = {
    labels: { sum: "SUM", avg: "AVG", count: "COUNT", countd: "DISTINCT", min: "MIN", max: "MAX", pct: "% Yes" },
    aggregate: function (rows, field, agg) {
      rows = rows || [];
      if (agg === "count") return rows.length;
      var vals = rows.map(function (row) { return row[field]; }).filter(function (v) { return v !== null && v !== undefined && v !== ""; });
      if (!vals.length) return null;
      if (agg === "countd") return new Set(vals.map(function (v) { return v instanceof Date ? +v : String(v); })).size;
      if (agg === "pct") return vals.filter(isTruthy).length / vals.length * 100;
      var nums = numericValues(rows, field);
      if (!nums.length) return null;
      if (agg === "sum") return nums.reduce(function (a, b) { return a + b; }, 0);
      if (agg === "avg") return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
      if (agg === "min") return Math.min.apply(null, nums);
      if (agg === "max") return Math.max.apply(null, nums);
      return null;
    }
  };
})();
