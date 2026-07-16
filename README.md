# HTKstudio

HTKstudio là ứng dụng desktop xây dựng workflow AI bằng node, kèm extension **HTK Bridge** cho Chrome/Edge.

## Tải và cài trên Windows

1. Mở tab **Actions** của repository.
2. Chọn workflow **Build Windows** và bản chạy mới nhất.
3. Tải artifact `HTKstudio-Windows`.
4. Giải nén và chạy file `HTKstudio-0.1.0-x64.exe`.
5. Nếu Windows SmartScreen hiện cảnh báo vì ứng dụng chưa ký số: chọn **More info → Run anyway**.

## Cài extension

1. Giải nén `HTK-Bridge-0.1.0.zip` thành một thư mục cố định.
2. Chrome/Edge → `chrome://extensions` → bật **Chế độ dành cho nhà phát triển**.
3. Chọn **Tải tiện ích đã giải nén / Load unpacked**.
4. Chọn đúng thư mục có file `manifest.json`.
5. Mở HTKstudio trước; popup extension sẽ báo **Đã kết nối**.

## Chạy mã nguồn

Yêu cầu Node.js 22:

```bash
npm install
npm run dev
```

## AI được hỗ trợ trong kiến trúc

- Gemini API
- OpenAI API
- Google Flow thông qua HTK Bridge

Phiên bản 0.1.0 hoàn thiện nền tảng desktop, canvas node, lưu workflow và cầu nối extension. Phần gọi từng dịch vụ AI sẽ được bổ sung theo cấu hình tài khoản của người dùng.

## Bản quyền

HTKstudio là mã nguồn triển khai mới. Không sử dụng tên, logo hoặc tài sản nhận diện của KomfyStudio.
