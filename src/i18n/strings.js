(function () {
  "use strict";
  window.IMK = window.IMK || {};
  window.IMK.STRINGS = {
    vi: {
      untitled: "Báo cáo chưa đặt tên",
      noData: "Chưa có dữ liệu",
      rows: "dòng",
      fields: "cột",
      importDone: "Đã import dữ liệu",
      folderUpdated: "Cập nhật lúc",
      emptyChart: "Không có dữ liệu để vẽ",
      total: "Tổng",
      subtotal: "Tổng con",
      other: "Khác",
      blank: "(trống)",
      countRows: "Số dòng",
      textTile: "Ghi chú",
      kpiTile: "KPI",
      folderCancelled: "\u0110\u00e3 h\u1ee7y ch\u1ecdn th\u01b0 m\u1ee5c",
      folderUnsupported: "Tr\u00ecnh duy\u1ec7t n\u00e0y kh\u00f4ng h\u1ed7 tr\u1ee3 ch\u1ecdn th\u01b0 m\u1ee5c",
      operationFailed: "Thao t\u00e1c kh\u00f4ng th\u00e0nh c\u00f4ng",
      pdfPreparing: "\u0110ang t\u1ea1o PDF...",
      pdfDone: "PDF \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ea3i",
      pngPreparing: "\u0110ang t\u1ea1o PNG...",
      pngDone: "PNG \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ea3i",
      chooseVisual: "Ch\u1ecdn visual",
      visualType: "Lo\u1ea1i visual",
      palette: "B\u1ea3ng m\u00e0u",
      createVisual: "T\u1ea1o visual",
      cancel: "H\u1ee7y",
      paletteAuto: "T\u1ef1 \u0111\u1ed9ng",
      paletteOrange: "Cam",
      paletteCharcoal: "Than",
      paletteTeal: "Xanh ph\u1ee5",
      paletteOcean: "\u0110\u1ea1i d\u01b0\u01a1ng",
      paletteForest: "R\u1eebng xanh",
      paletteBerry: "M\u1ecdng",
      paletteSpectrum: "C\u1ea7u v\u1ed3ng",
      paletteSunset: "Ho\u00e0ng h\u00f4n",
      fieldHint: "B\u1ea5m \u0111\u1ec3 t\u1ea1o visual ho\u1eb7c k\u00e9o v\u00e0o canvas",
      fieldApplied: "\u0110\u00e3 \u00e1p d\u1ee5ng c\u1ed9t v\u00e0o visual",
      from: "T\u1eeb",
      to: "\u0110\u1ebfn",
      chooseVisualEyebrow: "TH\u01af VI\u1ec6N VISUAL",
      dragVisual: "K\u00e9o visual",
      editVisual: "S\u1eeda visual",
      duplicateVisual: "Nh\u00e2n b\u1ea3n visual",
      deleteVisual: "X\u00f3a visual"
      ,importFiles: "Import t\u1ec7p"
      ,scanFolder: "Qu\u00e9t th\u01b0 m\u1ee5c"
      ,autoSuggest: "G\u1ee3i \u00fd"
      ,saveReport: "L\u01b0u"
      ,loadReport: "M\u1edf"
      ,present: "Tr\u00ecnh chi\u1ebfu"
      ,exportPng: "PNG"
      ,exportPdf: "PDF"
      ,datasets: "B\u1ed9 d\u1eef li\u1ec7u"
      ,fieldsPanel: "C\u1ed9t d\u1eef li\u1ec7u"
      ,slicers: "B\u1ed9 l\u1ecdc"
      ,reset: "X\u00f3a l\u1ecdc"
      ,dataQuality: "Ch\u1ea5t l\u01b0\u1ee3ng d\u1eef li\u1ec7u"
      ,presets: "M\u1eabu b\u00e1o c\u00e1o"
      ,folder: "Th\u01b0 m\u1ee5c"
      ,emptyTitle: "T\u1ea1o b\u00e1o c\u00e1o BI c\u1ee5c b\u1ed9"
      ,emptyDescription: "Import Excel ho\u1eb7c CSV, qu\u00e9t th\u01b0 m\u1ee5c, sau \u0111\u00f3 s\u1eafp x\u1ebfp trang tr\u00ecnh chi\u1ebfu. D\u1eef li\u1ec7u ch\u1ec9 n\u1eb1m trong tr\u00ecnh duy\u1ec7t n\u00e0y."
      ,page: "Trang"
      ,addVisual: "Th\u00eam visual"
      ,visualBar: "C\u1ed9t"
      ,visualHbar: "Thanh ngang"
      ,visualSbar: "X\u1ebfp ch\u1ed3ng"
      ,visualLine: "\u0110\u01b0\u1eddng"
      ,visualArea: "V\u00f9ng"
      ,visualDonut: "V\u00f2ng"
      ,visualScatter: "Ph\u00e2n t\u00e1n"
      ,visualTable: "B\u1ea3ng"
      ,visualMatrix: "Ma tr\u1eadn"
      ,visualKpi: "KPI"
      ,visualCombo: "K\u1ebft h\u1ee3p"
      ,visualText: "Ghi ch\u00fa"
      ,type: "Lo\u1ea1i"
      ,title: "Ti\u00eau \u0111\u1ec1"
      ,xAxis: "Tr\u1ee5c X / D\u00f2ng"
      ,columnAxis: "C\u1ed9t / Ma tr\u1eadn"
      ,measure: "Measure"
      ,aggregate: "Ph\u00e9p g\u1ed9p"
      ,series: "Series"
      ,topN: "Top N"
      ,currency: "Ti\u1ec1n t\u1ec7"
      ,number: "S\u1ed1"
      ,vndSuffix: "VND h\u1eadu t\u1ed1"
      ,usdPrefix: "USD ti\u1ec1n t\u1ed1"
      ,eurPrefix: "EUR ti\u1ec1n t\u1ed1"
      ,none: "Kh\u00f4ng"
    },
    en: {
      untitled: "Untitled report",
      noData: "No data",
      rows: "rows",
      fields: "fields",
      importDone: "Imported data",
      folderUpdated: "Updated at",
      emptyChart: "No data to render",
      total: "Total",
      subtotal: "Subtotal",
      other: "Other",
      blank: "(blank)",
      countRows: "Row count",
      textTile: "Text",
      kpiTile: "KPI",
      folderCancelled: "Folder selection cancelled",
      folderUnsupported: "This browser does not support folder selection",
      operationFailed: "The operation could not be completed",
      pdfPreparing: "Preparing PDF...",
      pdfDone: "PDF downloaded",
      pngPreparing: "Preparing PNG...",
      pngDone: "PNG downloaded",
      chooseVisual: "Choose visual",
      visualType: "Visual type",
      palette: "Palette",
      createVisual: "Create visual",
      cancel: "Cancel",
      paletteAuto: "Automatic",
      paletteOrange: "Orange",
      paletteCharcoal: "Charcoal",
      paletteTeal: "Support teal",
      paletteOcean: "Ocean",
      paletteForest: "Forest",
      paletteBerry: "Berry",
      paletteSpectrum: "Spectrum",
      paletteSunset: "Sunset",
      fieldHint: "Click to create a visual or drag onto the canvas",
      fieldApplied: "Field applied to visual",
      from: "From",
      to: "To",
      chooseVisualEyebrow: "VISUAL LIBRARY",
      dragVisual: "Drag visual",
      editVisual: "Edit visual",
      duplicateVisual: "Duplicate visual",
      deleteVisual: "Delete visual"
      ,importFiles: "Import files"
      ,scanFolder: "Scan folder"
      ,autoSuggest: "Auto"
      ,saveReport: "Save"
      ,loadReport: "Load"
      ,present: "Present"
      ,exportPng: "PNG"
      ,exportPdf: "PDF"
      ,datasets: "Datasets"
      ,fieldsPanel: "Fields"
      ,slicers: "Slicers"
      ,reset: "Reset"
      ,dataQuality: "Data quality"
      ,presets: "Presets"
      ,folder: "Folder"
      ,emptyTitle: "Build a local BI report"
      ,emptyDescription: "Import Excel or CSV files, scan a folder, then shape pages for presentation. Your data stays in this browser."
      ,page: "Page"
      ,addVisual: "Add visual"
      ,visualBar: "Column"
      ,visualHbar: "Bar"
      ,visualSbar: "Stacked"
      ,visualLine: "Line"
      ,visualArea: "Area"
      ,visualDonut: "Donut"
      ,visualScatter: "Scatter"
      ,visualTable: "Table"
      ,visualMatrix: "Matrix"
      ,visualKpi: "KPI"
      ,visualCombo: "Combo"
      ,visualText: "Text"
      ,type: "Type"
      ,title: "Title"
      ,xAxis: "X / Row"
      ,columnAxis: "Column / Matrix"
      ,measure: "Measure"
      ,aggregate: "Aggregate"
      ,series: "Series"
      ,topN: "Top N"
      ,currency: "Currency"
      ,number: "Number"
      ,vndSuffix: "VND suffix"
      ,usdPrefix: "USD prefix"
      ,eurPrefix: "EUR prefix"
      ,none: "None"
    }
  };
})();
