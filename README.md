# iMetriK

[![MIT License](https://img.shields.io/badge/license-MIT-303841?style=for-the-badge&labelColor=FF5722)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-offline-76ABAE?style=for-the-badge&logo=html5&logoColor=white)](index.html)
[![CSS3](https://img.shields.io/badge/CSS3-themed-303841?style=for-the-badge&logo=css3&logoColor=white)](src/view/styles.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-FFB703?style=for-the-badge&logo=javascript&logoColor=303841)](src/)

> 📊 Một dashboard BI mã nguồn mở, chạy ngay trong trình duyệt và giữ dữ liệu trên máy của bạn.

iMetriK giúp bạn biến các file Excel hoặc CSV thành dashboard có thể lọc, kéo thả, trình chiếu và xuất báo cáo. Không cần server, không cần cài đặt, không cần gửi dữ liệu lên cloud.

## 🚀 Dùng ngay trong 2 phút

### Cách dễ nhất

1. Bấm **Code → Download ZIP** trên GitHub, hoặc clone repo về máy.
2. Giải nén nếu bạn tải ZIP.
3. Mở file `index.html` bằng **Chrome** hoặc **Microsoft Edge**.
4. Bấm **Import files** và chọn một hoặc nhiều file `.xlsx`, `.xls`, `.csv`.
5. Chọn một visual, kéo thả các ô trong dashboard, rồi bấm **Present**, **PNG** hoặc **PDF**.

```bash
git clone <your-repository-url>
cd imetrik
# Mở index.html bằng Chrome hoặc Edge
```

Không có `npm install`, không có build step, không có database cần cấu hình.

## 🧪 Workbook kiểm thử toàn bộ chức năng

Dùng file [docs/imetrik-full-function-test.xlsx](docs/imetrik-full-function-test.xlsx) để kiểm tra các chức năng dựa trên dữ liệu. Workbook có 5 sheet:

| Sheet | Mục đích |
|---|---|
| `00_READ_ME` | Checklist ngắn nằm ngay trong workbook; không import sheet này. |
| `Sales_Main` | 72 dòng dữ liệu chính, header ở dòng 4, đủ text/date/boolean/number và các edge case có chủ đích. |
| `Sales_Extra` | 16 dòng cùng schema, thêm cột `Campaign` và tên quốc gia dạng alias để thử union/fuzzy column matching/map. |
| `Large_2601` | 2.601 dòng để kiểm tra dataset switching, import dữ liệu lớn và giới hạn 2.500 điểm của scatter. |
| `Expected_Results` | Các công thức đối soát và kết quả chuẩn; không import sheet này. |

Một workbook có thể phủ toàn bộ luồng dữ liệu và dashboard. Riêng **Quét thư mục** cần quyền folder của trình duyệt và nhiều file vật lý, nên phần đó dùng thêm hai fixture có sẵn trong `sample-data/` theo bước 5 bên dưới.

### 1. Import, header và merge

1. Mở `index.html`, bấm **Import tệp** và chọn `docs/imetrik-full-function-test.xlsx`.
2. Thử bấm **Hủy** một lần: dashboard phải giữ nguyên trạng thái trước import. Mở lại file để tiếp tục.
3. Chọn `Sales_Main`, `Sales_Extra`, `Large_2601`; bỏ chọn `00_READ_ME` và `Expected_Results`.
4. Xác nhận header được đề xuất ở dòng **4**, **1**, **1** tương ứng.
5. Sau import, danh sách dataset phải có:
   - dataset sales gồm **88 dòng**, hợp nhất từ 2 sheet và có field `_source`;
   - dataset thứ hai gồm **2.601 dòng** từ sheet `Large_2601` (nhận biết bằng row count trong danh sách dataset).
6. Khu vực **Chất lượng dữ liệu** phải báo các blank có chủ đích và cột `Campaign` chỉ xuất hiện ở `Sales_Extra`.
7. Đối chiếu các KPI chính với sheet `Expected_Results`: Revenue `9.138.000 USD`, Margin `3.123.770 USD`, On-time `79,2%`, một margin âm và hai nhãn geography không khớp.

### 2. Tạo đủ 13 visual

Trên dataset sales, bấm **+ Thêm visual** và tạo lần lượt:

| Visual | Cấu hình gợi ý |
|---|---|
| KPI | `RevenueUSD` · `SUM` · USD |
| Cột | `Country` · `RevenueUSD` · `SUM` |
| Thanh ngang | `Product` · `RevenueUSD` · `SUM` |
| Xếp chồng | `Quarter` · `RevenueUSD` · series `Channel` |
| Đường | `OrderDate` · `RevenueUSD` · `SUM` |
| Vùng | `OrderDate` · `MarginUSD` · `SUM` |
| Bản đồ | `Country` · `RevenueUSD` · `SUM` · palette Ocean |
| Vòng | `Category` · `RevenueUSD` · `SUM` |
| Phân tán | X=`RevenueUSD`, Y=`Units`, series=`Channel` |
| Bảng | Tạo bảng rồi thay đổi `Top N` trong Inspector |
| Ma trận | hàng=`Country`, cột=`Quarter`, measure=`RevenueUSD` |
| Kết hợp | `Quarter` · `RevenueUSD` · series `Category` |
| Ghi chú | Nhập một insight tùy ý, ví dụ “Q2 tăng trưởng tốt”. |

Trong Inspector, đổi phép gộp qua `SUM`, `AVG`, `COUNT`, `DISTINCT`, `MIN`, `MAX`; dùng `OnTimeFlag` với `% Yes`. Thử cả định dạng số, VND, USD, EUR và 9 palette.

### 3. Filter và thao tác dashboard

1. Lọc `Country`, boolean `OnTime` và khoảng ngày `OrderDate`; sau đó bấm **Xóa lọc**.
2. Bấm một cột/bar hoặc một quốc gia trên map để tạo highlight/filter chéo, rồi xóa highlight.
3. Bấm tên field để mở visual builder đã điền sẵn; chọn một tile rồi dùng nút mũi tên của field để áp field vào tile đó.
4. Sửa tiêu đề tile, mở Basic/Advanced settings, đổi palette, nhân bản bằng nút hoặc `Ctrl + D`, rồi xóa bản sao.
5. Kéo, resize và sắp xếp lại tile. Thu nhỏ cửa sổ xuống khoảng `390x844` để kiểm tra mobile stacking và sidebar.
6. Tạo page mới, đổi tên, chuyển page, xóa page; bấm **Dashboard mẫu** để tạo thêm một page tự động mà không ghi đè page đang chỉnh.
7. Chuyển sang dataset **2.601 dòng** từ sheet `Large_2601`, kiểm tra Fields/Slicers thay đổi, tạo scatter với X=`Value`, Y=`Value`, series=`Series`; dữ liệu phải import ổn và visual phải giữ phản hồi với giới hạn tối đa 2.500 row của scatter. Chuyển lại dataset sales 88 dòng.
8. Bật/tắt Light/Dark và VN/EN: dữ liệu, filter, page và tile phải được giữ nguyên.
9. Import lại cùng workbook với cùng ba sheet: layout, tiêu đề tùy chỉnh và filter còn hợp lệ phải được giữ lại.

### 4. Lưu, mở, trình chiếu và export

1. Đổi report name, bấm **Lưu mẫu**. Nếu trình duyệt hỏi folder, chọn một folder tạm để ghi `.json`; nếu không hỗ trợ quyền folder, app sẽ tải `imetrik-report.json`.
2. Thay đổi hoặc xóa một tile, sau đó bấm **Mở mẫu** và chọn file `.json`; cấu trúc report phải được khôi phục.
3. Chọn **Mẫu báo cáo → Folder**, trỏ tới folder chứa file `.json` vừa lưu và thử mở preset từ danh sách.
4. Bấm **Trình chiếu**, dùng phím `←`/`→` để chuyển page và `↑`/`↓` để cuộn dashboard dài; thoát fullscreen.
5. Xuất **PNG**: page hiện tại phải có đủ map/chart, không có canvas trắng.
6. Xuất **PDF**: mọi page phải xuất theo A4 landscape, có header và không cắt ngang tile khi còn điểm ngắt phù hợp.

### 5. Quét folder và kiểm tra offline

1. Tạo một folder tạm và copy `sample-data/demo-sales-north.xlsx` cùng `sample-data/demo-sales-south.xlsx` vào đó.
2. Bấm **Quét thư mục**, cấp quyền và xác nhận hai file được union. Sửa một file, chờ chu kỳ polling rồi kiểm tra dữ liệu refresh mà không mất layout.
3. Tạo folder tạm thứ hai, bấm **Quét thư mục** lần nữa và chọn folder mới; dataset phải được thay thế bằng folder mới.
4. Mở app bằng `file://`, import workbook và thử filter/export khi ngắt mạng sau khi trang đã load. Runtime không được gọi CDN hay upload dữ liệu.

### Quét một thư mục, rồi đổi sang thư mục khác

1. Bấm **📁 Quét thư mục** và chọn thư mục chứa các file Excel/CSV.
2. iMetriK sẽ đọc các file phù hợp trong thư mục và nạp chúng vào dashboard.
3. Khi muốn xem thư mục khác, bấm lại **📁 Quét thư mục** rồi chọn thư mục mới.
4. Dữ liệu của thư mục mới sẽ thay cho dữ liệu đang hiển thị; bạn không cần đóng hoặc mở lại app.

Khi mở lại iMetriK, app có thể tự kết nối thư mục gần nhất nếu Chrome/Edge vẫn còn quyền truy cập. Nếu không muốn dùng folder scan, bạn luôn có thể quay lại **Import files** để chọn file thủ công.

## ✨ Có gì trong dashboard?

- 📥 Import một hoặc nhiều file Excel/CSV.
- 🧭 Xem trước workbook, chọn một hoặc nhiều sheet và xác nhận đúng hàng tiêu đề trước khi import.
- 🧩 Tự ghép các file có tên cột gần giống nhau và báo cảnh báo dữ liệu.
- 🎛️ Lọc theo cột text, boolean hoặc khoảng ngày. Bộ lọc giữ nguyên trạng thái khi chọn nhiều giá trị.
- 🔄 Import lại hoặc để folder scan cập nhật dữ liệu mà không làm mất bố cục, tiêu đề và bộ lọc còn hợp lệ.
- 🧱 Kéo thả, resize và nhân bản visual bằng `Ctrl + D`.
- 🖱️ Bấm một cột trong **Fields** để mở bộ tạo visual đã điền sẵn dữ liệu; nút mũi tên riêng dùng để áp dụng cột vào visual đang chọn.
- 📈 13 loại visual: KPI, column, bar, stacked, line, area, map, donut, scatter, table, matrix, combo và text.
- 🎨 9 bảng màu: tự động, cam, than, teal, đại dương, rừng xanh, mọng, cầu vồng và hoàng hôn.
- 🌗 Light/dark theme, tiếng Việt/English, định dạng số và tiền tệ theo locale.
- 🖥️ Present mode toàn màn hình với phím mũi tên để chuyển trang.
- 📤 Xuất trang hiện tại thành PNG hoặc toàn bộ báo cáo thành PDF A4.
- 💾 Lưu và tải report template `.json` để dùng lại với bộ dữ liệu khác.

## 🧩 Giải thích các chức năng trên màn hình

### Thanh công cụ phía trên

| Nút | Chức năng | Cách dùng |
|---|---|---|
| **Import tệp** | Chọn thủ công một hoặc nhiều file Excel/CSV. | Dùng khi bạn chỉ muốn phân tích một số file cụ thể. |
| **Quét thư mục** | Đọc các file Excel/CSV trong một thư mục. | Dùng khi dữ liệu nằm trong một folder và muốn app cập nhật lại khi file thay đổi. Bấm lại nút này để chuyển sang folder khác. |
| **Dashboard mẫu** | Tạo một trang dashboard mẫu mới từ dữ liệu đã import. | Dùng để tham khảo bố cục mà không ghi đè trang bạn đã chỉnh. |
| **Lưu mẫu** | Lưu cấu trúc report hiện tại thành file `.json`. | Lưu visual, page, bộ lọc và cấu hình report; không lưu bản sao dữ liệu Excel/CSV. |
| **Mở** | Mở một report template `.json` đã lưu. | Sau đó import bộ dữ liệu phù hợp để dùng lại bố cục. |
| **Trình chiếu** | Mở dashboard ở chế độ trình bày toàn màn hình. | Dùng khi trình bày nội bộ hoặc chia sẻ màn hình. |
| **PNG** | Xuất page đang xem thành ảnh PNG. | Phù hợp để gửi nhanh một trang qua chat hoặc email. |
| **PDF** | Xuất toàn bộ report thành PDF khổ A4. | Phù hợp để gửi báo cáo hoặc lưu trữ. |
| **🌙 / ☀️** | Đổi Light theme và Dark theme. | Chọn giao diện dễ nhìn hơn theo môi trường làm việc. |
| **VN / EN** | Đổi ngôn ngữ giao diện. | Chuyển nhanh giữa tiếng Việt và English. |

### Các khu vực bên trái

- **📦 Bộ dữ liệu**: hiển thị các file hoặc dataset đang được nạp, cùng số dòng đã đọc.
- **🔤 Cột dữ liệu (Fields)**: danh sách các cột trong dữ liệu. Bấm tên cột để mở bộ tạo visual mới; khi đã chọn một visual, nút mũi tên bên phải áp dụng cột vào visual đó.
- **🎛️ Bộ lọc (Slicers)**: chọn giá trị muốn xem, ví dụ khu vực, sản phẩm, ngày hoặc người phụ trách. Bấm **Xóa lọc** để đưa dashboard về trạng thái ban đầu.
- **✅ Chất lượng dữ liệu**: hiển thị cảnh báo khi iMetriK phát hiện vấn đề lúc ghép hoặc đọc dữ liệu. Nếu thấy `No warnings` nghĩa là chưa có cảnh báo trong lần import đó.
- **📁 Mẫu báo cáo (Presets)**: khu vực để mở nhanh các report template `.json` trong một folder. Nút **Folder** dùng để chọn nơi chứa các mẫu báo cáo.

### Khu vực dashboard ở giữa

- Bấm **+ Thêm visual**, chọn loại biểu đồ, trường dữ liệu, phép gộp và định dạng cần thiết rồi mới tạo.
- Kéo cạnh hoặc góc visual để resize.
- Kéo visual để sắp xếp lại bố cục.
- Bấm nút chỉnh trên visual để mở **Inspector**; mỗi loại visual chỉ hiện các thuộc tính thực sự liên quan.
- Mỗi visual có thể chọn palette riêng để dashboard sinh động hơn mà vẫn giữ theme tổng thể.

## 🧭 Luồng sử dụng gợi ý

1. **Import**: nạp file, chọn sheet và xác nhận hàng tiêu đề trong màn hình xem trước.
2. **Fields**: bấm vào cột muốn phân tích để mở bộ tạo visual đã điền sẵn trường dữ liệu.
3. **Tạo visual**: chọn loại, dimension/measure, phép aggregate và định dạng trước khi tạo; dùng Inspector để chỉnh lại sau đó.
4. **Slicers**: lọc dashboard theo phòng ban, khu vực, ngày hoặc nhóm dữ liệu.
5. **Pages**: tạo nhiều trang cho tổng quan, chi tiết và trình bày.
6. **Present / Export**: chia sẻ bằng màn hình, PNG hoặc PDF.

## 🎨 Đổi logo và màu thương hiệu

iMetriK được thiết kế để clone về, thay brand rồi dùng luôn.

### Đổi màu

Mở `config.js` và sửa hai dòng chính:

```js
COLOR_PRIMARY: "#303841",
COLOR_ACCENT: "#FF5722",
```

Màu sẽ được nối vào CSS token lúc dashboard load. Nếu muốn tạo màu chart riêng, sửa thêm `VISUAL_PALETTES` trong cùng file.

### Đổi logo

1. Thay file `assets/logo-iMetriK.png` bằng logo PNG của bạn.
2. Giữ tên file cũ để không cần sửa code.
3. Nếu đổi tên file, cập nhật `LOGO` trong `config.js`.

Logo được dùng ở header, empty state và file export để báo cáo vẫn có nhận diện thương hiệu.

## 📁 Cấu trúc repo

```text
index.html                 Giao diện offline và thứ tự load script
config.js                  Brand, palette, merge threshold, runtime knobs
assets/                    Logo và dữ liệu logo nhúng cho export
docs/                      Repo map, task context và workbook kiểm thử đầy đủ
fonts/                     Quicksand và Montserrat local
src/data/                  Parser, merge engine, folder scanner
src/model/                 Dataset store và measures
src/query/                 Aggregate trước khi render chart
src/view/                  Layout, slicers, visual gallery, chart, export, present
src/report/                Save/load report template
vendor/                    Thư viện chạy offline đã vendored
sample-data/               Workbook synthetic để thử nhanh
tests/                     Smoke checks cho repo
```

## 🔒 Riêng tư và giới hạn trình duyệt

- Dữ liệu được parse và aggregate 100% trong browser.
- iMetriK không upload dữ liệu lên server nào.
- Folder scan và lưu report trực tiếp vào thư mục cần Chrome/Edge hỗ trợ File System Access API.
- Với thư mục OneDrive, hãy chọn **Always keep on this device** để file luôn sẵn sàng offline.
- Nếu trình duyệt không cho cấp quyền thư mục, iMetriK vẫn dùng được bằng cách import file thủ công.

## ✅ Trạng thái hiện tại

iMetriK hiện đã đủ ổn để chia sẻ cho nhóm dùng thử và bắt đầu lấy feedback thực tế. Bản này tập trung vào trải nghiệm offline, thao tác trực quan và khả năng clone về để đổi logo/màu thương hiệu.

Khi mọi người dùng thử, các feedback hữu ích nhất sẽ là: bước nào khó hiểu, visual nào cần bổ sung, file dữ liệu nào đọc chưa đúng, thao tác nào còn chậm hoặc gây nhầm lẫn. Những phản hồi đó sẽ là cơ sở tốt để ưu tiên vòng cải tiến tiếp theo.

## 🧪 Kiểm tra cho người phát triển

Repo không cần build. Chạy smoke check bằng Node.js:

```bash
node tests/smoke-check.js
```

Khi kiểm tra UI, mở `index.html` bằng Chrome/Edge và thử ở desktop `1440x900` cùng mobile `390x844`.

## 🤝 Đóng góp

Issue và pull request đều được chào đón. Một thay đổi tốt nên:

- giữ app chạy được bằng `file://`;
- không thêm dependency online lúc runtime;
- không đưa dữ liệu thật hoặc secret vào repo;
- cập nhật smoke check nếu thay đổi contract;
- ghi rõ cách kiểm tra trong pull request.

## 📄 License

iMetriK được phát hành theo [MIT License](LICENSE). Các thư viện vendored có thông tin bản quyền trong [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## 🧠 Java hay JavaScript?

Badge công nghệ ở đầu README dùng **JavaScript**, không phải Java và cũng không phải Python. iMetriK là app HTML/CSS/JavaScript thuần, nên người dùng chỉ cần trình duyệt và không cần cài Java hoặc Python để sử dụng.
