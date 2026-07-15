(function () {
  "use strict";
  var IMK = window.IMK = window.IMK || {};
  var PAGE_WIDTH = 297;
  var PAGE_HEIGHT = 210;
  var MARGIN = 10;
  var CONTENT_TOP = 27;
  var CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  var CONTENT_HEIGHT = 169;
  var logoCanvasPromise = null;

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function fileName(ext) {
    return (IMK.Store.state.reportName || "imetrik-report").replace(/[^\w-]+/g, "-") + "." + ext;
  }

  function snapshotLayouts() {
    var layouts = {};
    IMK.Store.state.pages.forEach(function (page) {
      page.tiles.forEach(function (tile) {
        layouts[tile.id] = Object.assign({}, tile.layout);
      });
    });
    return layouts;
  }

  function restoreLayouts(layouts) {
    IMK.Store.state.pages.forEach(function (page) {
      page.tiles.forEach(function (tile) {
        if (layouts[tile.id]) tile.layout = Object.assign({}, layouts[tile.id]);
      });
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Could not load report logo")); };
      image.src = src;
    });
  }

  async function croppedLogoCanvas() {
    if (logoCanvasPromise) return logoCanvasPromise;
    logoCanvasPromise = (async function () {
      var image = await loadImage(window.IMK_LOGO_DATA || window.APP_CONFIG.LOGO);
      var source = document.createElement("canvas");
      source.width = image.naturalWidth;
      source.height = image.naturalHeight;
      var sourceContext = source.getContext("2d");
      sourceContext.drawImage(image, 0, 0);
      var pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
      var left = source.width;
      var right = 0;
      var top = source.height;
      var bottom = 0;
      for (var y = 0; y < source.height; y++) {
        for (var x = 0; x < source.width; x++) {
          if (pixels[(y * source.width + x) * 4 + 3] < 8) continue;
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
      var cropped = document.createElement("canvas");
      cropped.width = Math.max(1, right - left + 1);
      cropped.height = Math.max(1, bottom - top + 1);
      cropped.getContext("2d").drawImage(source, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      return cropped;
    })();
    return logoCanvasPromise;
  }

  async function headerCanvas(page, continued) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    var logo = await croppedLogoCanvas();
    var canvas = document.createElement("canvas");
    canvas.width = 2200;
    canvas.height = 136;
    var context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var logoWidth = 300;
    var logoHeight = logoWidth * logo.height / logo.width;
    context.drawImage(logo, 0, 28, logoWidth, logoHeight);
    context.fillStyle = "#DDE3E4";
    context.fillRect(336, 20, 2, 78);
    context.fillStyle = "#303841";
    context.font = "700 31px 'Quicksand', sans-serif";
    context.fillText(IMK.Store.state.reportName || "iMetriK report", 374, 52);
    context.fillStyle = "#69747A";
    context.font = "500 22px 'Montserrat', sans-serif";
    context.fillText(page.name + (continued ? " - continued" : ""), 374, 87);
    context.fillStyle = "#FF5722";
    context.fillRect(0, 124, canvas.width, 4);
    return canvas;
  }

  async function capturePage(page) {
    document.body.classList.add("exporting");
    IMK.Store.state.activePageId = page.id;
    IMK.renderAll();
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await wait(260);

    var board = document.getElementById("board");
    var boardRect = board.getBoundingClientRect();
    var tileSpans = Array.from(board.querySelectorAll(".grid-stack-item")).map(function (item) {
      var rect = item.getBoundingClientRect();
      return { top: rect.top - boardRect.top, bottom: rect.bottom - boardRect.top };
    });
    try {
      var canvas = await html2canvas(board, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      });
      var renderedScale = canvas.width / boardRect.width;
      if (tileSpans.length) {
        var contentBottom = Math.max.apply(null, tileSpans.map(function (span) { return span.bottom; }));
        var croppedHeight = Math.min(canvas.height, Math.ceil((contentBottom + 8) * renderedScale));
        if (croppedHeight < canvas.height) {
          var cropped = document.createElement("canvas");
          cropped.width = canvas.width;
          cropped.height = croppedHeight;
          cropped.getContext("2d").drawImage(canvas, 0, 0);
          canvas = cropped;
        }
      }
      return {
        canvas: canvas,
        spans: tileSpans.map(function (span) {
          return { top: Math.round(span.top * renderedScale), bottom: Math.round(span.bottom * renderedScale) };
        })
      };
    } finally {
      document.body.classList.remove("exporting");
    }
  }

  function nextBreak(spans, start, maximum, total) {
    if (total <= maximum) return total;
    var candidates = spans.map(function (span) { return span.bottom; }).filter(function (bottom) {
      return bottom > start + 120 && bottom <= maximum;
    }).sort(function (a, b) { return b - a; });
    var safe = candidates.find(function (candidate) {
      return !spans.some(function (span) { return span.top + 4 < candidate && span.bottom - 4 > candidate; });
    });
    return safe || maximum;
  }

  function sliceCanvas(source, top, height) {
    var slice = document.createElement("canvas");
    slice.width = source.width;
    slice.height = height;
    var context = slice.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, slice.width, slice.height);
    context.drawImage(source, 0, top, source.width, height, 0, 0, source.width, height);
    return slice;
  }

  function downloadCanvas(canvas, name) {
    var link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = name;
    link.click();
  }

  function downloadBlob(blob, name) {
    if (!blob || blob.size < 1024) throw new Error(IMK.i18n.t("operationFailed"));
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
      link.remove();
    }, 30000);
    return { name: name, size: blob.size };
  }

  IMK.Export = {
    png: async function () {
      var current = IMK.Store.state.activePageId;
      var layouts = snapshotLayouts();
      try {
        var capture = await capturePage(IMK.Store.activePage());
        downloadCanvas(capture.canvas, fileName("png"));
      } finally {
        restoreLayouts(layouts);
        IMK.Store.state.activePageId = current;
        IMK.renderAll();
      }
    },
    pdf: async function () {
      var current = IMK.Store.state.activePageId;
      var layouts = snapshotLayouts();
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      var firstPhysicalPage = true;
      var physicalPageNumber = 0;
      try {
        for (var i = 0; i < IMK.Store.state.pages.length; i++) {
          var page = IMK.Store.state.pages[i];
          var capture = await capturePage(page);
          var maximumSlice = Math.floor(capture.canvas.width * CONTENT_HEIGHT / CONTENT_WIDTH);
          var top = 0;
          var continuation = false;
          while (top < capture.canvas.height) {
            var bottom = nextBreak(capture.spans, top, Math.min(top + maximumSlice, capture.canvas.height), capture.canvas.height);
            if (bottom <= top) bottom = Math.min(top + maximumSlice, capture.canvas.height);
            if (!firstPhysicalPage) pdf.addPage("a4", "landscape");
            firstPhysicalPage = false;
            physicalPageNumber += 1;
            var header = await headerCanvas(page, continuation);
            pdf.addImage(header.toDataURL("image/png"), "PNG", MARGIN, 6, CONTENT_WIDTH, 17, "header-" + physicalPageNumber, "FAST");
            var slice = sliceCanvas(capture.canvas, top, bottom - top);
            var imageHeight = slice.height / slice.width * CONTENT_WIDTH;
            pdf.addImage(slice.toDataURL("image/png"), "PNG", MARGIN, CONTENT_TOP, CONTENT_WIDTH, imageHeight, undefined, "FAST");
            pdf.setDrawColor(216, 226, 229);
            pdf.line(MARGIN, PAGE_HEIGHT - 9, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9);
            pdf.setTextColor(101, 119, 124);
            pdf.setFontSize(8);
            pdf.text(String(physicalPageNumber), PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 5, { align: "right" });
            top = bottom;
            continuation = true;
          }
        }
        return downloadBlob(pdf.output("blob"), fileName("pdf"));
      } finally {
        document.body.classList.remove("exporting");
        restoreLayouts(layouts);
        IMK.Store.state.activePageId = current;
        IMK.renderAll();
      }
    }
  };
})();
