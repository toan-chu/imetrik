# Prompt handoff cho Codex — iMetriK v1

> Dán nguyên khối dưới đây cho Codex. Nó là instruction, không phải doc đọc chơi.

---

## Bối cảnh

Bạn build **iMetriK** — BI dashboard HTML **offline, chạy `file://`, "mở file là chạy"**, không server, không build step, chỉ hỗ trợ **Chrome/Edge**. Dữ liệu xử lý 100% trong trình duyệt, không rời máy.

Repo hiện có 1 bản đang chạy được (`dashboard.html`, ~1.251 dòng, monolith) tên cũ là "Trustana". Nhiệm vụ: **tái cấu trúc thành iMetriK theo spec**, không viết lại từ số 0.

## Nguồn sự thật

Đọc **`docs/BUILD_SPEC_v1.md`** trước tiên và bám sát nó. Mọi kiến trúc, ngưỡng, chart roster, config, phase plan nằm ở đó. `docs/HANDOFF.md` là bối cảnh lịch sử (tham khảo, đừng làm theo mù quáng).

## Nguyên tắc: LÀM MỚI + TẬN DỤNG

**Salvage logic đang chạy tốt** từ `dashboard.html` (đừng viết lại những cái này, chỉ refactor sang cấu trúc file theo §1 của spec):
- `window.APP_CONFIG` — giữ pattern, chuyển ra `config.js`, **bỏ khối `MODES` (HR/Logistics)**, thêm knobs mới (§11 spec).
- Khối `@font-face` (Be Vietnam Pro + JetBrains Mono) + design tokens `:root` — giữ nguyên.
- 9 loại chart + setup Chart.js — tận dụng, **nâng lên quality bar** (§5.3): pivot phải có tổng-con, scatter 2 trục thật + tooltip.
- 7 phép tính (sum/avg/count/countd/min/max/pct) — giữ.
- Đoán kiểu cột, slicer multi-select + khoảng ngày, cross-highlight (làm mờ phần còn lại) — giữ.
- **"3 anchor" (dim × series × measure) — KHÔNG build lại**, chỉ chuyển vào `query-engine.js` + `tile.js`.
- Import SheetJS, export PDF (jsPDF + html2canvas) — giữ; **bỏ export PPT**.

**Đồ không cần nữa → chuyển vào folder `archives/` (KHÔNG xóa hẳn):**
- `dashboard.html` monolith (sau khi đã rút hết logic sang cấu trúc mới) → `archives/dashboard.html`.
- `vendor/pptxgen.bundle.js` (đã bỏ PPT, −461KB) → `archives/`.
- Logo Trustana trong `assets/` + base64 logo Trustana trong config cũ → `archives/`.
- `README.md` cũ (mô tả Trustana / "dashboard-design/") → `archives/README-trustana.md`, rồi viết README mới cho iMetriK.

Giữ `archives/` ngoài luồng chính nhưng trong repo để tra cứu. Thêm `archives/` vào `.gitignore` nếu không muốn push.

## Ràng buộc kỹ thuật (cứng)

- **Tách file bằng `<script>` tag thường, KHÔNG ES modules** (`import/export` bị CORS chặn trên `file://`). Thứ tự nạp: vendor → config → i18n → data → model → query → view → report → bootstrap.
- Mọi ngưỡng/màu/locale lấy từ `config.js`, không hardcode rải rác.
- Thêm `vendor/gridstack` (snap grid) — chốt version, ghi vào `THIRD_PARTY_LICENSES.md`.
- Không có internet lúc chạy: mọi lib/font/icon phải offline trong repo.

## Cách làm việc: theo PHASE, dừng cho review

Làm lần lượt **P1 → P2 → P3 → P4** (§13 spec). **Sau mỗi phase, dừng lại** và báo cáo theo đúng mục *Review* của phase đó để tôi (Claude) + user kiểm trước khi qua phase sau. Không nhảy cóc.

- P1: tách file + rebrand iMetriK + page tabs + save/load .json + LICENSE/THIRD_PARTY/README + đẩy đồ thừa vào `archives/`.
- P2: FolderScanner + import nhiều file + merge engine (fuzzy ≤2 / union ≥0.70 / anchor ≥2) + cảnh báo chất lượng data.
- P3: snap grid + panel chỉnh tile + 11 chart đạt quality bar + Ctrl+D nhân bản tile + cross-filter + tile chữ.
- P4: i18n VN/EN + cờ + currency theo ngôn ngữ + present fullscreen + PDF/PNG + preset gallery.

## Không làm

- **KHÔNG `git push`.** Chỉ commit local; push public là bước sau khi v1 xong + rebrand sạch (user quyết).
- Không thêm tính năng ngoài spec. Backlog v2 ở §14 — bỏ qua.
- 3 điểm ở **§15 spec** (persistence FSA handle, OneDrive Files On-Demand, gridstack version): **test thực tế**, đừng nhận bừa; báo lại kết quả.

## Output mỗi phase

Báo: (1) file nào tạo/sửa/chuyển-archive, (2) checklist *Review* của phase đạt/chưa, (3) điểm nào lệch spec + lý do, (4) gì cần user/Claude quyết trước khi đi tiếp.
