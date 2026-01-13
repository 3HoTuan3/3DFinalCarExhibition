import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Assistant {
    constructor(parentGroup, position = { x: 0, y: 0, z: 0 }, modelPath) {
        this.parent = parentGroup;
        this.position = position;
        this.modelPath = modelPath;
        
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
                this.model.scale.set(1, 1, 1);

                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // --- XỬ LÝ ANIMATION ---
                this.mixer = new THREE.AnimationMixer(this.model);

                // Duyệt qua tất cả animation có trong file
                gltf.animations.forEach((clip) => {
                    // Tạo action cho từng clip và lưu vào object this.actions
                    const action = this.mixer.clipAction(clip);
                    this.actions[clip.name] = action;
                    
                    // In tên ra console file có những animation gì
                    console.log(`Animation found: "${clip.name}"`); 
                });

                this.parent.add(this.model);

                // --- CHẠY ANIMATION ---
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