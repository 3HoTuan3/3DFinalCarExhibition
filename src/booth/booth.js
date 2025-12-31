import * as THREE from 'three';

export class Booth {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        
        this.init();
    }

    init() {
        // Tạo Group chứa toàn bộ gian hàng
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // --- 1. SÀN GIAN HÀNG (PLATFORM) ---
        // Làm dày hơn và to hơn chút cho bề thế
        const floorGeo = new THREE.BoxGeometry(8, 0.4, 6); 
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, // Màu đen xám sang trọng
            roughness: 0.2,  // Bóng nhẹ (như sàn gạch men)
            metalness: 0.1 
        });
        const platform = new THREE.Mesh(floorGeo, floorMat);
        platform.position.y = 0.2; // Nâng lên nửa độ dày để nằm trên mặt đất
        platform.receiveShadow = true;
        this.mesh.add(platform);

        // --- 2. TƯỜNG HẬU (BACK WALL) ---
        // Để làm nền cho xe
        const wallHeight = 4;
        const backWallGeo = new THREE.BoxGeometry(8, wallHeight, 0.2);
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Màu trắng để bắt ánh sáng tốt
            roughness: 0.5
        });
        const backWall = new THREE.Mesh(backWallGeo, wallMat);
        backWall.position.set(0, wallHeight / 2, -2.9); // Đẩy lùi về sau mép sàn
        backWall.receiveShadow = true;
        this.mesh.add(backWall);

        // --- 3. LOGO/TÊN HÃNG (GIẢ LẬP) ---
        // Dùng tạm 1 khối đen làm bảng tên treo trên tường
        const signGeo = new THREE.BoxGeometry(3, 0.8, 0.1);
        const signMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 3, -2.8); // Treo cao trên tường sau
        this.mesh.add(sign);

        // --- 4. ÁNH SÁNG TẬP TRUNG (SPOTLIGHT) ---
        // Đây là bí quyết để đẹp như mẫu: Đèn chiếu rọi vào xe
        const spotLight = new THREE.SpotLight(0xffffff, 100); // Cường độ mạnh
        spotLight.position.set(0, 6, 2); // Treo cao phía trước
        spotLight.angle = Math.PI / 6; // Góc chiếu hẹp (tạo luồng sáng)
        spotLight.penumbra = 0.5; // Mờ viền cho mềm
        spotLight.decay = 1;
        spotLight.distance = 20;
        spotLight.castShadow = true;
        spotLight.target = platform; // Chiếu thẳng vào sàn

        this.mesh.add(spotLight);
        
        // Thêm spotlightHelper để bạn thấy hướng đèn (tắt đi khi hoàn thiện)
        // const helper = new THREE.SpotLightHelper(spotLight);
        // this.scene.add(helper);

        // Add toàn bộ vào scene
        this.scene.add(this.mesh);
    }
}