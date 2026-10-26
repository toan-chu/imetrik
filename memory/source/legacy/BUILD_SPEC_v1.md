# iMetriK — Build Spec v1

> Blueprint để Codex build. Ngày: 2026-07-15. Trạng thái: chốt, sẵn sàng execute.
> Phân vai: Claude viết spec + review từng phase → Codex heavy execution.
> Repo chỉ `git` lên (public) **sau khi** v1 hoàn tất + rebrand sạch Trustana.

---

## 0. Mục tiêu & định vị

iMetriK = **BI dashboard HTML offline, "mở file là chạy"**, hướng Power BI-lite, dùng chung **mọi ngành** (không hardcode HR/Logistics). Người dùng import Excel/CSV (1 file / nhiều file / quét folder), tự dựng dashboard bằng kéo-thả, **mục đích chính là trình chiếu (presentation)**.

Nguyên tắc thiết kế xuyên suốt: **ít bước, ít tool, ít phức tạp**. Mọi tính năng phải trả lời được "bỏ nó đi thì user có làm được việc không". Tùy biến cao nhưng UI không rối.

**Ràng buộc nền tảng (cứng):**
- Chạy `file://`, không server, không build step. Vendor libs local.
- Vì `file://` chặn ES modules (CORS) → **tách file bằng `<script>` tag thường**, không `import/export`.
- Các tính năng folder/lưu file dùng **File System Access API → chỉ Chrome/Edge**. Chấp nhận, ghi rõ trong README.
- **Dữ liệu không bao giờ rời máy** — đọc + xử lý 100% trong trình duyệt. Đây là điểm bán hàng (mã nguồn mở public nhưng data local).

---

## 1. Cấu trúc file/folder (tách theo TẦNG kỹ thuật, không theo phase)

```
imetrik/
├── index.html            ← khung + mount point + nạp mọi script theo thứ tự
├── config.js             ← window.APP_CONFIG (mọi knob, xem §11)
├── src/
│   ├── data/
│   │   ├── folder-scanner.js   ← File System Access API + poll
│   │   ├── parser.js           ← SheetJS đọc xlsx/csv, đoán kiểu cột
│   │   └── merge-engine.js     ← normalize + fuzzy + union/anchor + quality warnings
│   ├── model/
│   │   ├── dataset-store.js     ← datasets[], columns{name,role,type}, relationships
│   │   └── measures.js          ← 7 phép tính + (v2: measure tự định nghĩa)
│   ├── query/
│   │   └── query-engine.js      ← groupby/agg/filter, aggregate-before-render
│   ├── view/
│   │   ├── layout.js            ← snap grid (gridstack wrapper)
│   │   ├── tile.js              ← 1 tile = 1 visual, panel chỉnh tại chỗ
│   │   ├── charts.js            ← 11 chart renderers (Chart.js) + quality bar
│   │   ├── slicers.js           ← bộ lọc + cross-filter (dim others)
│   │   ├── pages.js             ← page tabs (thay mode ngành)
│   │   ├── present.js           ← fullscreen + arrow nav + hide brand
│   │   └── export.js            ← PDF full + PNG 1 trang
│   ├── i18n/
│   │   ├── strings.js           ← bảng chuỗi VN/EN
│   │   └── format.js            ← locale number + currency
│   └── report/
│       └── report-io.js         ← save/load .json template (app folder)
├── vendor/               ← SheetJS, Chart.js, jsPDF, html2canvas, gridstack (KHÔNG pptxgen)
├── fonts/                ← Be Vietnam Pro + JetBrains Mono (giữ nguyên)
├── assets/              ← logo iMetriK (thay logo Trustana) + icon set offline
├── sample-data/         ← 2 file Excel mẫu (giữ)
├── docs/                ← spec này
├── LICENSE              ← MIT (thêm mới)
├── THIRD_PARTY_LICENSES.md  ← attribution vendor libs (thêm mới)
└── README.md            ← viết lại cho iMetriK
```

Thứ tự nạp script trong `index.html`: vendor → config → i18n → data → model → query → view → report → main bootstrap.

---

## 2. Data layer

### 2.1 FolderScanner (`folder-scanner.js`)
- Nút **"Quét folder"** → `showDirectoryPicker()` → xin quyền `read`. Lưu `FileSystemDirectoryHandle` vào **IndexedDB** → lần sau 1 click cấp lại (`queryPermission`/`requestPermission`).
- Enumerate `.xlsx/.xls/.csv` trong folder → render **bảng tick chọn file** (checkbox). User tick file nào thì nạp file đó.
- **Near-realtime bằng poll:** mỗi 5–10s (config `POLL_MS`) đọc lại directory, so `file.lastModified`. File nào đổi → re-parse + cập nhật dataset + đẩy event re-render.
- Hiện **"Cập nhật lúc HH:MM"** + nháy nhẹ (pulse chấm màu) khi phát hiện file mới/đổi.
- Lưu ý ghi trong README: folder OneDrive nên "Always keep on this device" để tránh file online-only đọc lỗi.

### 2.2 Parser (`parser.js`)
- SheetJS đọc file → mảng rows. Nhiều sheet → hỏi chọn sheet (giữ hành vi cũ).
- **Đoán kiểu cột**: number / date / boolean(Có-Không/Yes-No) / text. Ngày parse đa định dạng (dd/mm/yyyy, ISO, serial Excel).
- Gán **role gợi ý** cho cột (dimension vs measure) để KPI auto-suggest (§5.4) và report template remap (§8) dùng lại.

### 2.3 Merge engine (`merge-engine.js`) — CƠ CHẾ LÕI

**Bước 1 — chuẩn hoá tên cột:** bỏ dấu → lowercase → trim → gộp khoảng trắng.

**Bước 2 — fuzzy match chống typo:** so cột giữa các file bằng Levenshtein trên tên đã chuẩn hoá. **Khớp nếu distance ≤ `FUZZY_MAX_EDITS` (mặc định 2).** Ví dụ khớp: `Phòng ban`≈`Phong ban`≈`Phòngg ban`; `Lương`≈`Lươngg`.

**Bước 3 — quyết định gộp hay tách (Jaccard trên tập cột đã khớp):**
- `similarity = |cột khớp| / |hợp cột|`.
- **similarity ≥ `UNION_THRESHOLD` (mặc định 0.70)** → **cùng bảng → union (xếp chồng dòng)**. Cột lệch để trống. Thêm cột hệ thống **`_nguồn`** = tên file (để lọc/tách lại theo file).
- Ngược lại → **bảng riêng**.

**Bước 4 — anchor (chạy độc lập bước 3):** dù bị xử là bảng riêng, nếu **số cột chung ≥ `ANCHOR_MIN_COLS` (mặc định 2)** → tự động đề xuất các cột chung làm **anchor/khoá nối** cho so sánh cạnh nhau (multi-view) và cross-filter (nếu có khoá chung).

**Bước 5 — cảnh báo chất lượng data (bắt buộc v1):** khi merge/parse, gom cảnh báo hiển thị (panel gập được, không chặn):
- Cột có ở file này thiếu ở file kia (sau khi fuzzy) → liệt kê.
- Kiểu không khớp giữa các file cùng cột (vd `Lương` chỗ number chỗ text).
- Ô trống / ngày sai định dạng / số có ký tự lạ → đếm + ví dụ dòng.
- Giá trị trùng khoá nếu cột được coi là mã.
- Mục tiêu: **chặn số sai lặng lẽ lên dashboard**. Mỗi cảnh báo nêu file + cột + số dòng.

> Mọi ngưỡng (`FUZZY_MAX_EDITS`, `UNION_THRESHOLD`, `ANCHOR_MIN_COLS`, `POLL_MS`) nằm ở `config.js`, không hardcode.

---

## 3. Model layer

- **`dataset-store.js`**: giữ danh sách `datasets[]`. Mỗi dataset = `{ id, name, source, columns[], rows[] }`. Mỗi column = `{ name, normalizedName, role: 'dimension'|'measure', type }`.
- **Relationships/anchors**: `{ datasetA, datasetB, keys[] }` từ bước 4 merge.
- **`measures.js`**: 7 phép tính giữ nguyên — `sum | avg | count | countd | min | max | pct` ("% Có/Yes"). (v2: measure tự định nghĩa DAX-lite `[Doanh thu]-[Chi phí]`.)

---

## 4. Query layer (`query-engine.js`)

- Nhận `{ dataset, dim(trục X), series(chia nhóm), measure, agg, filters, topN }` → trả data đã tóm tắt cho chart.
- **Aggregate-before-render (cứng):** luôn groupby + agg trước, KHÔNG đổ raw vào Chart.js. Đây là điều kiện để animation mượt + chịu được folder nhiều file.
- Hỗ trợ filter multi-select + khoảng ngày (từ slicers) + Top N.
- **Trần hiệu năng**: nếu số điểm sau tóm tắt > `ANIM_MAX_POINTS` (mặc định ~2500) → view tự tắt animation cho tile đó.

---

## 5. View layer

### 5.1 Layout (`layout.js`) — snap grid
- Dùng **gridstack.js** (bundle offline, ~40KB) làm lưới kéo-thả + resize theo ô. **Không** free-canvas pixel.
- Mỗi trang (page) có grid riêng. Layout lưu vào report .json.

### 5.2 Tile (`tile.js`) + panel chỉnh tại chỗ
Click tile → panel nổi (in-flow, KHÔNG `position:fixed`) cho chỉnh:
- **Trục X (cột/dimension)**, **Số + phép tính (measure + agg)**, **Chia series**, **Top N**.
- **Màu**: chọn từ palette library (§6). Per-series override.
- **Icon**: icon picker (Tabler outline, offline) cho KPI card + tile chữ; đổi màu icon được.
- **Tiền tệ**: đ (suffix) / $ (prefix) / "…" chọn khác (§7).
- Loại tile: 11 chart (§5.3) + **KPI card** + **tile chữ/ghi chú** (tiêu đề/insight, không chart).
- **Nhân bản tile (Ctrl+D):** clone tile đang chọn kèm toàn bộ cấu hình (cột/số/series/màu/icon) → dựng slide nhanh, khỏi làm lại từ đầu.

### 5.3 Charts (`charts.js`) — roster + QUALITY BAR
Bộ core v1 (11): **cột, thanh ngang, cột chồng, đường, miền, tròn/donut, phân tán (scatter), bảng, pivot/matrix, KPI card, combo (cột+đường)**.

**Quality bar áp cho MỌI chart** (đây là chỗ bản cũ yếu — làm cho đạt):
- Trục có nhãn + đơn vị; số format theo locale + currency.
- Tooltip rõ ràng khi rê chuột (tên nhóm + giá trị + %).
- **Empty state** đàng hoàng khi không có data (không để chart vỡ/trống trơn).
- **Pivot/matrix**: có **tổng-con theo nhóm + hàng/cột Tổng**, canh phải số, format tiền tệ.
- **Scatter**: 2 trục thật có thang + nhãn đơn vị, tooltip từng điểm, (tùy chọn) đường xu hướng.
- **Bảng**: sort theo cột, phân trang nếu dài.

### 5.4 KPI auto-suggest (industry-agnostic)
Bỏ hoàn toàn preset theo ngành. Tự đoán theo **role + type cột**: thấy measure tiền → gợi ý SUM + AVG; thấy cột mã/dimension chính → COUNT DISTINCT; thấy boolean → % Có. Nút "Đề xuất tự động" dựng lại KPI.

### 5.5 Cross-filter (`slicers.js`)
- Click phần tử chart → **làm mờ phần không liên quan** ở các chart khác (giữ cơ chế cũ), **không tô đè màu semantic**. Màu nhấn cấu hình được, mặc định tránh xanh-lá/đỏ.
- Cross-filter xuyên bảng **chỉ chạy khi có anchor/khoá chung** (§2.3 bước 4). Không có khoá → chỉ multi-view so sánh cạnh nhau, không lọc chéo. Ghi rõ giới hạn này ở UI (tooltip).

### 5.6 Pages (`pages.js`)
- Tab trang kiểu Power BI: `Tên trang │ Tên trang │ +`. Thêm/xóa/đổi tên/kéo sắp xếp.
- **Tên báo cáo** ở topbar sửa được (click to rename).
- Thay thế hoàn toàn nút chuyển mode HR/Logistics.

---

## 6. Theming & màu (2 lớp)

- **Lớp brand (cố định):** iMetriK Navy `#0C447C` + Cam `#D85A30`. Wordmark: `i e t r i` = Navy, `M K` = Cam. Dùng cho topbar/icon/chrome + nhấn KPI. Logo qua `assets/` (§9).
- **Lớp màu chart (chọn được):** thư viện palette 9 dải × 7 sắc độ (Navy, Teal, Amber, Tím, Coral, Blue, Green, Red, Gray). Cung cấp: (a) 1 bộ **categorical mặc định** cho series (Navy→Teal→Amber→Tím→Coral, tránh trùng xanh-lá/đỏ semantic), (b) override tay lấy bất kỳ sắc độ nào per series.
- **Nền sáng/tối:** toggle theme (design tokens qua CSS variables, đã có sẵn `:root`). Dark mode cho máy chiếu.

---

## 7. i18n + tiền tệ

- **`strings.js`**: bảng chuỗi `{ vi: {...}, en: {...} }`. **Mọi nhãn UI đi qua bảng này** (build ngay từ đầu — retrofit sau rất tốn).
- **Cờ toggle** 🇻🇳/🇺🇸 góc phải topbar.
- Đổi ngôn ngữ → đổi đồng thời: (a) chuỗi UI, (b) **currency mặc định** (VN→`đ`/VND, EN→`$`/USD), (c) **format số theo locale** (vi-VN `1.000.000,5` ↔ en-US `1,000,000.5`).
- **`format.js`**: currency đ = suffix, $ = prefix; option chọn loại khác (danh sách ISO: EUR, JPY, CNY, KRW... + vị trí ký hiệu). Cấu hình per measure/tile.

---

## 8. Report definition (.json) — template tách data

- **Chỗ lưu: folder APP** (cạnh `index.html` hoặc subfolder `reports/`), **KHÔNG chung folder data**. Lần đầu Save trỏ chỗ một lần (FSA API, handle vào IndexedDB), sau ghi đè im lặng. Fallback chưa cấp quyền: download `.json` về Downloads, load bằng chọn file.
- **Nội dung:** pages + layout grid + tile configs + màu + icon + measure defs + theme + ngôn ngữ. **Tham chiếu cột theo tên + role**, KHÔNG nhúng data.
- **Reusable:** áp report .json lên **bảng dữ liệu khác**. Tên cột lệch → **remap bằng chính engine fuzzy (§2.3)**; cột không map được → hỏi user chọn hoặc để trống.
- Đây là "lưu style chart áp cho data khác" user yêu cầu.
- **Hiển thị dạng PRESET trên dashboard:** mọi report .json trong folder app (`reports/`) được liệt kê thành **gallery preset** (tên + thumbnail nếu có). 1 click chọn preset → áp layout/style lên data hiện tại (qua remap fuzzy ở trên). Đây là cách user tái sử dụng nhanh: dựng data mới → chọn preset → xong.

---

## 9. Logo

- Không làm UI upload. Dùng file trong `assets/` + `config.LOGO` (đường dẫn ảnh hoặc base64).
- **Quy chuẩn** (ghi README): PNG nền trong hoặc SVG, cao ≥64px, dạng ngang.
- **Auto-resize bằng CSS**: `max-height` (topbar 34px; cover/PDF ô lớn hơn) + `width:auto` + `object-fit:contain` → logo to cỡ nào cũng co vừa, không vỡ layout, không đụng ảnh gốc.
- **Present mode**: ẩn/co nhỏ mờ wordmark iMetriK để không nhiễu slide.

---

## 10. Export & Present

- **Export PDF**: xuất toàn bộ trang (cover + KPI + từng tile). jsPDF + html2canvas (đã có).
- **Export PNG 1 trang**: xuất ảnh trang hiện tại để dán email/chat. Dùng lại html2canvas.
- **Bỏ hẳn PPT** → xóa `vendor/pptxgen.bundle.js` (**−461KB**) + mọi code liên quan.
- **Present mode (`present.js`)**: fullscreen, ẩn chrome/chỉ hiện canvas, **điều hướng phím ← →** giữa các trang, ẩn brand iMetriK, tôn trọng theme sáng/tối.

---

## 11. Config schema (`config.js` — `window.APP_CONFIG`)

```
{
  BRAND_NAME: "iMetriK",
  LOGO: "assets/logo-imetrik.svg",     // path hoặc base64
  COLOR_PRIMARY: "#0C447C",            // Navy
  COLOR_ACCENT:  "#D85A30",            // Cam
  FONT_DISPLAY: "'Be Vietnam Pro'",
  FONT_MONO:    "'JetBrains Mono'",
  DEFAULT_LANG: "vi",                  // vi | en
  // merge knobs
  FUZZY_MAX_EDITS: 2,
  UNION_THRESHOLD: 0.70,
  ANCHOR_MIN_COLS: 2,
  // runtime
  POLL_MS: 8000,
  ANIM_MAX_POINTS: 2500,
  CHART_PALETTE: [ ...9 dải x 7 sắc độ ... ],
  CATEGORICAL_DEFAULT: ["#0C447C","#1D9E75","#EF9F27","#7F77DD","#D85A30"]
}
```
Bỏ hoàn toàn khối `MODES` (HR/Logistics) cũ.

---

## 12. Rebrand + repo hygiene (làm trong P1)

- Xóa mọi vết Trustana: `<title>`, `BRAND_NAME`, **logo base64 Trustana**. Thay wordmark iMetriK Navy+Cam.
- Thêm **LICENSE (MIT)**.
- Thêm **THIRD_PARTY_LICENSES.md**: SheetJS (Apache-2.0 — giữ notice), Chart.js/jsPDF/html2canvas/gridstack (MIT — giữ copyright).
- Viết lại **README.md** cho iMetriK (cấu trúc đúng, bỏ mô tả "dashboard-design/" sai, nêu rõ Chrome/Edge only + data local).
- `.gitignore` + `git init`. **Chỉ push public sau khi v1 xong + rebrand sạch.**

---

## 13. Phase plan cho Codex (review được từng khúc)

**P1 — Nền + rebrand + tách file.** Tách `index.html` + skeleton các file §1 (script tag thường). Rebrand iMetriK, bỏ MODES, thêm page tabs + report name. Save/load report `.json` cơ bản. LICENSE + THIRD_PARTY + README.
- *Review:* mở `file://` chạy được; page tabs hoạt động; save→refresh→load lại nguyên trạng; không còn chữ/logo Trustana; PPT đã gỡ.

**P2 — Data + merge + folder.** FolderScanner (FSA API + poll + bảng tick file), import nhiều file, merge engine đầy đủ (fuzzy + union + anchor), cảnh báo chất lượng, "cập nhật lúc HH:MM".
- *Review:* thả 2 file cùng cấu trúc (có cột gõ sai) → tự union đúng; 2 file khác hẳn → tách + đề xuất anchor; sửa file trong folder → dashboard tự cập nhật ≤ POLL_MS; cảnh báo liệt kê đúng cột lỗi.

**P3 — View chất lượng.** Snap grid (gridstack), panel chỉnh tile (cột/số/series/màu/icon/currency), 11 chart đạt quality bar (đặc biệt pivot subtotal + scatter 2 trục), KPI auto-suggest, cross-filter dim-others, tile chữ.
- *Review:* dựng 1 trang 4 tile bằng kéo-thả; pivot có tổng-con; scatter có thang+tooltip; đổi màu/icon per tile; Ctrl+D nhân bản tile giữ nguyên cấu hình; click chart → chart khác mờ đúng.

**P4 — i18n + present + export.** Bảng chuỗi VN/EN + cờ, đổi ngôn ngữ đổi currency + format; nền sáng/tối; present fullscreen + phím ← →; export PDF full + PNG 1 trang; report .json reusable remap.
- *Review:* đổi VN↔EN đổi cả số+tiền; present ẩn brand + chuyển trang bằng phím; PDF ra đủ trang; preset gallery liệt kê report đã lưu; chọn preset áp lên dataset khác → remap cột đúng.

---

## 14. Non-goals v1 (backlog v2 — ghi để không scope-creep)

Drill-down ngày (năm→quý→tháng); tô màu điều kiện heatmap/data-bar trong bảng; so sánh kỳ-trước/mục-tiêu; measure tự định nghĩa (DAX-lite); thumbnail preview tự sinh cho preset; free-canvas pixel; Microsoft Graph API (true-cloud realtime); trình duyệt ngoài Chrome/Edge.

---

## 15. Ghi chú kỹ thuật chưa verify (cần Codex xác nhận lúc build)

- Hành vi persistence của `FileSystemDirectoryHandle` qua IndexedDB + re-grant permission (Chrome/Edge) — kiến thức tới 05/2025, cần test thực tế trên máy đích.
- OneDrive Files On-Demand: file online-only có thể trigger hydrate khi đọc — test khi mạng yếu.
- gridstack version + kích thước bundle offline chính xác — Codex chốt version, cập nhật THIRD_PARTY.
