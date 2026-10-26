(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var featureCache = null;
  var featureIndex = null;

  var aliases = {
    "us": "united states of america",
    "u s": "united states of america",
    "usa": "united states of america",
    "united states": "united states of america",
    "america": "united states of america",
    "hoa ky": "united states of america",
    "my": "united states of america",
    "uk": "united kingdom",
    "u k": "united kingdom",
    "great britain": "united kingdom",
    "viet nam": "vietnam",
    "vn": "vietnam",
    "russian federation": "russia",
    "south korea republic of korea": "south korea",
    "republic of korea": "south korea",
    "korea south": "south korea",
    "north korea democratic peoples republic of korea": "north korea",
    "czech republic": "czechia",
    "lao pdr": "laos",
    "lao peoples democratic republic": "laos",
    "burma": "myanmar",
    "ivory coast": "cote d ivoire",
    "democratic republic of the congo": "dem rep congo",
    "dr congo": "dem rep congo",
    "drc": "dem rep congo",
    "dominican republic": "dominican rep",
    "central african republic": "central african rep",
    "united republic of tanzania": "tanzania",
    "syrian arab republic": "syria",
    "iran islamic republic of": "iran",
    "bolivia plurinational state of": "bolivia",
    "venezuela bolivarian republic of": "venezuela"
  };

  function normalize(value) {
    var text = String(value == null ? "" : value).trim().toLowerCase();
    if (text.normalize) text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return text.replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  }

  function loadFeatures() {
    if (featureCache) return featureCache;
    if (!window.ChartGeo || !window.ChartGeo.topojson || !window.IMK_WORLD_ATLAS || !window.IMK_WORLD_ATLAS.objects) {
      throw new Error("Offline world map assets are unavailable.");
    }
    featureCache = window.ChartGeo.topojson.feature(window.IMK_WORLD_ATLAS, window.IMK_WORLD_ATLAS.objects.countries).features;
    featureIndex = {};
    featureCache.forEach(function (feature) {
      featureIndex[normalize(feature.properties && feature.properties.name)] = feature;
      if (feature.id != null) featureIndex[String(feature.id).padStart(3, "0")] = feature;
    });
    return featureCache;
  }

  function resolve(value) {
    loadFeatures();
    var key = normalize(value);
    if (!key) return null;
    if (/^\d{1,3}$/.test(key)) key = key.padStart(3, "0");
    key = aliases[key] || key;
    return featureIndex[key] || null;
  }

  function formatValue(tile, value) {
    if (tile.agg === "pct") return IMK.i18n.percent(value);
    if (tile.currency) return IMK.i18n.money(value, tile.currency);
    return IMK.i18n.number(value, { compact: true });
  }

  function hexToRgb(hex) {
    var value = String(hex || "#277DA1").replace("#", "");
    if (value.length === 3) value = value.split("").map(function (part) { return part + part; }).join("");
    var number = parseInt(value, 16);
    return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
  }

  function mix(start, end, ratio) {
    var a = hexToRgb(start);
    var b = hexToRgb(end);
    var t = Math.max(0, Math.min(1, ratio));
    return "rgb(" + Math.round(a.r + (b.r - a.r) * t) + "," + Math.round(a.g + (b.g - a.g) * t) + "," + Math.round(a.b + (b.b - a.b) * t) + ")";
  }

  function prepare(dataset, tile) {
    var features = loadFeatures();
    var buckets = {};
    var sourceLabels = {};
    var unmatchedCounts = {};

    IMK.Query.filteredRows(dataset).forEach(function (row) {
      var rawValue = row[tile.dim];
      var rawLabel = String(rawValue == null || rawValue === "" ? IMK.i18n.t("blank") : rawValue);
      var feature = resolve(rawValue);
      if (!feature) {
        unmatchedCounts[rawLabel] = (unmatchedCounts[rawLabel] || 0) + 1;
        return;
      }
      var id = String(feature.id);
      buckets[id] = buckets[id] || [];
      buckets[id].push(row);
      sourceLabels[id] = sourceLabels[id] || [];
      if (sourceLabels[id].indexOf(rawLabel) < 0) sourceLabels[id].push(rawLabel);
    });

    var data = features.map(function (feature) {
      var rows = buckets[String(feature.id)] || [];
      var value = rows.length ? IMK.Measures.aggregate(rows, tile.measure, tile.agg) : NaN;
      return {
        feature: feature,
        value: Number.isFinite(Number(value)) ? Number(value) : NaN,
        sourceLabels: sourceLabels[String(feature.id)] || []
      };
    });
    var matched = data.filter(function (item) { return item.sourceLabels.length > 0; });
    var unmatched = Object.keys(unmatchedCounts).map(function (label) {
      return { label: label, count: unmatchedCounts[label] };
    }).sort(function (a, b) { return b.count - a.count || a.label.localeCompare(b.label); });

    return { features: features, data: data, matched: matched, unmatched: unmatched };
  }

  function config(dataset, tile, disableAnimation) {
    var prepared = prepare(dataset, tile);
    var styles = getComputedStyle(document.body);
    var theme = IMK.Store.state.theme === "dark" ? "dark" : "light";
    var paletteKey = tile.palette && window.APP_CONFIG.VISUAL_PALETTES[tile.palette] ? tile.palette : "ocean";
    var target = window.APP_CONFIG.VISUAL_PALETTES[paletteKey][theme][0];
    var start = theme === "dark" ? "#273238" : "#EAF3F8";
    var missing = styles.getPropertyValue("--surface-2").trim();
    var line = styles.getPropertyValue("--line").trim();
    var muted = styles.getPropertyValue("--muted").trim();
    var surface = styles.getPropertyValue("--surface").trim();

    return {
      prepared: prepared,
      chart: {
        type: "choropleth",
        data: {
          labels: prepared.data.map(function (item) { return item.feature.properties.name; }),
          datasets: [{
            label: tile.measure || IMK.i18n.t("countRows"),
            data: prepared.data,
            borderColor: line,
            borderWidth: 0.65,
            hoverBorderColor: target,
            hoverBorderWidth: 1.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: disableAnimation ? false : { duration: 560, easing: "easeOutQuart" },
          layout: { padding: { top: 8, right: 10, bottom: 18, left: 24 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              filter: function (context) { return Number.isFinite(Number(context.raw && context.raw.value)); },
              backgroundColor: surface,
              titleColor: styles.getPropertyValue("--ink").trim(),
              bodyColor: muted,
              borderColor: line,
              borderWidth: 1,
              padding: 11,
              displayColors: false,
              callbacks: {
                title: function (items) { return items.length ? items[0].raw.feature.properties.name : ""; },
                label: function (context) { return formatValue(tile, context.raw.value); },
                afterLabel: function () { return IMK.i18n.t("mapClickHint"); }
              }
            }
          },
          onClick: function (_, elements, chart) {
            if (!elements.length) return;
            var raw = chart.data.datasets[elements[0].datasetIndex].data[elements[0].index];
            if (!raw || !raw.sourceLabels || !raw.sourceLabels.length) return;
            IMK.Store.state.filters[tile.dim] = { kind: "set", values: raw.sourceLabels.slice(), active: true };
            IMK.renderAll();
          },
          scales: {
            projection: { axis: "x", projection: "equalEarth" },
            color: {
              axis: "x",
              display: true,
              interpolate: function (value) { return mix(start, target, 0.2 + value * 0.8); },
              missing: missing,
              quantize: 5,
              ticks: { color: muted, font: { size: 9 }, callback: function (value) { return IMK.i18n.number(value, { compact: true }); } },
              legend: { position: "bottom-left", align: "bottom", length: 0.3, width: 32, indicatorWidth: 8, margin: 10 }
            }
          }
        }
      }
    };
  }

  function statusMarkup(prepared) {
    var summary = "<span><strong>" + IMK.i18n.number(prepared.matched.length) + "</strong> " + IMK.i18n.t("mapMatched") + "</span>";
    if (!prepared.unmatched.length) return summary;
    var labels = prepared.unmatched.slice(0, 4).map(function (item) { return IMK.escape(item.label); }).join(", ");
    var remaining = prepared.unmatched.length > 4 ? " +" + (prepared.unmatched.length - 4) : "";
    return summary + "<span class='map-unmatched'><strong>" + IMK.i18n.number(prepared.unmatched.length) + "</strong> " + IMK.i18n.t("mapUnmatched") + ": " + labels + remaining + "</span>";
  }

  IMK.Map = { normalize: normalize, resolve: resolve, prepare: prepare, config: config, statusMarkup: statusMarkup };
})();
