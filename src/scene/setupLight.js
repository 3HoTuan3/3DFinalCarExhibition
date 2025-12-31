import * as THREE from 'three';

export function setupLights(scene) {
    // Ánh sáng môi trường (để không chỗ nào tối đen)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Ánh sáng mặt trời (tạo bóng đổ)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    
    // Cấu hình bóng đổ cho nét
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    
    scene.add(dirLight);
}