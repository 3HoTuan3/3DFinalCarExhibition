import * as THREE from 'three';

export function setupCamera() {
    // FOV 75, Aspect ratio lấy sau, Near 0.1, Far 1000
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Vị trí người dùng
    camera.position.set(0, 1.6, -25);

    // Hướng nhìn
    camera.rotation.y = Math.PI;
    return camera;
}