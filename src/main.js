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

// 2. SETUP LAYOUT (4 GÓC & VIP)
// Mảng quản lý các booth để sau này load xe
const booths = []; 

// Cấu hình vị trí 4 gian hàng thường (nằm ở 4 góc chéo)
const boothPositions = [
    { x: -12, z: -12, name: "North-West" }, // Góc Tây Bắc
    { x: 12, z: -12,  name: "North-East" }, // Góc Đông Bắc
    { x: 12, z: 12,   name: "South-East" }, // Góc Đông Nam
    { x: -12, z: 12,  name: "South-West" }  // Góc Tây Nam
];

boothPositions.forEach((pos) => {
    // Tạo Booth
    const booth = new Booth(scene, { x: pos.x, y: 0, z: pos.z });
    booth.mesh.lookAt(0, 0, 0); 
    // Tạo Pillar gắn vào Booth
    const pillar = new Pillar(booth.mesh);
    // Lưu vào mảng để dùng sau này (load xe, xử lý logic)
    booths.push({
        booth: booth,
        pillar: pillar,
        position: pos
    });
});

// --- TODO: CHUẨN BỊ CHO VIP BOOTH (Ở GIỮA) ---
// const vipBooth = new VipBooth(scene, { x: 0, y: 0, z: 0 }); (Sẽ làm sau)

// ---------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 3. CONTROLS
const { controls, updateMovement } = setupControls(camera, document.body);

// Logic Raycaster (Đã thêm ở các bước trước - Giữ lại hoặc thêm vào đây nếu thiếu)
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);

window.addEventListener('click', () => {
    if (!controls.isLocked) return;
    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        // Tìm object cha có userData (vì có thể click trúng mesh con của nút bấm)
        let target = intersects[0].object;
        while(target.parent && !target.userData.isClickable) {
            target = target.parent;
        }

        if (target.userData.isClickable && target.userData.type === 'pillar') {
            console.log("Clicked Pillar!");
            // Hiệu ứng nháy màu test
            target.material.emissive.setHex(0xffff00);
            setTimeout(() => { target.material.emissive.setHex(0xaa0000); }, 200);
        }
    }
});

// 4. ANIMATION LOOP
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateMovement(delta);
    renderer.render(scene, camera);
}

animate();

// 5. RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});