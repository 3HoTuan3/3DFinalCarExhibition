import * as THREE from 'three';
import { Pillar } from './pillar.js'; // Tái sử dụng cái trụ "xịn" bạn vừa sửa
import { loadGLTF } from '../utils/loadGLTF.js';

export class VipBooth {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        this.radius = 6; // Bán kính bục VIP (Rộng 12m)

        this.init();
    }

    init() {
        // Group cha chứa toàn bộ
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // --- 1. SÀN TRÒN (TURNTABLE PLATFORM) ---
        // Phần này sau này sẽ xoay tròn cùng với xe
        this.turntable = new THREE.Group();
        
        // Tạo khối trụ tròn dẹt
        const floorGeo = new THREE.CylinderGeometry(this.radius, this.radius, 0.4, 64);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x050505, // Đen bóng piano
            roughness: 0.1,  // Rất bóng
            metalness: 0.8   
        });
        const platform = new THREE.Mesh(floorGeo, floorMat);
        platform.position.y = 0.2; // Nằm trên mặt đất
        platform.receiveShadow = true;
        this.turntable.add(platform);

        // Thêm một vòng Ring phát sáng quanh sàn cho sang trọng (Gold Rim)
        const ringGeo = new THREE.TorusGeometry(this.radius, 0.1, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ 
            color: 0xffd700, // Màu vàng kim (Gold)
            emissive: 0xffaa00, // Tự phát sáng nhẹ
            emissiveIntensity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2; // Nằm ngang
        ring.position.y = 0.4; // Nằm trên mép sàn
        this.turntable.add(ring);

        // Add Turntable vào Mesh chính
        this.mesh.add(this.turntable);

        // --- 2. BẢNG HIỆU CONG (CURVED SIGNAGE ON RIM) ---
        // Tạo một đoạn trụ cong (Cylinder cắt bớt) để làm màn hình hiển thị tên xe
        // ThetaLength: độ dài cung tròn (ví dụ pi/4 là 45 độ)
        const signGeo = new THREE.CylinderGeometry(
            this.radius + 0.1, // Bán kính lớn hơn sàn chút xíu
            this.radius + 0.1, 
            0.8, // Cao
            64, // Segment mượt
            1, 
            true, // Open ended (bỏ nắp)
            -Math.PI / 6, // Góc bắt đầu (để căn giữa)
            Math.PI / 3   // Độ dài cung (60 độ)
        );
        const signMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.2
        });
        const signage = new THREE.Mesh(signGeo, signMat);
        signage.position.y = 0.6; // Nằm ốp vào viền sàn
        signage.rotation.y = Math.PI; // Xoay ra mặt trước (đối diện camera khi mới vào)
        this.mesh.add(signage);

        // Giả lập màn hình LED trên bảng hiệu
        const screenGeo = new THREE.CylinderGeometry(
            this.radius + 0.15, 
            this.radius + 0.15, 
            0.5, 64, 1, true, 
            -Math.PI / 6 + 0.1, 
            Math.PI / 3 - 0.2
        );
        const screenMat = new THREE.MeshStandardMaterial({ 
            color: 0x0000ff, // Màu xanh led tạm thời
            emissive: 0x0000ff,
            emissiveIntensity: 0.5
        });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.y = 0.6;
        screen.rotation.y = Math.PI;
        this.mesh.add(screen);

        // --- 3. TRỤ ĐIỀU KHIỂN (DETACHED PILLAR) ---
        // Nằm tách biệt hẳn ra ngoài vòng tròn
        this.pillarObj = new Pillar(this.mesh); 
        
        // Ghi đè vị trí của Pillar (vì class Pillar mặc định đặt ở góc 3.5, 2.5)
        // Ta muốn nó nằm trước mặt bục VIP, cách ra một đoạn
        // Bán kính bục = 6, ta đặt ở 8
        this.pillarObj.mesh.position.set(0, 0, this.radius + 2.5); 
        this.pillarObj.mesh.rotation.y = Math.PI; // Xoay mặt về phía bục (hoặc phía người xem tùy ý)

        // --- 4. SPOTLIGHT VIP ---
        // Đèn chiếu thẳng từ trên cao xuống tâm bục
        const spotLight = new THREE.SpotLight(0xffffff, 200);
        spotLight.position.set(0, 10, 0); // Cao 10m
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.decay = 1;
        spotLight.distance = 30;
        spotLight.castShadow = true;
        
        // Target là tâm sàn xoay
        spotLight.target = platform;
        
        this.mesh.add(spotLight);
        this.mesh.add(spotLight.target);

        this.scene.add(this.mesh);
    }

    // Hàm update để xoay xe
    update(delta) {
        if (this.turntable) {
            // Xoay chậm: 0.1 radian mỗi giây
            this.turntable.rotation.y += 0.1 * delta;
        }
    }
}