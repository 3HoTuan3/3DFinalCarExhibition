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
const boothData = [
    { 
        x: -12, z: -12, 
        name: "Ford",
        logo: './assets/textures/ford.svg',
        text: "FORD - BUILT FORD TOUGH"
    },
    { 
        x: 12, z: -12,  
        name: "BMW",
        logo: './assets/textures/BMW.svg',
        text: "BMW - THE ULTIMATE DRIVING MACHINE"
    },
    { 
        x: 12, z: 12,   
        name: "Lexus",
        logo: './assets/textures/Lexus.svg',
        text: "LEXUS - EXPERIENCE AMAZING"
    },
    { 
        x: -12, z: 12,  
        name: "Porsche",
        logo: './assets/textures/Porsche.svg',
        text: "PORSCHE - THERE IS NO SUBSTITUTE"
    }
];

boothData.forEach((data) => {
    // Truyền toàn bộ object `data` vào constructor Booth
    const booth = new Booth(scene, { x: data.x, y: 0, z: data.z }, data);
    booth.mesh.lookAt(0, 0, 0); 
    const pillar = new Pillar(booth.mesh);
    booths.push({ booth, pillar, data: data });
});

// --- VIP BOOTH Ở GIỮA ---
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

    booths.forEach(item => {
        if (item.booth && item.booth.update) {
            item.booth.update(delta);
        }
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});