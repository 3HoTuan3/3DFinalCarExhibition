import * as THREE from 'three';
import { setupScene } from './scene/setupScene.js';
import { setupCamera } from './scene/setupCamera.js';
import { setupLights } from './scene/setupLight.js';
import { setupControls } from './scene/setupControls.js';
import { Booth } from './booth/booth.js';
import { Pillar } from './booth/pillar.js';

// 1. INIT SCENE
const scene = setupScene();
const camera = setupCamera();
setupLights(scene);

// --- THÊM VẬT THỂ VÀO SCENE ---
// Tạo một cái Booth ở vị trí x=0, z=-5 (trước mặt camera 5 mét)
const myBooth = new Booth(scene, { x: 0, y: 0, z: -5 });
// Tạo trụ điều khiển gắn vào Booth đó
const myPillar = new Pillar(myBooth.mesh);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. CONTROLS
const { controls, updateMovement } = setupControls(camera, document.body);

// 3. ANIMATION LOOP
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateMovement(delta);
    renderer.render(scene, camera);
}

animate();

// 4. RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});