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

## ✨ Có gì trong dashboard?

- 📥 Import một hoặc nhiều file Excel/CSV.
- 🧩 Tự ghép các file có tên cột gần giống nhau và báo cảnh báo dữ liệu.
- 🎛️ Lọc theo cột text, boolean hoặc khoảng ngày. Bộ lọc giữ nguyên trạng thái khi chọn nhiều giá trị.
- 🧱 Kéo thả, resize và nhân bản visual bằng `Ctrl + D`.
- 🖱️ Bấm một cột trong **Fields** để tạo visual, hoặc kéo cột trực tiếp vào canvas/visual đang chọn.
- 📈 12 loại visual: KPI, column, bar, stacked, line, area, donut, scatter, table, matrix, combo và text.
- 🎨 9 bảng màu: tự động, cam, than, teal, đại dương, rừng xanh, mọng, cầu vồng và hoàng hôn.
- 🌗 Light/dark theme, tiếng Việt/English, định dạng số và tiền tệ theo locale.
- 🖥️ Present mode toàn màn hình với phím mũi tên để chuyển trang.
- 📤 Xuất trang hiện tại thành PNG hoặc toàn bộ báo cáo thành PDF A4.
- 💾 Lưu và tải report template `.json` để dùng lại với bộ dữ liệu khác.

## 🧭 Luồng sử dụng gợi ý

1. **Import**: nạp file dữ liệu.
2. **Fields**: bấm vào cột muốn phân tích, hoặc kéo cột vào visual.
3. **Inspector**: chọn loại visual, measure, aggregate, series, currency và palette.
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
