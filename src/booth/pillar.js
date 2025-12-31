import * as THREE from 'three';

export class Pillar {
    constructor(boothMesh) {
        // Nhận vào boothMesh để gắn trụ này làm con của Booth
        // Khi dời Booth đi đâu, trụ đi theo đó
        this.parent = boothMesh;
        this.init();
    }

    init() {
        // Tạo trụ đứng: Cao 1.2m
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, // ĐỎ CHÓI (Để test)
            roughness: 0.3,
            metalness: 0.5
        });

        this.mesh = new THREE.Mesh(geometry, material);
        
        // Đặt vị trí trụ ở góc của cái bục
        this.mesh.position.set(2.5, 0.6, 1.5); // x=2.5 (mép phải), y=0.6 (cao), z=1.5 (mép dưới)
        this.mesh.castShadow = true;

        // Thêm vào trong Booth Group
        this.parent.add(this.mesh);
        
        // Gán data để sau này Raycaster nhận diện
        this.mesh.userData = { isClickable: true, type: 'pillar' };
    }
}