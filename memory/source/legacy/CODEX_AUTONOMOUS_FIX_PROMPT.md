# Prompt cho Codex — chế độ tự chủ toàn phần (iMetriK v1 → presentation-grade)

> Dán nguyên khối. Đây là instruction cho một lượt chạy **độc lập, không check-in giữa chừng**.

---

## Vai của bạn

Bạn là **senior BI engineer kiêm product designer**, trình độ Power BI / Looker Studio, **có gu thẩm mỹ cao**. Bạn nhận một app dashboard HTML offline (`iMetriK`) đã build gần xong nhưng còn lỗi tương tác, thiếu độ hoàn thiện, và một số chỗ over-engineered/leftover. Nhiệm vụ: **đưa nó lên chuẩn cao nhất mà một dashboard chuyên nghiệp nên có** — không chỉ "chạy được" mà "đẹp, mượt, dùng sướng, không lỗi".

## Cách vận hành (QUAN TRỌNG — đổi so với trước)

- **Tự chủ 100%. KHÔNG hỏi, KHÔNG chờ ai bắt lỗi, KHÔNG dừng giữa chừng để review.** Trước đây bạn build từng phase rồi chờ owner catch bug — **bỏ luôn cách đó**. Owner và Claude sẽ không tham gia trong lúc bạn làm.
- **Bạn tự reasoning, tự tìm lỗi của chính mình, tự sửa, đi một mạch từ đầu tới cuối.** Coi mọi UX defect như của bạn, không phải để người khác phát hiện.
- Vòng lặp bắt buộc: **research best practice → implement → tự verify bằng browser headed (Playwright) chạy đúng luồng người dùng thật → tự soi defect (tương tác, edge case, a11y, responsive, console) → fix → lặp lại** cho tới khi đạt hết Definition of Done bên dưới. Chỉ dừng khi mọi mục DoD xanh.
- **Bỏ harness journaling cũ nếu vướng.** Được phép ghi chú làm việc, nhưng **để ngoài repo ship** (gitignore `handoff/`, `log/`, `memory/`). Repo public chỉ chứa app + vendor + docs + tests.
- Gặp quyết định mơ hồ → **tự quyết hợp lý theo chuẩn ngành + ghi lại lý do trong báo cáo cuối**, không dừng để hỏi.

## Ràng buộc CỨNG (không được phá — đây là sản phẩm, không phải harness)

- Chạy `file://`, **không server, không build step, không ES modules** (`<script>` tag thường). Chrome/Edge only.
- **Mọi lib/font/icon offline trong repo.** Không gọi mạng lúc chạy.
- **Dữ liệu không rời máy** — xử lý 100% trong trình duyệt.
- Đọc **`docs/BUILD_SPEC_v1.md`** làm chuẩn requirement: kiến trúc 4 tầng, merge (fuzzy ≤2 / union ≥0.70 / anchor ≥2), i18n VN/EN, currency (đ suffix / $ prefix / chọn khác) + format số theo locale, present mode, export PDF+PNG, report .json reusable + preset gallery, data-quality warnings, aggregate-before-render + animation cap. Được phép **vượt spec theo hướng best-practice**, không được **thụt spec**.
- **Giữ lựa chọn hiện tại của owner, không revert:** font Quicksand (display) + Montserrat, palette Charcoal `#303841` / Orange `#FF5722` / Teal `#76ABAE` support, logo PNG `assets/logo-iMetriK.png`, icon Lucide. Tinh chỉnh cho đẹp hơn được; **không quay lại Navy/Cam hay Tabler/Be Vietnam Pro**.

## Hiện trạng (đã verify — đừng đập đi làm lại phần đúng)

Đúng và giữ: kiến trúc 4 tầng tách file; merge-engine (Levenshtein thật, đúng ngưỡng); pivot/matrix có subtotal + hàng tổng; scatter thật; smoke test pass; 12 visual + 4 palette; present mode; export PDF/PNG đã chạy. **Dồn sức vào tương tác, hoàn thiện, thẩm mỹ, dọn dẹp — không rewrite phần lõi đang đúng.**

## Backlog phải xử (từ review — nhưng chủ động tìm thêm)

**Lỗi tương tác lõi (bắt buộc sửa triệt để):**
1. **Slicer đóng sập sau mỗi lần chọn** — `renderAll()` xoá `#slicerList` mỗi `onchange`, không giữ trạng thái `open`. Sửa để slicer đang thao tác + các slicer khác giữ nguyên open/closed qua rerender; sửa luôn label/id checkbox lệch. Lọc phải mượt, tức thời.
2. **Panel Fields chết** (chỉ hiển thị, không click/kéo/bàn phím) — dựng thành **tương tác thật kiểu Power BI**: click/kéo field vào canvas hoặc vào visual đang chọn để bắt đầu tạo/sửa chart với field đã áp; có hover/focus state + hỗ trợ bàn phím. Dùng lại creator/inspector sẵn có, đừng đẻ builder song song.

**Xác minh thực (đừng né nữa):**
3. **FSA permission persistence + OneDrive Files On-Demand** — test headed Chrome/Edge với folder thật do người dùng chọn: cấp quyền → nhớ handle (IndexedDB) → lần sau re-grant 1 click → poll phát hiện file đổi. Nếu môi trường bạn không có OneDrive thật, **mô phỏng trung thực bằng folder local synced-giả + ghi rõ phần nào còn chưa kiểm được và vì sao** (không im lặng bỏ qua như 3 lần trước).

**Dọn dẹp trước public:**
4. Gitignore + gỡ khỏi tracking: `memory/`, `log/`, `handoff/`.
5. Xoá code chết: `styles.css` dòng 1 còn palette Navy/Cam thời Trustana (bị đè, nhưng gây rối).
6. `config.js` COLOR_PRIMARY/COLOR_ACCENT hiện **không điều khiển màu giao diện** (màu hardcode trong CSS). Nối config → CSS bằng `setProperty` lúc load để knob thật sự có tác dụng (đúng spec), HOẶC bỏ knob. Không để knob giả.
7. `sample-data/` đã bị xoá → thêm lại **1-2 file Excel mẫu synthetic nhỏ** (không dữ liệu thật, tên công ty giả) làm demo + fixture test.
8. Số ở bảng/KPI mất canh cột do `--font-mono` = Montserrat (không mono). Bật `font-variant-numeric: tabular-nums` cho `.num`/`.kpi` để số đều bề rộng.
9. **Commit sạch**: gỡ `.git/index.lock` đang kẹt, commit toàn bộ working tree với message rõ ràng. **KHÔNG push** (owner tự push public sau).

## Definition of Done (chỉ dừng khi TẤT CẢ xanh)

- Mọi affordance tương tác chạy đủ **chuột + bàn phím + focus state rõ**; không có nút/panel "trông bấm được mà không bấm được".
- Slicer giữ trạng thái; Fields panel dựng được chart; kéo-thả + resize + Ctrl+D nhân bản mượt.
- 12 visual đạt quality bar: trục có nhãn+đơn vị, số format theo locale+currency, tooltip rõ, **empty state đàng hoàng**, pivot có tổng-con, scatter 2 trục thật.
- Responsive: desktop 1440 + mobile 390 không tràn ngang; light **và** dark đều sạch.
- i18n VN/EN đầy đủ (không sót chuỗi), đổi ngôn ngữ đổi currency + format số.
- Present fullscreen (ẩn brand, phím ← →), export PDF full + PNG 1 trang, preset gallery áp report .json lên data khác qua remap fuzzy.
- Data-quality warnings hiện đúng khi merge file lệch/typo/ô trống/ngày sai.
- Performance: aggregate-before-render, tự tắt animation > `ANIM_MAX_POINTS`.
- **Zero console error** qua mọi luồng đã exercise; smoke test + syntax check + `git diff --check` pass.
- **Thẩm mỹ presentation-grade**: spacing/radius nhất quán, phân cấp thị giác rõ, bo mềm, không "AI-slop", nhìn như một BI tool cao cấp.

## Kỷ luật tự kiểm (không được claim suông)

- Thật sự **chạy** từng luồng bằng browser headed, không tuyên bố xong khi chưa exercise.
- Bắt buộc test **edge/negative case**: data rỗng, 2 file cùng schema có typo cột, 2 file khác hẳn có 3 cột chung (anchor), file lớn, ngày định dạng lạ, số có ký tự tiền tệ.
- Mọi con số trong báo cáo phải từ lần chạy thật (kích thước PDF, số tile, số dòng...), không phỏng đoán.

## Output duy nhất: 1 báo cáo cuối khi đã 100% xong

Gồm: (1) đã sửa/thêm/xoá gì; (2) từng mục DoD — bằng chứng verify (đo được); (3) quyết định tự đưa ra + lý do; (4) phần nào **thật sự** chưa kiểm được + vì sao (vd không có OneDrive thật). Không báo cáo giữa chừng, không hỏi.
