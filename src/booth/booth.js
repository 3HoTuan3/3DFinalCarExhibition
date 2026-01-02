import * as THREE from 'three';
import { loadGLTF } from '../utils/loadGLTF.js';

export class Booth {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;

        this.init();
    }

    async init() {
        // Group chứa toàn bộ gian hàng
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // --- 1. SÀN & TƯỜNG ---
        const floorGeo = new THREE.BoxGeometry(8, 0.4, 6);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.1 });
        const platform = new THREE.Mesh(floorGeo, floorMat);
        platform.position.y = 0.2;
        platform.receiveShadow = true;
        this.mesh.add(platform);

        const wallHeight = 4;
        const backWallGeo = new THREE.BoxGeometry(8, wallHeight, 0.2);
        const backWallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const backWall = new THREE.Mesh(backWallGeo, backWallMat);
        backWall.position.set(0, wallHeight / 2, -2.9);
        backWall.receiveShadow = true;
        this.mesh.add(backWall);

        // --- 2. BẢNG ĐEN ---
        const signGeo = new THREE.BoxGeometry(3, 0.8, 0.1);
        const signMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 3, -2.8);
        this.mesh.add(sign);

        // --- 3. MODEL SPOTLIGHT ---
        try {
            const modelUrl = new URL('../../assets/models/SpotLight/simple_spotlight_lamp.glb', import.meta.url).href;
            const gltf = await loadGLTF(modelUrl);
            const lampModel = gltf.scene;

            // 1) Scale mặc định, tùy chỉnh nếu model quá lớn/nhỏ
            lampModel.scale.set(0.1, 0.1, 0.1);

            // 2) Đặt rotation sao cho "mắt đèn" hướng ra ngoài (vuông góc với tường).
            lampModel.rotation.set(-Math.PI / 6, 1.55, 7);

            // 3) Tính bounding box của model sau khi scale để đặt sát mặt tường
            const box = new THREE.Box3().setFromObject(lampModel);
            const size = new THREE.Vector3();
            box.getSize(size);
            const centerWorld = new THREE.Vector3();
            box.getCenter(centerWorld);

            // front face Z của backWall (vì backWall.position.z là tâm, depth = 0.2)
            const wallFrontZ = backWall.position.z + 0.1;
            const mountOffset = 0.03; // khoảng cách nhỏ để tránh xuyên chính xác

            // Muốn center của model ở vị trí: wallFrontZ - (half depth of model)
            const desiredCenterZ = wallFrontZ - (size.z / 2) - mountOffset;
            const deltaZ = desiredCenterZ - centerWorld.z;

            // Dịch model theo world Z -> chuyển về local position của lampModel
            lampModel.position.add(new THREE.Vector3(0, 0, deltaZ));

            // 4) Đặt cao độ (y) để lamp "gắn" vào tường khoảng ở trên sign
            const desiredY = 3.5;
            // Tính current world center Y và dịch tương ứng
            const currentCenterY = box.getCenter(new THREE.Vector3()).y;
            const deltaY = desiredY - currentCenterY;
            lampModel.position.add(new THREE.Vector3(0, deltaY, 0.8));

            this.mesh.add(lampModel);
            console.log("Đã load & đặt đèn lên tường");
        } catch (error) {
            console.error("Lỗi không tìm thấy file model đèn:", error);
        }

        // --- 4. NGUỒN SÁNG THỰC TẾ (LIGHT SOURCE) ---
        const spotLight = new THREE.SpotLight(0xffffff, 150);
        spotLight.position.set(0, 3.5, -2.5);

        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.3;
        spotLight.decay = 1;
        spotLight.distance = 20;
        spotLight.castShadow = true;
        spotLight.target = platform;
        this.mesh.add(spotLight);
        this.mesh.add(spotLight.target);

        this.scene.add(this.mesh);
    }
}