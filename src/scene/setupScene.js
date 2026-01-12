import * as THREE from 'three';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // --- TẠO SÀN NHÀ (40 x 40) ---
    const loader = new THREE.TextureLoader();
    const texUrl = new URL('../../assets/textures/floorBackground.jpg', import.meta.url).href;
    const floorTexture = loader.load(texUrl);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.anisotropy = 8;

    const tileSize = 4;          // kích thước mỗi tile (m)
    const tilesX = 10;           // số tile theo X => tổng rộng = tileSize * tilesX
    const tilesZ = 10;           // số tile theo Z
    const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize);
    const tileMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.8, metalness: 0.2 });

    for (let i = 0; i < tilesX; i++) {
        for (let j = 0; j < tilesZ; j++) {
            const tile = new THREE.Mesh(tileGeo, tileMat);
            tile.rotation.x = -Math.PI / 2;
            tile.position.x = (i - tilesX / 2 + 0.5) * tileSize;
            tile.position.z = (j - tilesZ / 2 + 0.5) * tileSize;
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }

    // --- TƯỜNG BAO QUANH (3 Mặt: Trái, Phải, Sau) ---
    const wallHeight = 8;
    const wallGeo = new THREE.BoxGeometry(40, wallHeight, 0.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }); // Tường xám đậm

    // 1. Tường Sau (Back - phía z = 20)
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, wallHeight / 2, 20);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // 2. Tường Trái (Left - phía x = -20)
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-20, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // 3. Tường Phải (Right - phía x = 20)
    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.set(20, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // --- GridHelper để dễ căn vị trí
    const grid = new THREE.GridHelper(tileSize * tilesX, tileSize * tilesX, 0x000000, 0x555555);
    scene.add(grid);

    return scene;
}