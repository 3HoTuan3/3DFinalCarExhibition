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

    // delta: thời gian giữa 2 frame (để di chuyển mượt)
    const updateMovement = (delta) => {
        if (!controls.isLocked) return;

        const speed = 10.0 * delta; // Tốc độ di chuyển

        // Lấy hướng camera đang nhìn
        if (moveState.forward) controls.moveForward(speed);
        if (moveState.backward) controls.moveForward(-speed);
        if (moveState.right) controls.moveRight(speed);
        if (moveState.left) controls.moveRight(-speed);
    };

    return { controls, updateMovement };
}