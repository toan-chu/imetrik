(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  IMK.Pages = {
    renderTabs: function () {
      var tabs = document.getElementById("pageTabs");
      tabs.innerHTML = "";
      IMK.Store.state.pages.forEach(function (page) {
        var btn = document.createElement("button");
        btn.className = page.id === IMK.Store.state.activePageId ? "active" : "";
        btn.textContent = page.name;
        btn.onclick = function () { IMK.Store.state.activePageId = page.id; IMK.renderAll(); };
        btn.ondblclick = function () {
          var name = prompt("Page name", page.name);
          if (name) { page.name = name.trim(); IMK.renderAll(); }
        };
        btn.oncontextmenu = function (event) {
          event.preventDefault();
          if (confirm("Delete page " + page.name + "?")) {
            IMK.Store.removePage(page.id);
            IMK.renderAll();
          }
        };
        tabs.appendChild(btn);
      });
      var add = document.createElement("button");
      add.className = "add-page";
      add.textContent = "+";
      add.onclick = function () { IMK.Store.addPage(); IMK.renderAll(); };
      tabs.appendChild(add);
    }
  };
})();
