import * as THREE from 'three';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0); // Màu nền xám nhẹ
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // --- TẠO SÀN NHÀ ---
    // Kích thước 40x40 mét
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x999999,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    
    floor.rotation.x = -Math.PI / 2; // Xoay ngang ra
    floor.receiveShadow = true; // Sàn nhận bóng đổ
    scene.add(floor);

    // GridHelper để dễ căn vị trí khi code
    const grid = new THREE.GridHelper(40, 40, 0x000000, 0x555555);
    scene.add(grid);

    return scene;
}