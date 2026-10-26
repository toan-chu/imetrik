(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  function openPageDialog(mode, page) {
    var dialog = document.getElementById("pageDialog");
    return new Promise(function (resolve) {
      var settled = false;
      function finish(value) {
        if (settled) return;
        settled = true;
        dialog.close();
        resolve(value);
      }
      var rename = mode === "rename";
      dialog.innerHTML = "<form method='dialog'><div class='dialog-head'><div><h2 id='pageDialogTitle'>" + IMK.i18n.t(rename ? "pageRename" : "pageDelete") + "</h2><p>" + (rename ? IMK.i18n.t("pageName") : IMK.i18n.t("pageDeleteConfirm") + " " + IMK.escape(page.name)) + "</p></div><button type='button' class='icon-btn cancel-page' aria-label='" + IMK.i18n.t("cancel") + "'>" + IMK.Icons.markup("x", IMK.i18n.t("cancel")) + "</button></div>" +
        (rename ? "<label class='dialog-field'>" + IMK.i18n.t("pageName") + "<input id='pageNameInput' value='" + IMK.escape(page.name) + "' maxlength='80'></label>" : "") +
        "<div class='dialog-actions'><button type='button' class='btn cancel-page'>" + IMK.i18n.t("cancel") + "</button><button type='button' class='btn " + (rename ? "accent" : "danger-btn") + " confirm-page'>" + IMK.i18n.t(rename ? "save" : "delete") + "</button></div></form>";
      dialog.querySelectorAll(".cancel-page").forEach(function (button) { button.onclick = function () { finish(null); }; });
      dialog.querySelector(".confirm-page").onclick = function () {
        if (!rename) return finish(true);
        var value = dialog.querySelector("#pageNameInput").value.trim();
        if (value) finish(value);
      };
      dialog.oncancel = function (event) { event.preventDefault(); finish(null); };
      IMK.Icons.refresh();
      dialog.showModal();
      if (rename) {
        var input = dialog.querySelector("#pageNameInput");
        input.focus();
        input.select();
      }
    });
  }

  IMK.Pages = {
    renderTabs: function () {
      var tabs = document.getElementById("pageTabs");
      tabs.innerHTML = "";
      IMK.Store.state.pages.forEach(function (page) {
        var btn = document.createElement("button");
        btn.className = "page-tab " + (page.id === IMK.Store.state.activePageId ? "active" : "");
        btn.textContent = page.name;
        btn.onclick = function () { IMK.Store.state.activePageId = page.id; IMK.Store.state.activeTileId = null; document.getElementById("inspector").hidden = true; IMK.renderAll(); };
        tabs.appendChild(btn);
      });

      var actions = document.createElement("span");
      actions.className = "page-actions";
      var add = document.createElement("button");
      add.className = "icon-btn";
      add.title = IMK.i18n.t("pageNew");
      add.setAttribute("aria-label", IMK.i18n.t("pageNew"));
      add.innerHTML = IMK.Icons.markup("plus", IMK.i18n.t("pageNew"));
      add.onclick = function () { IMK.Store.addPage(IMK.i18n.t("page") + " " + (IMK.Store.state.pages.length + 1)); IMK.renderAll(); };
      actions.appendChild(add);

      var rename = document.createElement("button");
      rename.className = "icon-btn";
      rename.title = IMK.i18n.t("pageRename");
      rename.setAttribute("aria-label", IMK.i18n.t("pageRename"));
      rename.innerHTML = IMK.Icons.markup("pencil", IMK.i18n.t("pageRename"));
      rename.onclick = async function () {
        var page = IMK.Store.activePage();
        var name = await openPageDialog("rename", page);
        if (name) { page.name = name; IMK.renderAll(); }
      };
      actions.appendChild(rename);

      var remove = document.createElement("button");
      remove.className = "icon-btn danger";
      remove.title = IMK.Store.state.pages.length > 1 ? IMK.i18n.t("pageDelete") : IMK.i18n.t("pageKeepOne");
      remove.setAttribute("aria-label", IMK.i18n.t("pageDelete"));
      remove.disabled = IMK.Store.state.pages.length <= 1;
      remove.innerHTML = IMK.Icons.markup("trash-2", IMK.i18n.t("pageDelete"));
      remove.onclick = async function () {
        var page = IMK.Store.activePage();
        if (await openPageDialog("delete", page)) {
          IMK.Store.removePage(page.id);
          IMK.Store.state.activeTileId = null;
          document.getElementById("inspector").hidden = true;
          IMK.renderAll();
        }
      };
      actions.appendChild(remove);
      tabs.appendChild(actions);
    }
  };
})();
