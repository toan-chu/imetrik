(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var C = window.APP_CONFIG;
  var instances = {};

  Chart.defaults.font.family = "'Montserrat', sans-serif";
  Chart.defaults.font.size = 11;

  function palette(tile) {
    var key = tile.palette && C.VISUAL_PALETTES[tile.palette] ? tile.palette : "auto";
    var theme = IMK.Store.state.theme === "dark" ? "dark" : "light";
    return C.VISUAL_PALETTES[key][theme];
  }

  function color(tile, index, alpha) {
    var colors = palette(tile);
    var hex = colors[index % colors.length];
    if (alpha == null || alpha === 1) return hex;
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  function formatValue(tile, value) {
    if (tile.agg === "pct") return IMK.i18n.percent(value);
    if (tile.currency) return IMK.i18n.money(value, tile.currency);
    return IMK.i18n.number(value, { compact: true });
  }

  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function detachAll() {
    Object.keys(instances).forEach(function (id) {
      var canvas = instances[id] && instances[id].canvas;
      var mount = canvas && canvas.$imkMount;
      if (mount && mount.parentNode) mount.parentNode.removeChild(mount);
      else if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    });
  }

  function prune(validIds) {
    Object.keys(instances).forEach(function (id) {
      if (validIds.indexOf(id) < 0) destroy(id);
    });
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function disableMotion(pointCount) {
    return document.body.classList.contains("exporting") || reducedMotion() || pointCount > C.ANIM_MAX_POINTS;
  }

  function mountCanvas(el, canvas, kind, statusMarkup) {
    el.innerHTML = "";
    var mount = canvas.$imkMount;
    if (!mount) {
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", kind === "map" ? "Choropleth map" : "Data visualization");
      if (kind === "map") {
        mount = document.createElement("div");
        mount.className = "map-visual";
        var frame = document.createElement("div");
        frame.className = "map-canvas-frame";
        frame.appendChild(canvas);
        mount.appendChild(frame);
        var status = document.createElement("div");
        status.className = "map-status";
        mount.$imkStatus = status;
        mount.appendChild(status);
      } else {
        mount = document.createElement("div");
        mount.className = "chart-canvas-frame";
        mount.appendChild(canvas);
      }
      canvas.$imkMount = mount;
    }
    if (mount.$imkStatus) mount.$imkStatus.innerHTML = statusMarkup || "";
    el.appendChild(mount);
  }

  function resizeAfterMount(chart) {
    function resize() {
      if (chart && chart.canvas && chart.canvas.$imkMount && chart.canvas.$imkMount.parentNode) chart.resize();
    }
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () { window.requestAnimationFrame(resize); });
    } else resize();
  }

  function resizeAll() {
    Object.keys(instances).forEach(function (id) { resizeAfterMount(instances[id]); });
  }

  function upsertChart(el, tile, config, kind, statusMarkup) {
    var current = instances[tile.id];
    if (current && current.config.type !== config.type) {
      destroy(tile.id);
      current = null;
    }
    var canvas = current ? current.canvas : document.createElement("canvas");
    mountCanvas(el, canvas, kind, statusMarkup);
    if (!current) {
      current = new Chart(canvas, config);
      instances[tile.id] = current;
    } else {
      current.data = config.data;
      current.options = config.options;
      if (config.options.animation === false) current.update("none");
      else current.update();
    }
    current.$imkVisualType = tile.type;
    resizeAfterMount(current);
    return current;
  }

  function chartOptions(tile, disableAnimation) {
    var styles = getComputedStyle(document.body);
    var muted = styles.getPropertyValue("--muted").trim();
    var line = styles.getPropertyValue("--line").trim();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: disableAnimation ? false : { duration: 540, easing: "easeOutQuart" },
      interaction: { mode: "nearest", intersect: false },
      layout: { padding: { top: 4, right: 6, bottom: 2, left: 2 } },
      plugins: {
        legend: { display: !!tile.series || tile.type === "donut", position: tile.type === "donut" ? "right" : "top", labels: { color: muted, usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, padding: 14 } },
        tooltip: { backgroundColor: styles.getPropertyValue("--surface").trim(), titleColor: styles.getPropertyValue("--ink").trim(), bodyColor: muted, borderColor: line, borderWidth: 1, padding: 11, displayColors: true, boxPadding: 4, callbacks: { label: function (ctx) {
          var val = ctx.parsed;
          if (typeof val === "object") val = ctx.chart.options.indexAxis === "y" ? val.x : val.y;
          return (ctx.dataset.label ? ctx.dataset.label + ": " : "") + formatValue(tile, val);
        } } }
      },
      onClick: function (_, elements, chart) {
        if (!elements.length || tile.type === "scatter") return;
        var hit = elements[0];
        var label = tile.series ? chart.data.datasets[hit.datasetIndex].label : chart.data.labels[hit.index];
        IMK.Store.state.highlight = { field: tile.series || tile.dim, value: label };
        IMK.renderAll();
      },
      scales: tile.type === "donut" ? undefined : {
        x: { title: { display: true, text: tile.type === "hbar" ? tile.measure : tile.dim, color: muted }, ticks: { color: muted, maxRotation: 35, minRotation: 0 }, border: { color: line }, grid: { display: false } },
        y: { title: { display: true, text: tile.type === "hbar" ? tile.dim : (tile.measure || IMK.i18n.t("countRows")), color: muted }, beginAtZero: true, ticks: { color: muted, callback: function (v) { return IMK.i18n.number(v, { compact: true }); } }, border: { display: false }, grid: { color: line, lineWidth: 0.65 } }
      }
    };
  }

  function applyColors(tile, data) {
    data.datasets.forEach(function (ds, index) {
      if (tile.type === "line" || tile.type === "area" || tile.type === "combo") {
        ds.borderColor = color(tile, index);
        ds.backgroundColor = tile.type === "area" ? color(tile, index, 0.16) : color(tile, index, 0.06);
        ds.fill = tile.type === "area" ? "origin" : false;
        ds.tension = 0.38;
        ds.cubicInterpolationMode = "monotone";
        ds.borderWidth = 2.25;
        ds.pointRadius = 0;
        ds.pointHoverRadius = 4;
        ds.pointHitRadius = 12;
        ds.spanGaps = true;
      } else if (tile.type === "donut") {
        ds.backgroundColor = data.labels.map(function (_, i) { return color(tile, i); });
        ds.borderColor = getComputedStyle(document.body).getPropertyValue("--surface").trim();
        ds.borderWidth = 2;
      } else {
        ds.backgroundColor = color(tile, index, 0.82);
        ds.hoverBackgroundColor = color(tile, index, 0.96);
        ds.borderRadius = 5;
        ds.borderSkipped = false;
        ds.maxBarThickness = 46;
        ds.categoryPercentage = 0.72;
        ds.barPercentage = 0.82;
      }
    });
  }

  function renderCanvas(el, dataset, tile) {
    var summary = IMK.Query.summarize(dataset, tile);
    if (!summary.labels.length) {
      destroy(tile.id);
      el.innerHTML = "<div class='tile-empty'>" + IMK.i18n.t("emptyChart") + "</div>";
      return;
    }
    var data = { labels: summary.labels, datasets: summary.datasets };
    applyColors(tile, data);
    if (tile.type === "sbar") data.datasets.forEach(function (d) { d.stack = "s"; });
    var type = tile.type === "donut" ? "doughnut" : tile.type === "line" || tile.type === "area" ? "line" : "bar";
    var options = chartOptions(tile, disableMotion(summary.labels.length * data.datasets.length));
    if (tile.type === "hbar") options.indexAxis = "y";
    if (tile.type === "sbar") { options.scales.x.stacked = true; options.scales.y.stacked = true; }
    upsertChart(el, tile, { type: type, data: data, options: options });
  }

  function renderScatter(el, dataset, tile) {
    var rows = IMK.Query.filteredRows(dataset).filter(function (row) {
      return !Number.isNaN(Number(row[tile.dim])) && !Number.isNaN(Number(row[tile.measure]));
    }).slice(0, 2500);
    var groups = {};
    rows.forEach(function (row) {
      var key = tile.series ? String(row[tile.series] || IMK.i18n.t("blank")) : tile.measure;
      groups[key] = groups[key] || [];
      groups[key].push({ x: Number(row[tile.dim]), y: Number(row[tile.measure]) });
    });
    upsertChart(el, tile, {
      type: "scatter",
      data: { datasets: Object.keys(groups).map(function (key, index) { return { label: key, data: groups[key], backgroundColor: color(tile, index, 0.64), borderColor: color(tile, index), borderWidth: 1, pointRadius: 3, pointHoverRadius: 5 }; }) },
      options: (function () {
        var options = chartOptions(tile, disableMotion(rows.length));
        options.plugins.legend.display = !!tile.series;
        return options;
      })()
    });
  }

  function renderMap(el, dataset, tile) {
    var mapConfig = IMK.Map.config(dataset, tile, disableMotion(177));
    if (!mapConfig.prepared.matched.length) {
      destroy(tile.id);
      var details = mapConfig.prepared.unmatched.slice(0, 5).map(function (item) { return IMK.escape(item.label); }).join(", ");
      el.innerHTML = "<div class='tile-empty map-empty'><div><strong>" + IMK.i18n.t("mapNoMatches") + "</strong>" + (details ? "<small>" + details + "</small>" : "") + "</div></div>";
      return;
    }
    upsertChart(el, tile, mapConfig.chart, "map", IMK.Map.statusMarkup(mapConfig.prepared));
  }

  function renderTable(el, dataset, tile) {
    var rows = IMK.Query.filteredRows(dataset).slice(0, tile.topN || 50);
    var cols = dataset.columns.slice(0, 12);
    el.innerHTML = "<div class='table-scroll'><table><thead><tr>" + cols.map(function (c) { return "<th>" + IMK.escape(c.name) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (row) { return "<tr>" + cols.map(function (c) {
        var v = row[c.name];
        if (v instanceof Date) v = v.toLocaleDateString(IMK.i18n.locale());
        return "<td>" + IMK.escape(v == null ? "" : v) + "</td>";
      }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }

  function renderMatrix(el, dataset, tile) {
    var m = IMK.Query.matrix(dataset, tile);
    var html = "<div class='table-scroll'><table><thead><tr><th>" + IMK.escape(tile.dim + " \\ " + tile.dim2) + "</th>" + m.colKeys.map(function (c) { return "<th class='num'>" + IMK.escape(c) + "</th>"; }).join("") + "<th class='num'>" + IMK.i18n.t("total") + "</th></tr></thead><tbody>";
    m.rowKeys.forEach(function (rk) {
      var rowTotal = m.rows.filter(function (r) { return IMK.Query.dimValue(r, tile.dim, tile.granularity) === rk; });
      html += "<tr><td>" + IMK.escape(rk) + "</td>" + m.colKeys.map(function (ck) {
        var sub = rowTotal.filter(function (r) { return String(r[tile.dim2] || IMK.i18n.t("blank")) === ck; });
        return "<td class='num'>" + formatValue(tile, IMK.Measures.aggregate(sub, tile.measure, tile.agg)) + "</td>";
      }).join("") + "<td class='num strong'>" + formatValue(tile, IMK.Measures.aggregate(rowTotal, tile.measure, tile.agg)) + "</td></tr>";
    });
    html += "<tr class='total-row'><td>" + IMK.i18n.t("total") + "</td>" + m.colKeys.map(function (ck) {
      var sub = m.rows.filter(function (r) { return String(r[tile.dim2] || IMK.i18n.t("blank")) === ck; });
      return "<td class='num'>" + formatValue(tile, IMK.Measures.aggregate(sub, tile.measure, tile.agg)) + "</td>";
    }).join("") + "<td class='num'>" + formatValue(tile, IMK.Measures.aggregate(m.rows, tile.measure, tile.agg)) + "</td></tr></tbody></table></div>";
    el.innerHTML = html;
  }

  function renderKpi(el, dataset, tile) {
    var rows = IMK.Query.filteredRows(dataset);
    var value = IMK.Measures.aggregate(rows, tile.measure, tile.agg);
    el.innerHTML = "<div class='kpi-card'><span>" + IMK.escape(tile.measure || IMK.i18n.t("countRows")) + "</span><strong>" + formatValue(tile, value) + "</strong><small>" + (tile.agg || "count").toUpperCase() + "</small></div>";
  }

  IMK.Charts = {
    render: function (el, dataset, tile) {
      if (!dataset) { destroy(tile.id); el.innerHTML = "<div class='tile-empty'>" + IMK.i18n.t("noData") + "</div>"; return; }
      if (tile.type === "text") { destroy(tile.id); el.innerHTML = "<div class='note-tile'>" + IMK.escape(tile.text || "Insight") + "</div>"; return; }
      if (tile.type === "kpi") { destroy(tile.id); return renderKpi(el, dataset, tile); }
      if (tile.type === "table") { destroy(tile.id); return renderTable(el, dataset, tile); }
      if (tile.type === "matrix") { destroy(tile.id); return renderMatrix(el, dataset, tile); }
      if (tile.type === "map") return renderMap(el, dataset, tile);
      if (tile.type === "scatter") return renderScatter(el, dataset, tile);
      return renderCanvas(el, dataset, tile);
    },
    destroy: destroy,
    detachAll: detachAll,
    prune: prune,
    resizeAll: resizeAll,
    reducedMotion: reducedMotion,
    instances: instances
  };

  if (window.addEventListener) window.addEventListener("resize", resizeAll);
})();
