(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  IMK.Pages = {
    renderTabs: function () {
      var tabs = document.getElementById("pageTabs");
      tabs.innerHTML = "";
      IMK.Store.state.pages.forEach(function (page) {
        var btn = document.createElement("button");
        btn.className = "page-tab " + (page.id === IMK.Store.state.activePageId ? "active" : "");
        btn.textContent = page.name;
        btn.onclick = function () { IMK.Store.state.activePageId = page.id; IMK.renderAll(); };
        tabs.appendChild(btn);
      });

      var actions = document.createElement("span");
      actions.className = "page-actions";
      var add = document.createElement("button");
      add.className = "icon-btn";
      add.title = "New page";
      add.setAttribute("aria-label", "New page");
      add.innerHTML = IMK.Icons.markup("plus", "New page");
      add.onclick = function () { IMK.Store.addPage(); IMK.renderAll(); };
      actions.appendChild(add);

      var rename = document.createElement("button");
      rename.className = "icon-btn";
      rename.title = "Rename page";
      rename.setAttribute("aria-label", "Rename page");
      rename.innerHTML = IMK.Icons.markup("pencil", "Rename page");
      rename.onclick = function () {
        var page = IMK.Store.activePage();
        var name = prompt("Page name", page.name);
        if (name && name.trim()) { page.name = name.trim(); IMK.renderAll(); }
      };
      actions.appendChild(rename);

      var remove = document.createElement("button");
      remove.className = "icon-btn danger";
      remove.title = IMK.Store.state.pages.length > 1 ? "Delete page" : "A report must keep one page";
      remove.setAttribute("aria-label", "Delete page");
      remove.disabled = IMK.Store.state.pages.length <= 1;
      remove.innerHTML = IMK.Icons.markup("trash-2", "Delete page");
      remove.onclick = function () {
        var page = IMK.Store.activePage();
        if (confirm("Delete page " + page.name + "?")) {
          IMK.Store.removePage(page.id);
          IMK.renderAll();
        }
      };
      actions.appendChild(remove);
      tabs.appendChild(actions);
    }
  };
})();
