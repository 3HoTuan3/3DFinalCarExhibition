import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, domElement) {
    const controls = new PointerLockControls(camera, domElement);

    // Sự kiện click để khóa chuột
    domElement.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => {
        document.getElementById('instructions').style.display = 'none';
    });

    controls.addEventListener('unlock', () => {
        document.getElementById('instructions').style.display = 'block';
    });

    // --- LOGIC DI CHUYỂN (WASD) ---
    const moveState = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };

    const onKeyDown = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': moveState.forward = true; break;
            case 'ArrowLeft':
            case 'KeyA': moveState.left = true; break;
            case 'ArrowDown':
            case 'KeyS': moveState.backward = true; break;
            case 'ArrowRight':
            case 'KeyD': moveState.right = true; break;
        }
    };

    const onKeyUp = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': moveState.forward = false; break;
            case 'ArrowLeft':
            case 'KeyA': moveState.left = false; break;
            case 'ArrowDown':
            case 'KeyS': moveState.backward = false; break;
            case 'ArrowRight':
            case 'KeyD': moveState.right = false; break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // --- COLLISION (Bounding Boundary) ---
    const updateMovement = (delta, doorIsOpen = false) => {
        if (!controls.isLocked) return;

        const speed = 10.0 * delta;
        const velocity = new THREE.Vector3();

        // Tính hướng di chuyển local
        if (moveState.forward) velocity.z -= 1;
        if (moveState.backward) velocity.z += 1;
        if (moveState.left) velocity.x -= 1;
        if (moveState.right) velocity.x += 1;

        // Lưu vị trí trước khi di chuyển để tránh "bịt" người đang ở ngoài khi cửa đóng
        const pos = camera.position;
        const prevZ = pos.z;

        if (velocity.lengthSq() > 0) {
            velocity.normalize().multiplyScalar(speed);
            // moveRight/moveForward làm việc theo hệ control
            controls.moveRight(velocity.x);
            controls.moveForward(-velocity.z);
        }

        // COLLISION: giới hạn toạ độ trong map (map ~40x40, biên = 20m). Giữ cách tường ~1m => limit = 19
        const limit = 19;

        // Giới hạn X
        if (pos.x < -limit) pos.x = -limit;
        if (pos.x > limit) pos.x = limit;

        // Giới hạn Z với xử lý cửa trước (Z âm)
        if (doorIsOpen) {
            // Nếu cửa mở: cho phép đi ra phía trước ngoài sân tới -40
            if (pos.z < -40) pos.z = -40;
            if (pos.z > limit) pos.z = limit;
        } else {
            // Nếu cửa đóng:
            // - Nếu người đang ở ngoài (prevZ < -limit), không ép họ dịch chuyển vào trong khi chỉ click để khóa chuột.
            // - Nếu người ở trong và cố gắng di chuyển qua biên ra ngoài, chặn ở -limit.
            if (prevZ >= -limit && pos.z < -limit) pos.z = -limit;
            if (pos.z > limit) pos.z = limit;
            // Nếu prevZ < -limit thì giữ pos.z như hiện tại (người vẫn ở ngoài)
        }
    };

    return { controls, updateMovement };
}