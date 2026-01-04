import * as THREE from 'three';
import { setupScene } from './scene/setupScene.js';
import { setupCamera } from './scene/setupCamera.js';
import { setupLights } from './scene/setupLight.js';
import { setupControls } from './scene/setupControls.js';
import { Booth } from './booth/booth.js';
import { Pillar } from './booth/pillar.js';
// IMPORT MỚI
import { VipBooth } from './booth/VipBooth.js'; 

// 1. INIT SCENE
const scene = setupScene();
const camera = setupCamera();
setupLights(scene);

// 2. SETUP LAYOUT
const booths = []; 
const boothPositions = [
    { x: -12, z: -12, name: "North-West" },
    { x: 12, z: -12,  name: "North-East" },
    { x: 12, z: 12,   name: "South-East" },
    { x: -12, z: 12,  name: "South-West" }
];

boothPositions.forEach((pos) => {
    const booth = new Booth(scene, { x: pos.x, y: 0, z: pos.z });
    booth.mesh.lookAt(0, 0, 0); 
    const pillar = new Pillar(booth.mesh);
    booths.push({ booth, pillar, position: pos });
});

// --- TẠO VIP BOOTH Ở GIỮA ---
const vipBooth = new VipBooth(scene, { x: 0, y: 0, z: 0 });

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 3. CONTROLS
const { controls, updateMovement } = setupControls(camera, document.body);

// Logic Raycaster
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
window.addEventListener('click', () => {
    if (!controls.isLocked) return;
    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        let target = intersects[0].object;
        while(target.parent && !target.userData.isClickable) {
            target = target.parent;
        }
        if (target.userData.isClickable && target.userData.type === 'pillar') {
            console.log("Clicked Pillar!");
            // Hiệu ứng nháy màu
            if(target.material.emissive) {
                 const oldHex = target.material.emissive.getHex();
                 target.material.emissive.setHex(0xffff00);
                 setTimeout(() => { target.material.emissive.setHex(oldHex); }, 200);
            }
        }
    }
});

// 4. ANIMATION LOOP
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateMovement(delta);
    // --- VIP BOOTH ---
    if (vipBooth) vipBooth.update(delta);
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});