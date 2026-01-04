import * as THREE from 'three';

export class Pillar {
    constructor(boothMesh) {
        this.parent = boothMesh;
        this.init();
    }

    init() {
        // Tạo một Group để chứa các phần của cái trụ (Chân, Thân, Mặt điều khiển)
        this.mesh = new THREE.Group();
        this.mesh.position.set(3.5, 0, 2.5); 
        
        // --- 1. CHÂN ĐẾ (BASE) ---
        const baseGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.1, 32);
        const darkMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.2, 
            metalness: 0.8 
        });
        const base = new THREE.Mesh(baseGeo, darkMat);
        base.position.y = 0.05;
        base.castShadow = true;
        base.receiveShadow = true;
        this.mesh.add(base);

        // --- 2. THÂN TRỤ (STEM) ---
        const stemGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 32);
        const stem = new THREE.Mesh(stemGeo, darkMat);
        stem.position.y = 0.5 + 0.05;
        stem.castShadow = true;
        stem.receiveShadow = true;
        this.mesh.add(stem);

        // --- 3. MẶT BÀN ĐIỀU KHIỂN (CONSOLE PLATE) ---
        const plateGeo = new THREE.BoxGeometry(0.5, 0.05, 0.6);
        const plate = new THREE.Mesh(plateGeo, darkMat);
        plate.position.y = 1.0 + 0.05; 
        plate.rotation.x = Math.PI / 6; 
        
        plate.castShadow = true;
        this.mesh.add(plate);

        // --- 4. NÚT BẤM (BUTTON) ---
        const btnGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32);
        const btnMat = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            emissive: 0xaa0000,
            emissiveIntensity: 0.8
        });
        const button = new THREE.Mesh(btnGeo, btnMat);
        // Đặt nút hơi nhô lên
        button.position.y = 0.05; 
        button.userData = { isClickable: true, type: 'pillar' }; 
        plate.add(button);
        
        // Add toàn bộ cụm trụ vào Booth
        this.parent.add(this.mesh);
    }
}