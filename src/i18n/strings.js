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
      fieldHint: "T\u1ea1o visual m\u1edbi t\u1eeb c\u1ed9t n\u00e0y",
      fieldApplied: "\u0110\u00e3 \u00e1p d\u1ee5ng c\u1ed9t v\u00e0o visual",
      from: "T\u1eeb",
      to: "\u0110\u1ebfn",
      chooseVisualEyebrow: "TH\u01af VI\u1ec6N VISUAL",
      dragVisual: "K\u00e9o visual",
      editVisual: "Ch\u1ec9nh s\u1eeda",
      duplicateVisual: "Nh\u00e2n b\u1ea3n visual",
      deleteVisual: "X\u00f3a visual"
      ,importFiles: "Import t\u1ec7p"
      ,scanFolder: "Qu\u00e9t th\u01b0 m\u1ee5c"
      ,autoSuggest: "Dashboard m\u1eabu"
      ,saveReport: "L\u01b0u m\u1eabu"
      ,loadReport: "M\u1edf m\u1eabu"
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
      ,visualMap: "B\u1ea3n \u0111\u1ed3"
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
      ,more: "Th\u00eam"
      ,dataWorkspace: "D\u1eef li\u1ec7u & b\u1ed9 l\u1ecdc"
      ,closePanel: "\u0110\u00f3ng b\u1ea3ng"
      ,noWarnings: "Kh\u00f4ng c\u00f3 c\u1ea3nh b\u00e1o"
      ,emptyStepImportTitle: "Ch\u1ecdn d\u1eef li\u1ec7u"
      ,emptyStepImportText: "Import t\u1ec7p ho\u1eb7c qu\u00e9t m\u1ed9t th\u01b0 m\u1ee5c tr\u00ean m\u00e1y."
      ,emptyStepBuildTitle: "D\u1ef1ng g\u00f3c nh\u00ecn"
      ,emptyStepBuildText: "Ch\u1ecdn c\u1ed9t v\u00e0 c\u1ea5u h\u00ecnh visual tr\u01b0\u1edbc khi t\u1ea1o."
      ,emptyStepShareTitle: "Tr\u00ecnh chi\u1ebfu ho\u1eb7c xu\u1ea5t"
      ,emptyStepShareText: "Chia s\u1ebb b\u1eb1ng m\u00e0n h\u00ecnh, PNG ho\u1eb7c PDF."
      ,fieldCreate: "T\u1ea1o visual m\u1edbi"
      ,fieldApply: "\u00c1p d\u1ee5ng v\u00e0o visual \u0111ang ch\u1ecdn"
      ,visualData: "D\u1eef li\u1ec7u"
      ,visualStyle: "M\u00e0u & \u0111\u1ecbnh d\u1ea1ng"
      ,dimension: "Ph\u00e2n nh\u00f3m"
      ,geography: "Qu\u1ed1c gia / khu v\u1ef1c"
      ,mapMatched: "v\u00f9ng \u0111\u00e3 kh\u1edbp"
      ,mapUnmatched: "ch\u01b0a kh\u1edbp"
      ,mapNoMatches: "Kh\u00f4ng c\u00f3 t\u00ean qu\u1ed1c gia n\u00e0o kh\u1edbp v\u1edbi b\u1ea3n \u0111\u1ed3 th\u1ebf gi\u1edbi."
      ,mapClickHint: "Ch\u1ecdn m\u1ed9t v\u00f9ng \u0111\u1ec3 l\u1ecdc dashboard"
      ,rowDimension: "H\u00e0ng"
      ,columnDimension: "C\u1ed9t"
      ,xMeasure: "Gi\u00e1 tr\u1ecb tr\u1ee5c X"
      ,yMeasure: "Gi\u00e1 tr\u1ecb tr\u1ee5c Y"
      ,content: "N\u1ed9i dung"
      ,selectField: "Ch\u1ecdn c\u1ed9t"
      ,requiredFields: "H\u00e3y ch\u1ecdn \u0111\u1ee7 th\u00f4ng s\u1ed1 c\u1ea7n thi\u1ebft cho visual n\u00e0y."
      ,visualSettingsHint: "Ch\u1ecdn lo\u1ea1i visual, d\u1eef li\u1ec7u v\u00e0 c\u00e1ch t\u00ednh tr\u01b0\u1edbc khi t\u1ea1o."
      ,inspectorTitle: "C\u1ea5u h\u00ecnh visual"
      ,closeInspector: "\u0110\u00f3ng c\u1ea5u h\u00ecnh"
      ,textPlaceholder: "Vi\u1ebft ghi ch\u00fa ho\u1eb7c nh\u1eadn \u0111\u1ecbnh t\u1ea1i \u0111\u00e2y."
      ,pageNew: "Trang m\u1edbi"
      ,pageRename: "\u0110\u1ed5i t\u00ean trang"
      ,pageDelete: "X\u00f3a trang"
      ,pageName: "T\u00ean trang"
      ,pageKeepOne: "B\u00e1o c\u00e1o ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t m\u1ed9t trang"
      ,pageDeleteConfirm: "X\u00f3a trang n\u00e0y?"
      ,delete: "X\u00f3a"
      ,save: "L\u01b0u"
      ,reportSaved: "\u0110\u00e3 l\u01b0u m\u1eabu b\u00e1o c\u00e1o"
      ,reportDownloaded: "\u0110\u00e3 t\u1ea3i m\u1eabu b\u00e1o c\u00e1o"
      ,reportLoaded: "\u0110\u00e3 m\u1edf m\u1eabu b\u00e1o c\u00e1o"
      ,sampleCreated: "\u0110\u00e3 t\u1ea1o dashboard m\u1eabu"
      ,samplePageName: "Dashboard m\u1eabu"
      ,undo: "Ho\u00e0n t\u00e1c"
      ,visualDeleted: "\u0110\u00e3 x\u00f3a visual"
      ,importReviewTitle: "Ki\u1ec3m tra d\u1eef li\u1ec7u"
      ,importReviewDescription: "Ch\u1ecdn sheet c\u1ea7n d\u00f9ng v\u00e0 x\u00e1c nh\u1eadn h\u00e0ng ti\u00eau \u0111\u1ec1."
      ,sheets: "Sheet"
      ,headerRow: "H\u00e0ng ti\u00eau \u0111\u1ec1"
      ,preview: "Xem tr\u01b0\u1edbc"
      ,useSelectedSheets: "Import sheet \u0111\u00e3 ch\u1ecdn"
      ,selectAtLeastOneSheet: "H\u00e3y ch\u1ecdn \u00edt nh\u1ea5t m\u1ed9t sheet."
      ,sheetEmpty: "Sheet kh\u00f4ng c\u00f3 d\u1eef li\u1ec7u"
      ,fileReadFailed: "Kh\u00f4ng th\u1ec3 \u0111\u1ecdc t\u1ec7p"
      ,noDataSheet: "Kh\u00f4ng t\u00ecm th\u1ea5y sheet c\u00f3 d\u1eef li\u1ec7u"
      ,byWord: "theo"
      ,sumLabel: "T\u1ed5ng"
      ,averageLabel: "Trung b\u00ecnh"
      ,rowsBy: "S\u1ed1 d\u00f2ng theo"
      ,files: "t\u1ec7p"
      ,copySuffix: "b\u1ea3n sao"
      ,visualSettings: "THU\u1ed8C T\u00cdNH VISUAL"
      ,editVisualHint: "Ch\u1ec9nh d\u1eef li\u1ec7u, ph\u00e9p t\u00ednh v\u00e0 giao di\u1ec7n"
      ,editingVisual: "\u0110ang ch\u1ec9nh:"
      ,editVisualGuide: "C\u1eadp nh\u1eadt nhanh c\u00e1ch visual hi\u1ec3n th\u1ecb v\u00e0 t\u00ednh to\u00e1n. Thay \u0111\u1ed5i \u0111\u01b0\u1ee3c \u00e1p d\u1ee5ng ngay."
      ,calculation: "Ph\u00e9p t\u00ednh"
      ,visualStyleShort: "Giao di\u1ec7n"
      ,basicSettings: "C\u00e0i \u0111\u1eb7t c\u01a1 b\u1ea3n"
      ,basicSettingsHint: "Lo\u1ea1i visual, ti\u00eau \u0111\u1ec1 v\u00e0 d\u1eef li\u1ec7u ch\u00ednh."
      ,advancedSettings: "C\u00e0i \u0111\u1eb7t n\u00e2ng cao"
      ,advancedSettingsHint: "Series, gi\u1edbi h\u1ea1n, ti\u1ec1n t\u1ec7 v\u00e0 b\u1ea3ng m\u00e0u."
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
      fieldHint: "Create a new visual from this field",
      fieldApplied: "Field applied to visual",
      from: "From",
      to: "To",
      chooseVisualEyebrow: "VISUAL LIBRARY",
      dragVisual: "Drag visual",
      editVisual: "Edit",
      duplicateVisual: "Duplicate visual",
      deleteVisual: "Delete visual"
      ,importFiles: "Import files"
      ,scanFolder: "Scan folder"
      ,autoSuggest: "Sample dashboard"
      ,saveReport: "Save template"
      ,loadReport: "Open template"
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
      ,visualMap: "Map"
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
      ,more: "More"
      ,dataWorkspace: "Data & filters"
      ,closePanel: "Close panel"
      ,noWarnings: "No warnings"
      ,emptyStepImportTitle: "Choose your data"
      ,emptyStepImportText: "Import files or scan a local folder."
      ,emptyStepBuildTitle: "Build the view"
      ,emptyStepBuildText: "Choose fields and configure the visual before creating it."
      ,emptyStepShareTitle: "Present or export"
      ,emptyStepShareText: "Share the result as a live view, PNG, or PDF."
      ,fieldCreate: "Create new visual"
      ,fieldApply: "Apply to selected visual"
      ,visualData: "Data"
      ,visualStyle: "Color & formatting"
      ,dimension: "Group by"
      ,geography: "Country / region"
      ,mapMatched: "regions matched"
      ,mapUnmatched: "unmatched"
      ,mapNoMatches: "No country names match the offline world map."
      ,mapClickHint: "Select a region to filter the dashboard"
      ,rowDimension: "Rows"
      ,columnDimension: "Columns"
      ,xMeasure: "X value"
      ,yMeasure: "Y value"
      ,content: "Content"
      ,selectField: "Select field"
      ,requiredFields: "Choose the required fields for this visual."
      ,visualSettingsHint: "Choose the visual type, data, and calculation before creating it."
      ,inspectorTitle: "Visual settings"
      ,closeInspector: "Close settings"
      ,textPlaceholder: "Write a note or insight here."
      ,pageNew: "New page"
      ,pageRename: "Rename page"
      ,pageDelete: "Delete page"
      ,pageName: "Page name"
      ,pageKeepOne: "A report must keep at least one page"
      ,pageDeleteConfirm: "Delete this page?"
      ,delete: "Delete"
      ,save: "Save"
      ,reportSaved: "Report template saved"
      ,reportDownloaded: "Report template downloaded"
      ,reportLoaded: "Report template opened"
      ,sampleCreated: "Sample dashboard created"
      ,samplePageName: "Sample dashboard"
      ,undo: "Undo"
      ,visualDeleted: "Visual deleted"
      ,importReviewTitle: "Review data"
      ,importReviewDescription: "Choose the sheets to use and confirm the header row."
      ,sheets: "Sheets"
      ,headerRow: "Header row"
      ,preview: "Preview"
      ,useSelectedSheets: "Import selected sheets"
      ,selectAtLeastOneSheet: "Select at least one sheet."
      ,sheetEmpty: "The sheet has no data"
      ,fileReadFailed: "The file could not be read"
      ,noDataSheet: "No data sheet was found"
      ,byWord: "by"
      ,sumLabel: "Sum"
      ,averageLabel: "Average"
      ,rowsBy: "Rows by"
      ,files: "files"
      ,copySuffix: "copy"
      ,visualSettings: "VISUAL PROPERTIES"
      ,editVisualHint: "Edit data, calculation, and appearance"
      ,editingVisual: "Editing:"
      ,editVisualGuide: "Update how this visual displays and calculates data. Changes apply immediately."
      ,calculation: "Calculation"
      ,visualStyleShort: "Appearance"
      ,basicSettings: "Basic settings"
      ,basicSettingsHint: "Visual type, title, and primary data."
      ,advancedSettings: "Advanced settings"
      ,advancedSettingsHint: "Series, limits, currency, and palette."
    }
  };
})();
