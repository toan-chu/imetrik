(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var reportDirHandle = null;

  function downloadJson(data, name) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function save() {
    var report = IMK.Store.serialize();
    if (window.showDirectoryPicker && !reportDirHandle) {
      try { reportDirHandle = await window.showDirectoryPicker({ mode: "readwrite" }); } catch (_) {}
    }
    if (reportDirHandle) {
      var file = await reportDirHandle.getFileHandle((IMK.Store.state.reportName || "report").replace(/[^\w-]+/g, "-") + ".json", { create: true });
      var writable = await file.createWritable();
      await writable.write(JSON.stringify(report, null, 2));
      await writable.close();
      IMK.toast("Report saved");
    } else {
      downloadJson(report, "imetrik-report.json");
    }
  }

  async function loadFile(file) {
    var text = await file.text();
    IMK.Store.applyReport(JSON.parse(text));
    IMK.renderAll();
  }

  async function chooseReportsFolder() {
    if (!window.showDirectoryPicker) throw new Error(IMK.i18n.t("folderUnsupported"));
    reportDirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    var box = document.getElementById("presetList");
    box.innerHTML = "";
    for await (var entry of reportDirHandle.values()) {
      if (entry.kind === "file" && /\.json$/i.test(entry.name)) {
        var btn = document.createElement("button");
        btn.textContent = entry.name.replace(/\.json$/i, "");
        btn.onclick = async function (name) {
          var fh = await reportDirHandle.getFileHandle(name);
          await loadFile(await fh.getFile());
        }.bind(null, entry.name);
        box.appendChild(btn);
      }
    }
  }

  IMK.ReportIO = { save: save, loadFile: loadFile, chooseReportsFolder: chooseReportsFolder };
})();
