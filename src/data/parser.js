(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  var DATE_RX = [/^(\d{4})-(\d{1,2})-(\d{1,2})/, /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, /^(\d{1,2})-(\d{1,2})-(\d{4})/];

  function toDate(value) {
    if (value instanceof Date && !Number.isNaN(+value)) return value;
    if (typeof value === "number" && value > 20000 && value < 70000) return new Date(Math.round((value - 25569) * 86400 * 1000));
    if (typeof value === "string") {
      var s = value.trim();
      var m = s.match(DATE_RX[0]);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
      m = s.match(DATE_RX[1]) || s.match(DATE_RX[2]);
      if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    }
    return null;
  }

  function inferColumns(rows) {
    var headers = Object.keys(rows[0] || {});
    return headers.map(function (h) {
      var sample = [];
      for (var i = 0; i < rows.length && sample.length < 600; i++) {
        var v = rows[i][h];
        if (v !== null && v !== undefined && v !== "") sample.push(v);
      }
      var normalizedName = IMK.MergeEngine.normalizeText(h);
      if (!sample.length) return { name: h, normalizedName: normalizedName, type: "text", role: "dimension", uniq: 0 };
      var dates = sample.filter(function (v) { return toDate(v) !== null; }).length;
      if (dates / sample.length >= 0.8) {
        rows.forEach(function (row) { row[h] = toDate(row[h]); });
        return { name: h, normalizedName: normalizedName, type: "date", role: "dimension", uniq: 0 };
      }
      var nums = sample.filter(function (v) { return typeof v === "number" && !Number.isNaN(v) || typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v.replace(/[,\s]/g, ""))); }).length;
      if (nums / sample.length >= 0.85) {
        rows.forEach(function (row) {
          if (typeof row[h] === "string") row[h] = Number(row[h].replace(/[,\s]/g, ""));
        });
        return { name: h, normalizedName: normalizedName, type: "number", role: "measure", uniq: new Set(sample.map(String)).size };
      }
      var bools = sample.filter(function (v) { return /^(có|co|không|khong|yes|no|true|false|y|n|0|1)$/i.test(String(v).trim()); }).length;
      if (bools / sample.length >= 0.85) return { name: h, normalizedName: normalizedName, type: "boolean", role: "dimension", uniq: 2 };
      return { name: h, normalizedName: normalizedName, type: "text", role: "dimension", uniq: new Set(sample.map(String)).size };
    });
  }

  function previewSheet(workbook, sheetName, limit) {
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: true,
      // Keep blank rows so preview row numbers map exactly to XLSX range offsets.
      blankrows: true,
      range: 0
    }).slice(0, limit || 30);
  }

  function suggestedHeaderRow(preview) {
    var best = { index: 0, score: -Infinity };
    preview.slice(0, 20).forEach(function (row, index) {
      var values = row.map(function (value) { return value == null ? "" : String(value).trim(); });
      var nonEmpty = values.filter(Boolean);
      if (nonEmpty.length < 2) return;
      var unique = new Set(nonEmpty.map(function (value) { return value.toLowerCase(); })).size;
      var text = nonEmpty.filter(function (value) { return Number.isNaN(Number(value.replace(/[,%\s]/g, ""))); }).length;
      var next = preview[index + 1] || [];
      var nextNonEmpty = next.filter(function (value) { return value !== null && value !== undefined && value !== ""; }).length;
      var score = nonEmpty.length * 2 + unique + text * 0.7 + (nextNonEmpty >= Math.max(2, nonEmpty.length * 0.5) ? 4 : 0) - index * 0.12;
      if (score > best.score) best = { index: index, score: score };
    });
    return best.index;
  }

  function workbookToRows(workbook, sheetName, headerRow) {
    var rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, raw: true, range: headerRow || 0 });
    rows = rows.filter(function (row) {
      return Object.keys(row).some(function (key) { return row[key] !== null && row[key] !== undefined && row[key] !== ""; });
    });
    if (!rows.length) throw new Error(IMK.i18n.t("sheetEmpty"));
    var keys = {};
    Object.keys(rows[0]).forEach(function (k) { keys[k] = String(k).trim(); });
    return rows.map(function (row) {
      var out = {};
      Object.keys(row).forEach(function (k) {
        var v = row[k];
        out[keys[k]] = typeof v === "string" ? v.trim() : v;
      });
      return out;
    });
  }

  function parseFile(file, sheetResolver, options) {
    options = options || {};
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error(IMK.i18n.t("fileReadFailed"))); };
      reader.onload = async function (event) {
        try {
          var wb = XLSX.read(new Uint8Array(event.target.result), { type: "array", cellDates: true });
          var sheets = wb.SheetNames.filter(function (name) {
            var ref = wb.Sheets[name]["!ref"];
            if (!ref) return false;
            return XLSX.utils.decode_range(ref).e.r > 0;
          });
          if (!sheets.length) throw new Error(IMK.i18n.t("noDataSheet"));
          var candidates = sheets.map(function (name) {
            var preview = previewSheet(wb, name, 30);
            return {
              name: name,
              preview: preview,
              suggestedHeaderRow: suggestedHeaderRow(preview),
              rowCount: Math.max(0, XLSX.utils.decode_range(wb.Sheets[name]["!ref"]).e.r)
            };
          });
          var needsReview = options.review || candidates.length > 1 || candidates.some(function (candidate) { return candidate.suggestedHeaderRow > 0; });
          var selections = needsReview && sheetResolver
            ? await sheetResolver(file.name, candidates)
            : [{ sheetName: candidates[0].name, headerRow: candidates[0].suggestedHeaderRow }];
          if (!selections || !selections.length) throw new DOMException("Cancelled", "AbortError");
          var parsed = selections.map(function (selection) {
            var rows = workbookToRows(wb, selection.sheetName, selection.headerRow);
            var sourceName = selections.length > 1 ? file.name + " / " + selection.sheetName : file.name;
            return { name: sourceName, sheetName: selection.sheetName, headerRow: selection.headerRow, rows: rows, columns: inferColumns(rows) };
          });
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  IMK.Parser = { parseFile: parseFile, inferColumns: inferColumns, toDate: toDate, previewSheet: previewSheet, suggestedHeaderRow: suggestedHeaderRow };
})();
