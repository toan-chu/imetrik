(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  var grid = null;
  var mobileViewport = window.innerWidth <= 700;
  var resizeTimer = null;

  IMK.Layout = {
    init: function () {
      if (grid) grid.destroy(false);
      document.getElementById("pageCanvas").innerHTML = "";
      grid = GridStack.init({
        column: 12,
        columnOpts: { breakpoints: [{ w: 700, c: 1, layout: "list" }], layout: "moveScale" },
        cellHeight: 72,
        margin: 7,
        float: false,
        animate: true,
        draggable: { handle: ".drag-handle" },
        resizable: { handles: "e,se,s,sw,w" }
      }, "#pageCanvas");
      grid.on("change", function (_, items) {
        if (document.body.classList.contains("exporting") || grid.getColumn() !== 12) return;
        var page = IMK.Store.activePage();
        items.forEach(function (item) {
          var tile = page.tiles.find(function (t) { return t.id === item.el.dataset.tileId; });
          if (tile) tile.layout = { x: item.x, y: item.y, w: item.w, h: item.h };
        });
      });
      return grid;
    },
    grid: function () { return grid; }
  };

  window.addEventListener("resize", function () {
    var nextMobileViewport = window.innerWidth <= 700;
    if (nextMobileViewport === mobileViewport) return;
    mobileViewport = nextMobileViewport;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!document.body.classList.contains("exporting") && IMK.renderAll) IMK.renderAll();
    }, 80);
  });
})();
