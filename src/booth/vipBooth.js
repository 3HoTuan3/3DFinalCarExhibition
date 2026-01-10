import * as THREE from 'three';
import { Pillar } from './pillar.js';
import { loadGLTF } from '../utils/loadGLTF.js';
import { CarManager } from './carManager.js';

export class VipBooth {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        this.radius = 6;

        // Các biến cho màn hình LED
        this.ledCanvas = null;
        this.ledContext = null;
        this.ledTexture = null;
        this.textX = 0;

        this.init();
    }

    async init() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.logoImg = new Image();
        this.logoImg.src = 'assets/textures/toyota.svg';

        // --- 1. SÀN XOAY ---
        this.turntable = new THREE.Group();

        // Sàn đen bóng
        const floorGeo = new THREE.CylinderGeometry(this.radius, this.radius, 0.4, 64);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xdeddd5, roughness: 0.1, metalness: 0.8
        });
        const platform = new THREE.Mesh(floorGeo, floorMat);
        platform.position.y = 0.2;
        platform.receiveShadow = true;
        this.turntable.add(platform);

        // Viền vàng
        const ringGeo = new THREE.TorusGeometry(this.radius, 0.1, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.4;
        this.turntable.add(ring);

        this.mesh.add(this.turntable);

        // --- 2. BẢNG HIỆU SAU (Khung đỡ) ---
        const signGeo = new THREE.CylinderGeometry(
            this.radius + 0.1, this.radius + 0.1, 0.8, 64, 1, true,
            -Math.PI / 6, Math.PI / 3
        );
        const signMat = new THREE.MeshStandardMaterial({
            color: 0x222222, roughness: 0.2, side: THREE.DoubleSide
        });
        const signage = new THREE.Mesh(signGeo, signMat);
        signage.position.y = 0.6;
        signage.rotation.y = Math.PI;
        this.mesh.add(signage);

        // --- 3. MÀN HÌNH LED ---
        this.createLedTexture();
        const screenGeo = new THREE.CylinderGeometry(
            this.radius + 0.15, this.radius + 0.15, 0.5, 64, 1, true,
            -Math.PI / 6 + 0.1, Math.PI / 3 - 0.2
        );

        // Dùng ledTexture làm map cho vật liệu
        const screenMat = new THREE.MeshStandardMaterial({
            map: this.ledTexture, // Gán texture động vào đây
            emissive: 0xffffff,   // Để nó tự phát sáng trong bóng tối
            emissiveMap: this.ledTexture, // Phát sáng theo đúng hình vẽ
            emissiveIntensity: 0.8,
            side: THREE.DoubleSide
        });

        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.y = 0.6;
        screen.rotation.y = Math.PI;
        this.mesh.add(screen);

        // --- 4. TRỤ ĐIỀU KHIỂN ---
        this.pillarObj = new Pillar(this.mesh);
        this.pillarObj.mesh.position.set(4.0, 0, this.radius - 11.5);
        this.pillarObj.mesh.rotation.y = Math.PI;

        // --- 5. ĐÈN HẮT SÀN ---
        const numLights = 4;
        const lightRadius = 5.5;

        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2 + (Math.PI / 4); 
            const x = Math.cos(angle) * lightRadius;
            const z = Math.sin(angle) * lightRadius;

            // a) Tạo model vỏ đèn
            const lampBaseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16);
            const lampBaseMat = new THREE.MeshStandardMaterial({ 
                color: 0x222222, 
                roughness: 0.5,
                metalness: 0.8
            });
            const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat);
            // Đặt đèn nằm trên sàn
            lampBase.position.set(x, 0.2, z); 
            lampBase.lookAt(0, 1, 0); 
            lampBase.rotateX(-Math.PI / 2);
            this.mesh.add(lampBase);

            // b) Tạo SpotLight
            // Intensity = 800
            const spotLight = new THREE.SpotLight(0xffffff, 20); 
            // Vị trí nguồn sáng
            spotLight.position.set(x, 0.5, z); 
            // Target chiếu vào thân xe
            spotLight.target.position.set(0, 1.2, 0); 
            
            spotLight.angle = Math.PI / 5; // Góc mở khoảng 35-36 độ
            spotLight.penumbra = 0.5;      // Viền mềm
            spotLight.distance = 20;       // Tầm xa
            spotLight.decay = 1;           // Độ suy giảm ánh sáng
            spotLight.castShadow = false; 
            this.mesh.add(spotLight);
            this.mesh.add(spotLight.target);
        }

        try {
            const response = await fetch('./src/data/car.json');
            const data = await response.json();
            const toyotaCars = data["Toyota"];
            if (toyotaCars) {
                // Khởi tạo CarManager với sàn xoay (turntable)
                this.carManager = new CarManager(this.scene, this.turntable, toyotaCars);
                // Load xe đầu tiên
                this.carManager.nextCar();
            }
        } catch (error) {
            console.error("Lỗi load cars.json:", error);
        }
        this.scene.add(this.mesh);
    }

    // --- TẠO TEXTURE ĐỘNG ---
    createLedTexture() {
        this.ledCanvas = document.createElement('canvas');
        // Kích thước canvas
        this.ledCanvas.width = 1024;
        this.ledCanvas.height = 256;
        this.ledContext = this.ledCanvas.getContext('2d');
        // Khởi tạo texture từ canvas
        this.ledTexture = new THREE.CanvasTexture(this.ledCanvas);
        this.ledTexture.colorSpace = THREE.SRGBColorSpace;
        // start text off-screen to the right
        this.textX = this.ledCanvas.width + 250;
        this.drawLedContent();
    }

    // --- VẼ CANVAS ---
    drawLedContent() {
        const ctx = this.ledContext;
        const width = this.ledCanvas.width;
        const height = this.ledCanvas.height;

        // 1. Xóa nền cũ
        ctx.fillStyle = '#000088';
        ctx.fillRect(0, 0, width, height);

        // Tạo hiệu ứng lưới LED
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        for (let i = 0; i < width; i += 4) ctx.fillRect(i, 0, 1, height);
        for (let i = 0; i < height; i += 4) ctx.fillRect(0, i, width, 1);

        // 2. VẼ LOGO
        if (this.logoImg.complete) {
            // Vẽ ảnh tại x=20, y=20, rộng 200, cao 200
            ctx.drawImage(this.logoImg, 20, 28, 200, 200);
        } else {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(100, height / 2, 80, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.fillText("LOGO", 55, height / 2 + 10);
        }

        // 3. VẼ CHỮ CHẠY
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 80px Arial';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        const text = "VIP EXHIBITION - 2024 SUPER CAR COLLECTION";
        // Vẽ chữ tại vị trí this.textX
        ctx.fillText(text, this.textX + 250, 160);
        // Cập nhật vị trí (Chạy sang trái)
        this.textX -= 6; //tốc độ chạy
        //Chạy hết chữ thì reset về bên phải
        const textWidth = ctx.measureText(text).width;
        // consider the +250 drawing offset so reset only after whole text left the screen
        if (this.textX + 250 < -textWidth) {
            this.textX = width + 250;
        }
        if (this.ledTexture) {
            this.ledTexture.needsUpdate = true;
        }
    }

    nextCar() {
        if (this.carManager) {
            this.carManager.nextCar();
        }
    }

    update(delta) {
        // Xoay sàn
        if (this.turntable) {
            this.turntable.rotation.y += 0.1 * delta;
        }
        // Cập nhật màn hình LED
        this.drawLedContent();
    }
}