import * as THREE from 'three';

export class Booth {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        
        this.init();
    }

    init() {
        // Tạo một Group để chứa cả bục và sau này là xe
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // --- PHẦN BỤC (PLATFORM) ---
        // Kích thước: Rộng 6m, Dày 0.2m, Sâu 4m
        const geometry = new THREE.BoxGeometry(6, 0.2, 4);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x333333, // Màu xám đen
            roughness: 0.5,
            metalness: 0.1 
        });

        const platform = new THREE.Mesh(geometry, material);
        // Nâng lên 0.1 vì box có tâm ở giữa, để đáy box chạm sàn
        platform.position.y = 0.1; 
        platform.receiveShadow = true;
        
        this.mesh.add(platform);
        this.scene.add(this.mesh);
    }
}