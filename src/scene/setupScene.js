import * as THREE from 'three';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // --- TẠO SÀN NHÀ --- (thay cho plane 40x40 đơn)
    const loader = new THREE.TextureLoader();
    const texUrl = new URL('../../assets/textures/floorBackground.jpg', import.meta.url).href;
    const floorTexture = loader.load(texUrl);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    // mỗi tile hiển thị toàn bộ ảnh; nếu muốn repeat trong 1 tile chỉnh below
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

    // --- GridHelper để dễ căn vị trí khi code
    const grid = new THREE.GridHelper(tileSize * tilesX, tileSize * tilesX, 0x000000, 0x555555);
    scene.add(grid);

    return scene;
}