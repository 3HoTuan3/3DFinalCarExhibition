import * as THREE from 'three';

export class Pillar {
    constructor(boothMesh) {
        this.parent = boothMesh;
        this.init();
    }

    init() {
        // Đế trụ
        const baseGeo = new THREE.BoxGeometry(0.6, 1.2, 0.6);
        const baseMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, // Màu đen kim loại
            roughness: 0.3,
            metalness: 0.8
        });
        this.mesh = new THREE.Mesh(baseGeo, baseMat);
        
        // Đặt ở góc trước bên phải của sàn (sàn rộng 8m -> x=3.5, sâu 6m -> z=2.5)
        this.mesh.position.set(3.5, 0.6, 2.5); 
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // --- NÚT BẤM (BUTTON) ---
        // Làm nút đỏ nổi bật trên mặt trụ
        const btnGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
        const btnMat = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            emissive: 0xaa0000, // Tự phát sáng nhẹ
            emissiveIntensity: 0.5
        });
        const button = new THREE.Mesh(btnGeo, btnMat);
        button.position.y = 0.6; // Nằm trên đỉnh trụ
        this.mesh.add(button); // Gắn nút vào trụ

        // QUAN TRỌNG: Gán userData vào cái NÚT (hoặc cả trụ) để Raycaster bắt dính
        this.mesh.userData = { isClickable: true, type: 'pillar' };
        button.userData = { isClickable: true, type: 'pillar' }; // Bấm vào nút cũng ăn

        this.parent.add(this.mesh);
    }
}