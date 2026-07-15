(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var C = window.APP_CONFIG;

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "d")
      .toLowerCase().trim().replace(/\s+/g, " ");
  }

  function levenshtein(a, b) {
    a = normalizeText(a); b = normalizeText(b);
    var dp = Array(b.length + 1).fill(0).map(function (_, i) { return i; });
    for (var i = 1; i <= a.length; i++) {
      var prev = dp[0];
      dp[0] = i;
      for (var j = 1; j <= b.length; j++) {
        var old = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = old;
      }
    }
    return dp[b.length];
  }

  function matchColumns(aCols, bCols) {
    var matches = [];
    aCols.forEach(function (a) {
      var best = null;
      bCols.forEach(function (b) {
        var d = levenshtein(a.normalizedName, b.normalizedName);
        if (d <= C.FUZZY_MAX_EDITS && (!best || d < best.distance)) best = { left: a, right: b, distance: d };
      });
      if (best) matches.push(best);
    });
    return matches;
  }

  function similarity(aCols, bCols) {
    var matches = matchColumns(aCols, bCols);
    var unionSize = aCols.length + bCols.length - matches.length;
    return { score: unionSize ? matches.length / unionSize : 0, matches: matches };
  }

  function alignRows(targetCols, sourceRows, sourceName, sourceCols) {
    var pairs = matchColumns(targetCols, sourceCols);
    var map = {};
    pairs.forEach(function (m) { map[m.left.name] = m.right.name; });
    return sourceRows.map(function (row) {
      var out = {};
      targetCols.forEach(function (col) { out[col.name] = row[map[col.name]] == null ? null : row[map[col.name]]; });
      out._source = sourceName;
      return out;
    });
  }

  function merge(parsedFiles) {
    var groups = [];
    var warnings = [];
    var anchors = [];
    parsedFiles.forEach(function (file) {
      var placed = false;
      groups.forEach(function (group) {
        if (placed) return;
        var sim = similarity(group.columns, file.columns);
        if (sim.matches.length >= C.ANCHOR_MIN_COLS) {
          anchors.push({ datasetA: group.name, datasetB: file.name, keys: sim.matches.map(function (m) { return m.left.name; }) });
        }
        if (sim.score >= C.UNION_THRESHOLD) {
          var known = new Set(group.columns.map(function (c) { return c.normalizedName; }));
          file.columns.forEach(function (col) {
            if (!known.has(col.normalizedName)) {
              group.columns.push(col);
              warnings.push({ kind: "missing-column", message: file.name + " has extra column " + col.name });
            }
          });
          group.rows = group.rows.concat(alignRows(group.columns, file.rows, file.name, file.columns));
          group.sources.push(file.name);
          placed = true;
        }
      });
      if (!placed) {
        var rows = file.rows.map(function (row) {
          var out = Object.assign({}, row);
          out._source = file.name;
          return out;
        });
        groups.push({ id: "ds_" + (groups.length + 1), name: file.name.replace(/\.[^.]+$/, ""), source: file.name, sources: [file.name], columns: file.columns.slice(), rows: rows });
      }
    });
    groups.forEach(function (g) {
      if (!g.columns.some(function (c) { return c.name === "_source"; })) {
        g.columns.push({ name: "_source", normalizedName: "_source", type: "text", role: "dimension", uniq: g.sources.length });
      }
    });
    return { datasets: groups, warnings: warnings.concat(checkQuality(groups)), anchors: anchors };
  }

  function checkQuality(groups) {
    var warnings = [];
    groups.forEach(function (g) {
      g.columns.forEach(function (col) {
        var blanks = 0;
        var examples = [];
        g.rows.forEach(function (row, index) {
          var v = row[col.name];
          if (v === null || v === undefined || v === "") {
            blanks++;
            if (examples.length < 3) examples.push(index + 1);
          }
        });
        if (blanks) warnings.push({ kind: "blank", dataset: g.name, column: col.name, message: g.name + " / " + col.name + ": " + blanks + " blank cells, examples rows " + examples.join(", ") });
      });
    });
    return warnings;
  }

  IMK.MergeEngine = { normalizeText: normalizeText, levenshtein: levenshtein, matchColumns: matchColumns, merge: merge };
})();
