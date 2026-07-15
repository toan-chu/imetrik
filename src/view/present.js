(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  IMK.Present = {
    start: function () {
      document.body.classList.add("presenting");
      var board = document.getElementById("board");
      if (board.requestFullscreen) board.requestFullscreen();
    },
    stop: function () {
      document.body.classList.remove("presenting");
      if (document.fullscreenElement) document.exitFullscreen();
    },
    next: function (dir) {
      var state = IMK.Store.state;
      var idx = state.pages.findIndex(function (p) { return p.id === state.activePageId; });
      idx = Math.max(0, Math.min(state.pages.length - 1, idx + dir));
      state.activePageId = state.pages[idx].id;
      IMK.renderAll();
    }
  };

  document.addEventListener("keydown", function (event) {
    if (!document.body.classList.contains("presenting")) return;
    if (event.key === "Escape") IMK.Present.stop();
    if (event.key === "ArrowRight") IMK.Present.next(1);
    if (event.key === "ArrowLeft") IMK.Present.next(-1);
  });
})();
