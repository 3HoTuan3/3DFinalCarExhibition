import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, domElement) {
    const controls = new PointerLockControls(camera, domElement);

    controls.addEventListener('lock', () => {
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.style.display = 'none';
    });

    controls.addEventListener('unlock', () => {
        const infoPanel = document.getElementById('car-info-panel');
        const dialogueBox = document.getElementById('dialogue-box');
        if (infoPanel && infoPanel.style.display === 'block') return;
        if (dialogueBox && dialogueBox.style.display === 'block') return;
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.style.display = 'block';
    });

    const moveState = { forward: false, backward: false, left: false, right: false };

    const onKeyDown = (event) => {
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': moveState.forward = true; break;
            case 'ArrowLeft': case 'KeyA': moveState.left = true; break;
            case 'ArrowDown': case 'KeyS': moveState.backward = true; break;
            case 'ArrowRight': case 'KeyD': moveState.right = true; break;
        }
    };

    const onKeyUp = (event) => {
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': moveState.forward = false; break;
            case 'ArrowLeft': case 'KeyA': moveState.left = false; break;
            case 'ArrowDown': case 'KeyS': moveState.backward = false; break;
            case 'ArrowRight': case 'KeyD': moveState.right = false; break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // --- UPDATE MOVEMENT ---
    const updateMovement = (delta, isDoorOpen = false) => {
        if (!controls.isLocked) return;

        const speed = 10.0 * delta;
        const velocity = new THREE.Vector3();

        if (moveState.forward) velocity.z -= 1;
        if (moveState.backward) velocity.z += 1;
        if (moveState.left) velocity.x -= 1;
        if (moveState.right) velocity.x += 1;

        velocity.normalize().multiplyScalar(speed);
        controls.moveRight(velocity.x);
        controls.moveForward(-velocity.z);

        // --- XỬ LÝ COLLISION ---
        const pos = camera.position;
        const wallBuffer = 19.0; 
        if (pos.x < -wallBuffer) pos.x = -wallBuffer;
        if (pos.x > wallBuffer) pos.x = wallBuffer;
        if (pos.z > wallBuffer) pos.z = wallBuffer;
        const doorHalfWidth = 3.5;
        const isAlignedWithDoor = (pos.x > -doorHalfWidth && pos.x < doorHalfWidth);

        if (isDoorOpen && isAlignedWithDoor) {
            if (pos.z < -60) pos.z = -60; 
        } else {
            if (pos.z > -20) {
                if (pos.z < -19.0) pos.z = -19.0;
            } else {
                if (pos.z > -21.0) pos.z = -21.0;
            }
        }
    };

    return { controls, updateMovement };
}