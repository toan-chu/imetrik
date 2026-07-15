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

  function workbookToRows(workbook, sheetName) {
    var rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, raw: true });
    rows = rows.filter(function (row) {
      return Object.keys(row).some(function (key) { return row[key] !== null && row[key] !== undefined && row[key] !== ""; });
    });
    if (!rows.length) throw new Error("Sheet is empty");
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

  function parseFile(file, sheetResolver) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Cannot read file")); };
      reader.onload = async function (event) {
        try {
          var wb = XLSX.read(new Uint8Array(event.target.result), { type: "array", cellDates: true });
          var sheets = wb.SheetNames.filter(function (name) {
            var ref = wb.Sheets[name]["!ref"];
            if (!ref) return false;
            return XLSX.utils.decode_range(ref).e.r > 0;
          });
          if (!sheets.length) throw new Error("No data sheet found");
          var sheet = sheets.length > 1 && sheetResolver ? await sheetResolver(file.name, sheets) : sheets[0];
          var rows = workbookToRows(wb, sheet);
          resolve({ name: file.name, sheetName: sheet, rows: rows, columns: inferColumns(rows) });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  IMK.Parser = { parseFile: parseFile, inferColumns: inferColumns, toDate: toDate };
})();
