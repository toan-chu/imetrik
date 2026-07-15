(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};

  function fileName(ext) {
    return (IMK.Store.state.reportName || "imetrik-report").replace(/[^\w-]+/g, "-") + "." + ext;
  }

  async function pageCanvas(page) {
    var current = IMK.Store.state.activePageId;
    IMK.Store.state.activePageId = page.id;
    IMK.renderAll();
    await new Promise(function (r) { setTimeout(r, 180); });
    var canvas = await html2canvas(document.getElementById("board"), { scale: 2, backgroundColor: getComputedStyle(document.body).backgroundColor });
    IMK.Store.state.activePageId = current;
    IMK.renderAll();
    return canvas;
  }

  function downloadCanvas(canvas, name) {
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = name;
    a.click();
  }

  IMK.Export = {
    png: async function () {
      var canvas = await html2canvas(document.getElementById("board"), { scale: 2, backgroundColor: getComputedStyle(document.body).backgroundColor });
      downloadCanvas(canvas, fileName("png"));
    },
    pdf: async function () {
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });
      for (var i = 0; i < IMK.Store.state.pages.length; i++) {
        var canvas = await pageCanvas(IMK.Store.state.pages[i]);
        if (i) pdf.addPage([1280, 720], "landscape");
        var r = Math.min(1280 / canvas.width, 720 / canvas.height);
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", (1280 - canvas.width * r) / 2, (720 - canvas.height * r) / 2, canvas.width * r, canvas.height * r);
      }
      pdf.save(fileName("pdf"));
    }
  };
})();
