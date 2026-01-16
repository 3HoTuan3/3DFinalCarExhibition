import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Assistant {
    constructor(parentGroup, position = { x: 0, y: 0, z: 0 }, modelPath, scale = 1, rotation = 0, dialogueData = []) {
        this.parent = parentGroup;
        this.position = position;
        this.modelPath = modelPath;
        this.scale = scale;
        this.rotation = rotation;
        this.dialogueData = dialogueData;

        this.mixer = null;
        this.model = null;
        this.actions = {}; // Lưu trữ các hành động: { "Idle": action1, "Wave": action2 }
        this.activeAction = null;

        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        loader.load(
            this.modelPath,
            (gltf) => {
                this.model = gltf.scene;
                this.model.position.set(this.position.x, this.position.y, this.position.z);
                this.model.scale.set(this.scale, this.scale, this.scale);
                this.model.rotation.y = this.rotation;

                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.userData.isAssistant = true;
                        child.userData.dialogue = this.dialogueData;
                        child.userData.assistantName = "Showroom Assistant";
                    }
                });

                // --- ANIMATION ---
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip) => {
                    const action = this.mixer.clipAction(clip);
                    this.actions[clip.name] = action;
                    console.log(`Animation found: "${clip.name}"`);
                });

                this.parent.add(this.model);

                // --- Animation ---
                this.playAnimation("Idle");
            },
            undefined,
            (error) => {
                console.error('Lỗi load Assistant:', error);
            }
        );
    }

    playAnimation(name) {
        const newAction = this.actions[name] || Object.values(this.actions)[0];
        if (!newAction) return;
        if (this.activeAction === newAction) return;
        if (this.activeAction && this.activeAction !== newAction) {
            this.activeAction.fadeOut(0.5);
        }
        newAction.reset();
        newAction.fadeIn(0.5);
        newAction.play();
        this.activeAction = newAction;
    }

    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }
}