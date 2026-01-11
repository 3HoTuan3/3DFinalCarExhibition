import * as THREE from 'three';
import { setupScene } from './scene/setupScene.js';
import { setupCamera } from './scene/setupCamera.js';
import { setupLights } from './scene/setupLight.js';
import { setupControls } from './scene/setupControls.js';
import { Booth } from './booth/booth.js';
import { Pillar } from './booth/pillar.js';
import { VipBooth } from './booth/VipBooth.js';

// 1. INIT SCENE
const scene = setupScene();
const camera = setupCamera();
setupLights(scene);

// 2. SETUP LAYOUT
const booths = [];
const boothData = [
    { x: -12, z: -12, name: "FORD", logo: './assets/textures/ford.svg', text: "FORD - BUILT FORD TOUGH" },
    { x: 12, z: -12, name: "BMW", logo: './assets/textures/BMW.svg', text: "BMW - THE ULTIMATE DRIVING MACHINE" },
    { x: 12, z: 12, name: "lexus", logo: './assets/textures/Lexus.svg', text: "LEXUS - EXPERIENCE AMAZING" },
    { x: -12, z: 12, name: "Porsche", logo: './assets/textures/Porsche.svg', text: "PORSCHE - THERE IS NO SUBSTITUTE" }
];

boothData.forEach((data) => {
    const booth = new Booth(scene, { x: data.x, y: 0, z: data.z }, data);
    booth.mesh.lookAt(0, 0, 0);
    const pillar = new Pillar(booth.mesh);
    booths.push({ booth, pillar, data: data });
});

// --- VIP BOOTH ---
const vipBooth = new VipBooth(scene, { x: 0, y: 0, z: 0 });

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 3. CONTROLS
const { controls, updateMovement } = setupControls(camera, document.body);

// --- RAYCASTER + CENTER ---
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);

// --- QUẢN LÝ UI INFO PANEL ---
const infoPanel = document.getElementById('car-info-panel');
const closeBtn = document.getElementById('close-btn');

// Hiển thị thông tin
function showCarInfo(carData) {
    document.getElementById('info-name').innerText = carData.Name;
    document.getElementById('info-type').innerText = carData.vehicle_type;
    document.getElementById('info-price').innerText = carData.Price;
    document.getElementById('info-engine').innerText = carData.engine;
    document.getElementById('info-power').innerText = carData.power;
    document.getElementById('info-seating').innerText = carData.seating_capacity;
    document.getElementById('info-year').innerText = carData.year;
    document.getElementById('info-desc').innerText = carData.global_information || "No description available.";

    infoPanel.style.display = 'block';
    controls.unlock();
}

closeBtn.addEventListener('click', () => {
    infoPanel.style.display = 'none';
    controls.lock();
});

function isDescendant(p, ancestor) {
    let cur = p;
    while (cur) {
        if (cur === ancestor) return true;
        cur = cur.parent;
    }
    return false;
}

window.addEventListener('click', () => {
    if (infoPanel.style.display === 'block') return;

    if (!controls.isLocked) {
        controls.lock();
        return;
    }

    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let target = intersects[0].object;

        // --- TRƯỜNG HỢP 1: click đổi xe ---
        let clickableObj = target;
        while (clickableObj.parent && !clickableObj.userData.isClickable) {
            clickableObj = clickableObj.parent;
        }
        if (clickableObj.userData && clickableObj.userData.isClickable && clickableObj.userData.type === 'pillar') {
            console.log("Clicked Pillar!");
            // Hiệu ứng nháy màu
            if (clickableObj.material && clickableObj.material.emissive) {
                const oldHex = clickableObj.material.emissive.getHex();
                clickableObj.material.emissive.setHex(0xffff00);
                setTimeout(() => {
                    if (clickableObj.material) clickableObj.material.emissive.setHex(oldHex);
                }, 200);
            }

            // --- PHÂN LOẠI ---
            // A. Kiểm tra VIP BOOTH
            if (vipBooth && vipBooth.pillarObj && isDescendant(target, vipBooth.pillarObj.mesh)) {
                console.log("-> Vip Booth Next Car");
                vipBooth.nextCar();
                return;
            }
            // B. Kiểm tra CÁC BOOTH THƯỜNG
            let found = false;
            booths.forEach(item => {
                if (isDescendant(target, item.pillar.mesh)) {
                    console.log(`-> ${item.data.name} Booth Next Car`);
                    item.booth.nextCar();
                    found = true;
                }
            });
            if (found) return;
        }

        // TRƯỜNG HỢP 2: click vào xe để hiện info
        let cCheck = target;
        let depth = 0;
        while (cCheck.parent && !cCheck.userData.isCar && depth < 10) {
            cCheck = cCheck.parent;
            depth++;
        }
        if (cCheck.userData && cCheck.userData.isCar && cCheck.userData.info) {
            console.log("Clicked Car:", cCheck.userData.info.Name);
            showCarInfo(cCheck.userData.info);
        }
    }
});

// 4. ANIMATION LOOP
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateMovement(delta);
    if (vipBooth) vipBooth.update(delta);

    booths.forEach(item => {
        if (item.booth && item.booth.update) item.booth.update(delta);
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});