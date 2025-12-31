import * as THREE from 'three';

export function setupCamera() {
    // FOV 75, Aspect ratio lấy sau, Near 0.1, Far 1000
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Đặt camera cao 1.6m
    camera.position.set(0, 1.6, 5); 
    
    return camera;
}