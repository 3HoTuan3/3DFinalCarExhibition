import * as THREE from 'three';
import { setupScene } from './scene/setupScene.js';
import { setupCamera } from './scene/setupCamera.js';
import { setupLights } from './scene/setupLight.js';
import { setupControls } from './scene/setupControls.js';
import { Booth } from './booth/booth.js';
import { Pillar } from './booth/pillar.js';
import { VipBooth } from './booth/VipBooth.js';
import { Entrance } from './scene/entrance.js';
import { MusicManager } from './utils/musicManager.js';
import { setupLoadingUI } from './ui/loadingManager.js';
import { DialogueManager } from './utils/dialogueManager.js';

// --- Biến toàn cục ---
let scene, camera, renderer, controls, updateMovement;
let vipBooth, entrance;
let booths = [];
let musicManager, dialogueManager;

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);

const infoPanel = document.getElementById('car-info-panel');
const closeBtn = document.getElementById('close-btn');

// --- 1. KHỞI TẠO GAME ---
async function initGame() {
    // A. INIT SCENE & CAMERA
    scene = setupScene();
    camera = setupCamera();
    setupLights(scene);

    // B. RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // --- LOAD DỮ LIỆU HỘI THOẠI TỪ JSON ---
    let dialogueData = {};
    try {
        const response = await fetch('./src/data/dialogues.json');
        dialogueData = await response.json();
        console.log("Dialogues loaded:", dialogueData);
    } catch (error) {
        console.error("Lỗi load dialogues.json:", error);
    }

    // C. CONTROLS
    const ctrlSetup = setupControls(camera, document.body);
    controls = ctrlSetup.controls;
    updateMovement = ctrlSetup.updateMovement;
    dialogueManager = new DialogueManager(controls);

    // D. SETUP WORLD OBJECTS

    // 1. Entrance (Cổng & Thảm đỏ)
    entrance = new Entrance(scene, controls);

    // 2. VIP Booth
    vipBooth = new VipBooth(scene, camera, { x: 0, y: 0, z: 0 }, {
        dialogue: dialogueData["VIP"]
    });

    // 3. Booth thường
    const boothData = [
        {
            x: -12, z: -12, name: "FORD", logo: './assets/textures/ford.svg', text: "FORD - BUILT FORD TOUGH",
            assistant: {
                model: './assets/models/Assistant/detective_conan.glb',
                animIdle: 'Idle',
                animActive: 'Wave',
                scale: 1,
                dialogue: dialogueData["FORD"]
            }
        },
        {
            x: 12, z: -12, name: "BMW", logo: './assets/textures/BMW.svg', text: "BMW - THE ULTIMATE DRIVING MACHINE",
            assistant: {
                model: './assets/models/Assistant/naruto_sage_mode.glb',
                animIdle: 'idle',
                animActive: 'hiphop dance',
                scale: 1.0,
                dialogue: dialogueData["BMW"]
            }
        },
        {
            x: 12, z: 12, name: "lexus", logo: './assets/textures/Lexus.svg', text: "LEXUS - EXPERIENCE AMAZING",
            assistant: {
                model: './assets/models/Assistant/REPO1.glb',
                animIdle: 'Idle',
                animActive: 'Clapping',
                scale: 1,
                dialogue: dialogueData["lexus"]
            }
        },
        {
            x: -12, z: 12, name: "Porsche", logo: './assets/textures/Porsche.svg', text: "PORSCHE - THERE IS NO SUBSTITUTE",
            assistant: {
                model: './assets/models/Assistant/bleach.glb',
                animIdle: 'idle',
                animActive: 'Greeting',
                scale: 1.5,
                dialogue: dialogueData["Porsche"]
            }
        }
    ];

    boothData.forEach((data) => {
        const booth = new Booth(scene, camera, { x: data.x, y: 0, z: data.z }, data);
        booth.mesh.lookAt(0, 0, 0);
        const pillar = new Pillar(booth.mesh);
        booths.push({ booth, pillar, data: data });
    });

    // E. CẤU HÌNH NHẠC
    const playlist = [
        { name: "All the stars - AdTurnUp", path: "./assets/audio/ADTurnUp - all the stars.flac" },
        { name: "Raining in Chicago - AdTurnUp", path: "./assets/audio/ADTurnup - raining in chicago.flac" },
        { name: "Dopamine - iirenic", path: "./assets/audio/iirenic - Dopamine.flac" }
    ];
    musicManager = new MusicManager(playlist);

    // Tự động phát nhạc
    musicManager.play();

    // F. EVENTS
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onMouseClick);

    // G. BẮT ĐẦU VÒNG LẶP
    animate();
}

// --- 2. VÒNG LẶP ANIMATION (LOOP) ---
function animate() {
    requestAnimationFrame(animate);

    if (!scene || !camera || !renderer) return; // Chưa init thì không render

    const delta = clock.getDelta();

    // Update di chuyển & cửa
    if (controls && updateMovement) {
        const isDoorOpen = entrance ? entrance.isOpen : false;
        updateMovement(delta, isDoorOpen);
    }

    // Update các Booth & Assistant
    if (vipBooth) vipBooth.update(delta);

    booths.forEach(item => {
        if (item.booth && item.booth.update) item.booth.update(delta);
    });

    renderer.render(scene, camera);
}

// --- 3. XỬ LÝ SỰ KIỆN GIAO DIỆN MÀN HÌNH CHỜ ---
const playBtn = document.getElementById('play-btn');
const progressContainer = document.getElementById('progress-container');

if (playBtn) {
    playBtn.addEventListener('click', () => {
        // 1. Ẩn nút Play, hiện thanh Loading
        playBtn.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'block';

        // 2. Setup Loading Manager
        setupLoadingUI('loading-screen', 'progress-bar', () => {
            console.log("All assets loaded via LoadingManager");
        });

        // 3. Bắt đầu khởi tạo game
        initGame();

        // 4. TIMEOUT AN TOÀN: Nếu sau 15 giây vẫn chưa xong, ẩn loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen && loadingScreen.style.display !== 'none') {
                console.warn('Loading timeout - forcing close');
                loadingScreen.style.display = 'none';
            }
        }, 15000); // 15 giây
    });
} else {
    initGame();
}


// --- 4. TIỆN ÍCH & EVENT HANDLERS ---

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (dialogueManager && dialogueManager.isActive) {
        if (event.code === 'Space') {
            dialogueManager.next();
        }
        return; 
    }

    if (!musicManager) return;
    switch (event.code) {
        case 'KeyJ': // Quay lại bài cũ
            console.log("Music: Prev");
            musicManager.prev();
            break;
        case 'KeyK': // Dừng / Phát
            console.log("Music: Toggle");
            musicManager.toggle();
            break;
        case 'KeyL': // Next bài
            console.log("Music: Next");
            musicManager.next();
            break;
    }
}

// xử lý Click chuột (Raycaster)
function onMouseClick() {
    if (dialogueManager && dialogueManager.isActive) {
        dialogueManager.next();
        return;
    }

    if (infoPanel.style.display === 'block') return;

    if (controls && !controls.isLocked) {
        controls.lock();
        return;
    }

    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let target = intersects[0].object;

        // A. Check assistant
        let assistCheck = target;
        while (assistCheck.parent && !assistCheck.userData.isAssistant) {
            assistCheck = assistCheck.parent;
            if(!assistCheck) break; 
        }
        if (assistCheck && assistCheck.userData && assistCheck.userData.isAssistant) {
            console.log("Clicked Assistant!");
            const name = assistCheck.userData.assistantName || "Assistant";
            const lines = assistCheck.userData.dialogue || ["Xin chào!"];
            dialogueManager.start(name, lines);
            return;
        }

        // B. ENTRANCE
        let doorCheck = target;
        while (doorCheck.parent && (!doorCheck.userData || !doorCheck.userData.isClickable)) {
            doorCheck = doorCheck.parent;
            if (!doorCheck) break;
        }
        if (doorCheck && doorCheck.userData && doorCheck.userData.type === 'door') {
            if (entrance) entrance.handleClick();
            return;
        }

        // C. PILLAR
        let clickableObj = target;
        while (clickableObj.parent && !clickableObj.userData.isClickable) {
            clickableObj = clickableObj.parent;
        }
        if (clickableObj.userData && clickableObj.userData.isClickable && clickableObj.userData.type === 'pillar') {
            if (clickableObj.material && clickableObj.material.emissive) {
                const oldHex = clickableObj.material.emissive.getHex();
                clickableObj.material.emissive.setHex(0xffff00);
                setTimeout(() => {
                    if (clickableObj.material) clickableObj.material.emissive.setHex(oldHex);
                }, 200);
            }
            if (vipBooth && vipBooth.pillarObj && isDescendant(target, vipBooth.pillarObj.mesh)) {
                vipBooth.nextCar();
                return;
            }
            let found = false;
            booths.forEach(item => {
                if (isDescendant(target, item.pillar.mesh)) {
                    item.booth.nextCar();
                    found = true;
                }
            });
            if (found) return;
        }

        // D. CHECK XE
        let cCheck = target;
        let depth = 0;
        while (cCheck.parent && !cCheck.userData.isCar && depth < 10) {
            cCheck = cCheck.parent;
            depth++;
        }
        if (cCheck.userData && cCheck.userData.isCar && cCheck.userData.info) {
            showCarInfo(cCheck.userData.info);
        }
    }
}

// kiểm tra
function isDescendant(p, ancestor) {
    let cur = p;
    while (cur) {
        if (cur === ancestor) return true;
        cur = cur.parent;
    }
    return false;
}

// Hiển thị thông tin xe
function showCarInfo(carData) {
    document.getElementById('info-name').innerText = carData.Name;
    document.getElementById('info-type').innerText = carData.vehicle_type || "Car";
    document.getElementById('info-price').innerText = carData.Price;
    document.getElementById('info-engine').innerText = carData.engine;
    document.getElementById('info-power').innerText = carData.power;
    document.getElementById('info-seating').innerText = carData.seating_capacity;
    document.getElementById('info-year').innerText = carData.year;
    document.getElementById('info-desc').innerText = carData.global_information || "No description available.";

    infoPanel.style.display = 'block';
    if (controls) controls.unlock(); // Hiện chuột để bấm nút đóng
}

// Sự kiện đóng bảng thông tin
closeBtn.addEventListener('click', () => {
    infoPanel.style.display = 'none';
    if (controls) controls.lock(); // Ẩn chuột, tiếp tục game
});

const originalWarn = console.warn;
console.warn = function (msg) {
    if (msg && msg.includes && msg.includes('THREE.WebGLTextures')) {
        return; // Bỏ qua cảnh báo THREE.js texture
    }
    originalWarn.apply(console, arguments);
};