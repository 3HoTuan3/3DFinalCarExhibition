import * as THREE from 'three';
import { loadGLTF } from '../utils/loadGLTF.js';
import { CarManager } from './carManager.js';
import { Assistant } from './assistant.js';

export class Booth {
    constructor(scene, camera, position = { x: 0, y: 0, z: 0 }, config = {}) {
        this.scene = scene;
        this.camera = camera;
        this.position = position;

        // Các biến cho màn hình LED
        this.ledCanvas = null;
        this.ledContext = null;
        this.ledTexture = null;
        this.textX = 0;

        // Nhận dữ liệu từ main.js truyền sang
        this.brandName = config.name || "Brand";
        this.logoUrl = config.logo || './assets/textures/default.png';
        this.marqueeText = config.text || "WELCOME TO CAR EXHIBITION";
        this.assistantConfig = config.assistant || {
            model: './assets/models/Assistant/detective_conan.glb',
            animIdle: 'Idle',
            animActive: 'Wave'
        };

        this.logoImg = new Image();
        this.logoImg.src = this.logoUrl;
        this.carManager = null;
        this.assistant = null;

        this.init();
    }

    async init() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // --- 1. SÀN & TƯỜNG ---
        const floorGeo = new THREE.BoxGeometry(8, 0.4, 6);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.1 });
        const platform = new THREE.Mesh(floorGeo, floorMat);
        platform.position.y = 0.2;
        platform.receiveShadow = true;
        this.mesh.add(platform);

        const wallHeight = 4;
        const backWallGeo = new THREE.BoxGeometry(8, wallHeight, 0.2);
        const backWallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const backWall = new THREE.Mesh(backWallGeo, backWallMat);
        backWall.position.set(0, wallHeight / 2, -2.9);
        backWall.receiveShadow = true;
        this.mesh.add(backWall);

        // --- 2. BẢNG HIỆU ---
        const signFrameGeo = new THREE.BoxGeometry(3.2, 1.0, 0.1);
        const signFrameMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const signFrame = new THREE.Mesh(signFrameGeo, signFrameMat);
        signFrame.position.set(0, 3, -2.8);
        this.mesh.add(signFrame);

        // --- 3. MÀN HÌNH LED ---
        this.createLedTexture();

        // Màn hình nhỏ hơn khung một chút (Rộng 3m, Cao 0.8m)
        const screenGeo = new THREE.PlaneGeometry(3.0, 0.8);
        const screenMat = new THREE.MeshStandardMaterial({
            map: this.ledTexture,
            emissive: 0xffffff,
            emissiveMap: this.ledTexture,
            emissiveIntensity: 0.8
        });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 3, -2.74);
        this.mesh.add(screen);


        // --- 4. MODEL SPOTLIGHT ---
        try {
            const gltf = await loadGLTF('./assets/models/SpotLight/simple_spotlight_lamp.glb');
            const lampModel = gltf.scene;
            lampModel.scale.set(0.1, 0.1, 0.1);
            lampModel.rotation.set(-Math.PI / 6, 1.58, 7);
            lampModel.position.set(0, 3.8, -2.8);

            this.mesh.add(lampModel);
        } catch (error) {
            // console.error("Lỗi model đèn:", error); 
        }

        // --- 5. NGUỒN SÁNG ---
        const spotLight = new THREE.SpotLight(0xffffff, 150);
        spotLight.position.set(0, 3.5, -2.5);
        spotLight.target = platform;
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.3;
        spotLight.castShadow = true;
        this.mesh.add(spotLight);
        this.mesh.add(spotLight.target);

        // --- 6. Load xe ---
        try {
            const response = await fetch('./src/data/car.json');
            const data = await response.json();
            // Lấy danh sách xe dựa theo tên hãng
            const carList = data[this.brandName]; 
            if (carList && carList.length > 0) {
                // Tạo CarManager
                this.carManager = new CarManager(this.scene, this.mesh, carList);
                this.carManager.nextCar();
            } else {
                console.warn(`Không tìm thấy xe cho hãng: ${this.brandName}`);
            }
        } catch (error) {
            console.error("Lỗi load car.json:", error);
        }

        // --- 7. Trợ lý ảo ---
        this.assistant = new Assistant(
            this.mesh,
            { x: 5.5, y: 0, z: 2.5 }, // Vị trí đứng
            this.assistantConfig.model
        );

        this.scene.add(this.mesh);
    }

    nextCar() {
        if (this.carManager) {
            this.carManager.nextCar();
        }
    }

    createLedTexture() {
        this.ledCanvas = document.createElement('canvas');
        this.ledCanvas.width = 1024;
        this.ledCanvas.height = 256;
        this.ledContext = this.ledCanvas.getContext('2d');

        this.ledTexture = new THREE.CanvasTexture(this.ledCanvas);
        this.ledTexture.colorSpace = THREE.SRGBColorSpace;

        this.textX = this.ledCanvas.width;
        this.drawLedContent();
    }

    drawLedContent() {
        const ctx = this.ledContext;
        const width = this.ledCanvas.width;
        const height = this.ledCanvas.height;

        // 1. Nền xanh đậm
        ctx.fillStyle = '#000088';
        ctx.fillRect(0, 0, width, height);

        // Lưới LED
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        for (let i = 0; i < width; i += 4) ctx.fillRect(i, 0, 1, height);
        for (let i = 0; i < height; i += 4) ctx.fillRect(0, i, width, 1);

        // 2. Logo
        if (this.logoImg.complete && this.logoImg.naturalWidth !== 0) {
            const aspect = this.logoImg.width / this.logoImg.height;
            const drawHeight = 200;
            const drawWidth = drawHeight * aspect;
            ctx.drawImage(this.logoImg, 20, 28, drawWidth, drawHeight);
        } else {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(100, height / 2, 80, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.fillText("BRAND", 50, height / 2 + 10);
        }

        // 3. Chữ chạy
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 5;

        const text = this.marqueeText;
        ctx.fillText(text, this.textX, 160);

        // Update vị trí
        this.textX -= 6; // Tốc độ chạy
        const textWidth = ctx.measureText(text).width;
        if (this.textX < -textWidth) {
            this.textX = width;
        }

        if (this.ledTexture) this.ledTexture.needsUpdate = true;
    }

    update(delta) {
        this.drawLedContent();

        if (this.assistant && this.assistant.model) {
            this.assistant.update(delta);
            const assistantWorldPos = new THREE.Vector3();
            this.assistant.model.getWorldPosition(assistantWorldPos);
            const dist = this.camera.position.distanceTo(assistantWorldPos);
            // Action theo khoảng cách
            if (dist < 3) {
                this.assistant.playAnimation(this.assistantConfig.animActive);
            } else {
                this.assistant.playAnimation(this.assistantConfig.animIdle);
            }
        }
    }
}