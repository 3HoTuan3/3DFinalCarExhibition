// src/booth/carManager.js
import * as THREE from 'three';
import { loadGLTF } from '../utils/loadGLTF.js';
import gsap from 'gsap';

export class CarManager {
    constructor(scene, parentGroup, carList) {
        this.scene = scene;
        this.parent = parentGroup;
        this.cars = carList;
        this.currentIndex = -1;
        this.currentModel = null;
        this.isLoading = false;
    }

    async nextCar() {
        if (this.isLoading || !this.cars || this.cars.length === 0) return;
        this.isLoading = true;
        this.currentIndex = (this.currentIndex + 1) % this.cars.length;
        const carData = this.cars[this.currentIndex];
        // 1. Xóa xe cũ
        if (this.currentModel) {
            const oldCar = this.currentModel;
            await gsap.to(oldCar.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
            // Dispose: geometry + all texture maps + material
            const disposeMaterialMaps = (mat) => {
                if (!mat) return;
                const keys = ['map', 'metalnessMap', 'roughnessMap', 'normalMap', 'alphaMap', 'aoMap', 'emissiveMap', 'displacementMap', 'envMap', 'specularMap', 'lightMap'];
                keys.forEach(k => {
                    if (mat[k]) {
                        try { mat[k].dispose(); } catch (e) { }
                        mat[k] = null;
                    }
                });
            };
            oldCar.traverse((c) => {
                if (c.isMesh) {
                    try { c.geometry.dispose(); } catch (e) { }
                    if (Array.isArray(c.material)) {
                        c.material.forEach(m => {
                            disposeMaterialMaps(m);
                            try { m.dispose(); } catch (e) { }
                        });
                    } else if (c.material) {
                        disposeMaterialMaps(c.material);
                        try { c.material.dispose(); } catch (e) { }
                    }
                }
            });
            this.parent.remove(oldCar);
            this.currentModel = null;
        }

        // 2. Load xe mới
        try {
            const gltf = await loadGLTF(carData.model);
            const model = gltf.scene;
            const finalScale = carData.scale || 1.0;
            const yOffset = (carData.yOffset !== undefined) ? carData.yOffset : 0.4;

            model.scale.set(0, 0, 0);
            model.position.set(0, yOffset, 0);

            model.userData = {
                isCar: true,
                info: carData
            };

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.userData.isCar = true;
                    child.userData.info = carData;
                }
            });
            this.parent.add(model);
            this.currentModel = model;
            gsap.to(model.scale, { 
                x: finalScale, 
                y: finalScale, 
                z: finalScale, 
                duration: 0.8, 
                ease: "back.out(1.7)" 
            });

        } catch (error) {
            console.error("Lỗi load xe:", error);
        } finally {
            this.isLoading = false;
        }
    }
}