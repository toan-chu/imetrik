(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  function render() {
    var dataset = IMK.Store.activeDataset();
    var box = document.getElementById("slicerList");
    box.innerHTML = "";
    if (!dataset) return;
    dataset.columns.forEach(function (col) {
      if (col.type === "text" || col.type === "boolean") {
        if (col.uniq > 80) return;
        renderSet(box, dataset, col);
      } else if (col.type === "date") {
        renderDate(box, col);
      }
    });
  }

  function renderSet(box, dataset, col) {
    var values = Array.from(new Set(dataset.rows.map(function (row) {
      var v = row[col.name];
      return String(v == null || v === "" ? IMK.i18n.t("blank") : v);
    }))).sort().slice(0, 200);
    var filter = IMK.Store.state.filters[col.name] || { kind: "set", values: [], active: false };
    var wrap = document.createElement("details");
    wrap.className = "slicer";
    wrap.innerHTML = "<summary>" + IMK.escape(col.name) + (filter.active ? " <b>" + filter.values.length + "</b>" : "") + "</summary><div class='slicer-options'></div>";
    var opts = wrap.querySelector(".slicer-options");
    values.forEach(function (value) {
      var id = "sl_" + col.name + "_" + value;
      var label = document.createElement("label");
      label.innerHTML = "<input type='checkbox' " + (filter.values.indexOf(value) >= 0 ? "checked" : "") + "> <span>" + IMK.escape(value) + "</span>";
      label.querySelector("input").onchange = function (event) {
        var next = filter.values.slice();
        if (event.target.checked && next.indexOf(value) < 0) next.push(value);
        if (!event.target.checked) next = next.filter(function (v) { return v !== value; });
        IMK.Store.state.filters[col.name] = { kind: "set", values: next, active: next.length > 0 };
        IMK.renderAll();
      };
      label.setAttribute("for", id);
      opts.appendChild(label);
    });
    box.appendChild(wrap);
  }

  function renderDate(box, col) {
    var filter = IMK.Store.state.filters[col.name] || { kind: "range", from: null, to: null, active: false };
    var wrap = document.createElement("details");
    wrap.className = "slicer";
    wrap.innerHTML = "<summary>" + IMK.escape(col.name) + (filter.active ? " <b>✓</b>" : "") + "</summary><div class='range-row'><input type='date'><input type='date'></div>";
    var inputs = wrap.querySelectorAll("input");
    if (filter.from) inputs[0].valueAsDate = filter.from;
    if (filter.to) inputs[1].valueAsDate = filter.to;
    function update() {
      IMK.Store.state.filters[col.name] = { kind: "range", from: inputs[0].valueAsDate, to: inputs[1].valueAsDate, active: !!(inputs[0].value || inputs[1].value) };
      IMK.renderAll();
    }
    inputs[0].onchange = update;
    inputs[1].onchange = update;
    box.appendChild(wrap);
  }

  IMK.Slicers = { render: render };
})();
