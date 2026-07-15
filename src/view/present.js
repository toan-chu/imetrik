(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var editorScrollY = 0;

  function restoreEditorScroll() {
    window.requestAnimationFrame(function () { window.scrollTo(0, editorScrollY); });
  }

  IMK.Present = {
    start: function () {
      if (document.body.classList.contains("presenting")) return;
      editorScrollY = window.scrollY;
      document.body.classList.add("presenting");
      var board = document.getElementById("board");
      board.scrollTop = 0;
      if (board.requestFullscreen) {
        var request = board.requestFullscreen();
        if (request && request.catch) request.catch(function () {});
      }
    },
    stop: function (skipFullscreenExit) {
      if (!document.body.classList.contains("presenting")) return;
      document.body.classList.remove("presenting");
      if (!skipFullscreenExit && document.fullscreenElement && document.exitFullscreen) {
        var exit = document.exitFullscreen();
        if (exit && exit.catch) exit.catch(function () {});
      }
      restoreEditorScroll();
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
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      document.getElementById("board").scrollBy({ top: Math.round(window.innerHeight * 0.8), behavior: "smooth" });
    }
    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      document.getElementById("board").scrollBy({ top: -Math.round(window.innerHeight * 0.8), behavior: "smooth" });
    }
  });

  document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && document.body.classList.contains("presenting")) IMK.Present.stop(true);
  });
})();
