# 📍 MyMap – Quản lý Bất Động Sản trên Bản Đồ

Ứng dụng web giúp đánh dấu, quản lý và chia sẻ các bất động sản đang bán trực tiếp trên bản đồ. Phù hợp cho môi giới cá nhân hoặc chủ nhà muốn quản lý danh sách BĐS một cách trực quan.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)

## ✨ Tính năng

- 🗺️ **Bản đồ tương tác** – Click vào bản đồ để thêm BĐS, xem giá hiển thị trực tiếp trên marker
- 💰 **Hiển thị giá trên marker** – Mỗi điểm trên bản đồ hiển thị giá dạng pill (VD: `2,58 tỷ`), BĐS đã bán hiển thị màu xám gạch ngang
- 🔍 **Tìm kiếm** – Tìm theo tên, địa chỉ hoặc dán tọa độ GPS để nhảy đến vị trí
- 📊 **Dashboard** – Tổng quan số lượng, trạng thái (đang bán / đã bán), doanh thu
- 📍 **Xem trên bản đồ** – Từ Dashboard, nhấn "Xem bản đồ" để bay đến vị trí BĐS
- 🏠 **Chi tiết BĐS** – Lưu diện tích đất, diện tích sàn, số tầng, phòng ngủ, WC, ngang, tiện ích
- 🔗 **Liên kết nhanh** – Mỗi BĐS có link Google Maps và TikTok
- 🔐 **Đăng nhập** – Chỉ admin mới thêm/sửa/xóa, khách xem được bản đồ và giá ẩn một phần
- 📱 **Responsive** – Giao diện tối ưu cho cả mobile và desktop

## 📸 Preview

| Bản đồ với giá trên marker | Dashboard |
|---|---|
| Marker hiển thị giá dạng pill màu xanh | Thống kê đang bán, đã bán, doanh thu |

## 🚀 Cài đặt

### Yêu cầu

- Node.js >= 18
- Tài khoản Firebase (Firestore)

### Bước 1: Clone & cài đặt

```bash
git clone https://github.com/<your-username>/my-map.git
cd my-map
npm install
```

### Bước 2: Cấu hình Firebase

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Điền thông tin Firebase project của bạn:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Bước 3: Chạy

```bash
npm run dev
```

Mở http://localhost:5173

## 🏗️ Tech Stack

| Công nghệ | Mục đích |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Leaflet + React-Leaflet** | Bản đồ tương tác |
| **Firebase Firestore** | Database realtime |
| **React Router 7** | Routing (SPA) |
| **Firebase Hosting** | Deploy |

## 📁 Cấu trúc dự án

```
src/
├── components/
│   ├── LocationModal.tsx    # Form thêm/sửa BĐS
│   ├── LocationPopup.tsx    # Popup khi click marker
│   ├── LoginModal.tsx       # Form đăng nhập
│   └── MapSearchBar.tsx     # Thanh tìm kiếm
├── pages/
│   ├── MapPage.tsx          # Trang bản đồ chính
│   └── Dashboard.tsx        # Trang tổng quan
├── App.tsx                  # Layout & routing
├── AuthContext.tsx           # Quản lý đăng nhập
├── MapContext.tsx            # Shared map state
├── store.ts                 # Firestore CRUD
├── types.ts                 # TypeScript interfaces
├── utils.ts                 # Format giá, helpers
└── searchUtils.ts           # Logic tìm kiếm
```

## 🚢 Deploy

Build và deploy lên Firebase Hosting:

```bash
npm run build
firebase deploy
```

## 📝 Ghi chú

- Giá nhập theo đơn vị **tỷ đồng** (VD: `2.58` = 2,58 tỷ)
- Chỉ trường **Tiêu đề** là bắt buộc khi thêm BĐS
- Khách không đăng nhập vẫn xem được bản đồ, giá sẽ bị ẩn một phần
- Dữ liệu lưu trên Firestore, realtime sync giữa các thiết bị

## 📄 License

MIT
