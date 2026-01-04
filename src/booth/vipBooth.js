import * as THREE from 'three';
import { Pillar } from './pillar.js';
import { loadGLTF } from '../utils/loadGLTF.js';

export class VipBooth {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        this.radius = 6;

        this.init();
    }

    init() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // --- 1. SÀN XOAY ---
        this.turntable = new THREE.Group();

        // Sàn đen bóng
        const floorGeo = new THREE.CylinderGeometry(this.radius, this.radius, 0.4, 64);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x050505, 
            roughness: 0.1, 
            metalness: 0.8 
        });
        const platform = new THREE.Mesh(floorGeo, floorMat);
        platform.position.y = 0.2;
        platform.receiveShadow = true;
        this.turntable.add(platform);

        // Viền vàng (Ring)
        const ringGeo = new THREE.TorusGeometry(this.radius, 0.1, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ 
            color: 0xffd700, 
            emissive: 0xffaa00, 
            emissiveIntensity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.4;
        this.turntable.add(ring);

        this.mesh.add(this.turntable);

        // --- 2. BẢNG HIỆU & MÀN HÌNH ---
        const signGeo = new THREE.CylinderGeometry(
            this.radius + 0.1, 
            this.radius + 0.1, 
            0.8, 64, 1, true, 
            -Math.PI / 6, Math.PI / 3 
        );
        const signMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.2,
            side: THREE.DoubleSide
        });
        const signage = new THREE.Mesh(signGeo, signMat);
        signage.position.y = 0.6;
        signage.rotation.y = Math.PI; // Xoay ra mặt trước
        this.mesh.add(signage);

        // Màn hình xanh
        const screenGeo = new THREE.CylinderGeometry(
            this.radius + 0.15, 
            this.radius + 0.15, 
            0.5, 64, 1, true, 
            -Math.PI / 6 + 0.1, Math.PI / 3 - 0.2
        );
        const screenMat = new THREE.MeshStandardMaterial({ 
            color: 0x0000ff, 
            emissive: 0x0000ff,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.y = 0.6;
        screen.rotation.y = Math.PI;
        this.mesh.add(screen);

        // --- 3. TRỤ ĐIỀU KHIỂN ---
        this.pillarObj = new Pillar(this.mesh);
        this.pillarObj.mesh.position.set(4.0, 0, this.radius - 11.5); 
        this.pillarObj.mesh.rotation.y = Math.PI; 

        // --- 4. HỆ THỐNG 4 ĐÈN HẮT SÀN ---
        const numLights = 8;
        const lightRadius = 5.0;
        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2; // Chia đều 360 độ
            const x = Math.cos(angle) * lightRadius;
            const z = Math.sin(angle) * lightRadius;
            // a) Tạo model cái đèn dưới đất
            const lampBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
            const lampBaseMat = new THREE.MeshStandardMaterial({ 
                color: 0x888888, 
                emissive: 0xffffff,
                emissiveIntensity: 1 
            });
            const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat);
            lampBase.position.set(x, 0.42, z);
            this.mesh.add(lampBase);
            // b) Tạo ánh sáng chiếu lên
            const spotLight = new THREE.SpotLight(0xffffff, 50);
            spotLight.position.set(x, 0.45, z);
            spotLight.target.position.set(x, 5, z); 
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 0.5;
            spotLight.distance = 15;
            spotLight.castShadow = true;
            this.mesh.add(spotLight);
            this.mesh.add(spotLight.target);
        }
        this.scene.add(this.mesh);
    }

    update(delta) {
        if (this.turntable) {
            this.turntable.rotation.y += 0.1 * delta;
        }
    }
}