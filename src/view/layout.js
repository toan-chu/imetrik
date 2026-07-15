(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  var grid = null;

  IMK.Layout = {
    init: function () {
      if (grid) grid.destroy(false);
      grid = GridStack.init({
        column: 12,
        cellHeight: 76,
        margin: 8,
        float: false,
        animate: true,
        draggable: { handle: ".tile-header" },
        resizable: { handles: "e,se,s,sw,w" }
      }, "#pageCanvas");
      grid.on("change", function (_, items) {
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
})();
