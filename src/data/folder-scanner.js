(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var DB_NAME = "imetrik-handles";
  var timer = null;
  var dirHandle = null;
  var lastSeen = {};

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore("handles"); };
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () { resolve(req.result); };
    });
  }

  async function saveHandle(handle) {
    var db = await openDb();
    var tx = db.transaction("handles", "readwrite");
    tx.objectStore("handles").put(handle, "reports");
  }

  async function savedHandle() {
    var db = await openDb();
    return new Promise(function (resolve, reject) {
      var req = db.transaction("handles", "readonly").objectStore("handles").get("reports");
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error); };
    });
  }

  async function restoreSaved(onFiles, requestPermission) {
    var handle = await savedHandle();
    if (!handle) return false;
    var permission = await handle.queryPermission({ mode: "read" });
    if (permission !== "granted" && requestPermission && permission === "prompt") permission = await handle.requestPermission({ mode: "read" });
    if (permission !== "granted") return false;
    dirHandle = handle;
    await refresh(onFiles, true);
    startPolling(onFiles);
    return true;
  }

  async function scan(handle) {
    var files = [];
    for await (var entry of handle.values()) {
      if (entry.kind === "file" && /\.(xlsx|xls|csv)$/i.test(entry.name)) {
        var file = await entry.getFile();
        files.push(file);
      }
    }
    return files;
  }

  async function chooseFolder(onFiles) {
    if (!window.showDirectoryPicker) throw new Error(IMK.i18n.t("folderUnsupported"));
    dirHandle = await window.showDirectoryPicker({ mode: "read" });
    await saveHandle(dirHandle);
    lastSeen = {};
    return refresh(onFiles, true);
  }

  async function refresh(onFiles, force) {
    if (!dirHandle) return [];
    var files = await scan(dirHandle);
    var changed = force || files.some(function (file) { return lastSeen[file.name] !== file.lastModified; });
    files.forEach(function (file) { lastSeen[file.name] = file.lastModified; });
    if (changed && onFiles) await onFiles(files);
    var el = document.getElementById("folderStatus");
    if (el) el.textContent = IMK.i18n.t("folderUpdated") + " " + IMK.i18n.time(new Date());
    return files;
  }

  function startPolling(onFiles) {
    clearInterval(timer);
    timer = setInterval(function () { refresh(onFiles, false).catch(function (err) { IMK.toast(IMK.errorMessage ? IMK.errorMessage(err) : err.message, "err"); }); }, window.APP_CONFIG.POLL_MS);
  }

  IMK.FolderScanner = { chooseFolder: chooseFolder, restoreSaved: restoreSaved, startPolling: startPolling, refresh: refresh };
})();
