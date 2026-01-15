# Luxury Car Exhibition (Three.js)

Trình diễn triển lãm xe hơi 3D với điều khiển FPS, hoạt cảnh trợ lý, thảm đỏ, cổng mở/đóng, sàn xoay VIP và hệ thống thông tin xe.

## Nội dung chính
- Scene và ánh sáng: [`setupScene`](src/scene/setupScene.js), [`setupLights`](src/scene/setupLight.js), [`setupCamera`](src/scene/setupCamera.js)
- Điều khiển người chơi: [`setupControls`](src/scene/setupControls.js) (Pointer Lock + WASD)
- Cổng vào: [`Entrance`](src/scene/entrance.js) (tường với texture, cửa hai cánh có tay nắm chi tiết, thảm đỏ với texture velour)
- Quản lý xe: [`CarManager`](src/booth/carManager.js) (load GLTF, hiệu ứng scale, dispose tài nguyên)
- Booth thường: [`Booth`](src/booth/booth.js) (LED canvas, trợ lý ảo, xe theo hãng)
- Booth VIP: [`VipBooth`](src/booth/vipBooth.js) (sàn xoay, hàng rào, màn LED cung tròn, trợ lý ảo)
- Trợ lý ảo: [`Assistant`](src/booth/assistant.js) (AnimationMixer, đổi animation theo khoảng cách)
- Đối thoại: [`DialogueManager`](src/utils/dialogueManager.js)
- Nhạc nền: [`MusicManager`](src/utils/musicManager.js) (phím J/K/L)
- Tải GLTF/DRACO: [`loadGLTF`](src/utils/loadGLTF.js)
- Loading UI: [`setupLoadingUI`](src/ui/loadingManager.js)
- Dữ liệu: [car.json](src/data/car.json), [dialogues.json](src/data/dialogues.json)

## Cấu trúc thư mục
- `src/main.js` — khởi tạo scene, renderer, controls, booths, VIP, entrance, vòng lặp render.
- `src/scene/` — camera, controls, ánh sáng, scene, entrance.
- `src/booth/` — booth thường, VIP, trụ bấm, quản lý xe, trợ lý.
- `src/utils/` — load GLTF, quản lý nhạc, đối thoại.
- `assets/` — models, âm thanh, textures (wall, carpet).
- `style.css`, `index.html` — giao diện, overlay, panel thông tin, nhạc, hội thoại.

## Chi tiết cổng vào (Entrance)
- **Tường mặt tiền**: Sử dụng texture tường màu be (`beige_wall_001_diff_4k.jpg`) với repeat (4,1), chia làm 3 phần (trái, phải, trên cửa).
- **Len chân tường**: Màu trắng ngà (`0xEFE9E3`) cao 0.2m ở hai bên tường.
- **Cửa hai cánh**: Màu nâu gỗ (`0x5c3a21`), mở 90° ra hai bên khi click, có khe hở 1cm giữa hai cánh.
- **Tay nắm cửa**: Màu vàng kim (`0xFFD700`), thiết kế thanh dọc với 2 chốt ngang, có cả mặt trước và sau.
- **Thảm đỏ**: Texture velour (`velour_velvet_diff_4k.jpg`) màu đỏ (`0xF63049`), độ dài 30m, repeat (3,15).

## Cài đặt & chạy
1) Cài phụ thuộc:
```bash
npm install
```
2) Chạy dev server với Vite:
```bash
npx vite
```
- Mặc định truy cập tại: http://localhost:5173/

> Nếu cần serve tĩnh thay thế, có thể dùng: `npx http-server .`

## Điều khiển
- Di chuyển: **W/A/S/D** hoặc phím mũi tên (xem [`setupControls`](src/scene/setupControls.js)).
- Khóa/ẩn chuột: click vào màn hình (Pointer Lock).
- Nhạc: **J** (Prev), **K** (Play/Pause), **L** (Next) — xem [`onKeyDown`](src/main.js).
- Đối thoại: click trợ lý hoặc nhấn **Space** khi hộp thoại mở (xem [`DialogueManager`](src/utils/dialogueManager.js)).
- Xe/Booth: click trụ (pillar) để đổi xe; click xe để mở bảng thông tin (xem [`onMouseClick`](src/main.js)).

## Tương tác đặc biệt
- **Cửa ra/vào**: Click vào cửa (userData.type = 'door') để mở/đóng. Khi mở, cửa xoay 90° ra hai bên và tự động teleport người chơi ra thảm đỏ phía sau (z=30), quay lại nhìn vào trung tâm (xem [`Entrance.openDoors`](src/scene/entrance.js)).
- Giới hạn di chuyển/collision đơn giản: clamp tọa độ trong [`updateMovement`](src/scene/setupControls.js).

## Dữ liệu & tài nguyên
- Xe: [src/data/car.json](src/data/car.json) — cấu hình model, scale, offset, rotationY, info hiển thị.
- Đối thoại: [src/data/dialogues.json](src/data/dialogues.json) — lời thoại cho từng hãng/booth/VIP.
- Models: `assets/models/` (Assistant, SpotLight, các xe từng hãng).
- Textures: 
  - Logo hãng: `assets/textures/logo/`
  - Tường: `assets/textures/wall/beige_wall_001_diff_4k.jpg`
  - Thảm: `assets/textures/carpet/velour_velvet_diff_4k.jpg`
  - Nền sàn và textures khác

## Ghi chú kỹ thuật
- GLTF/DRACO loader tự dùng `THREE.DefaultLoadingManager`; UI loading hiển thị qua [`setupLoadingUI`](src/ui/loadingManager.js).
- Xe được dispose đầy đủ geometry/material/maps trước khi load xe mới trong [`CarManager.nextCar`](src/booth/carManager.js).
- Canvas LED cập nhật mỗi frame trong `drawLedContent` của [`Booth`](src/booth/booth.js) và [`VipBooth`](src/booth/vipBooth.js).
- Trợ lý đổi animation theo khoảng cách camera trong `update` của booth/VIP.
- Cửa sử dụng GSAP cho animation mở/đóng mượt mà với easing "power2.inOut".
- Texture được cấu hình với anisotropy=8 và SRGB color space để chất lượng tốt hơn.

## Phím tắt nhanh
- **Click**: khóa chuột / tương tác trợ lý / cửa / trụ / xe.
- **Space**: tiếp hội thoại (khi hộp thoại đang mở).
- **J/K/L**: điều khiển nhạc.

## Lưu ý tải tài nguyên
- Tải thư mục `assets` từ liên kết: https://drive.google.com/drive/folders/1yfxltKmCY1eoOzMXktXFGUUwLwrLaZ_9?usp=sharing
- Giải nén và thay thế thư mục `assets` đã có vào lại dự án trước khi chạy.
- Đảm bảo có đầy đủ các texture