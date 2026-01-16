import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

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

    // --- 2. Sân ngoài ---
    const setupTexture = (path, isColor = false) => {
        const tex = loader.load(path);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(50, 50);
        tex.anisotropy = 16;
        if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    };

    // load diffuse map
    const groundDiff = setupTexture('./assets/textures/ground/ground_diff_4k.jpg', true);
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({
        map: groundDiff,
        roughness: 0.9,
        metalness: 0,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- 3. Bầu trời & ánh sáng ---
    // Load file .hdr
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./assets/textures/citrus_orchard_puresky_4k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        // Gán nền trời
        scene.background = texture;

        // Gán ánh sáng môi trường
        scene.environment = texture;

        // Chỉnh độ sáng của nền trời
        scene.backgroundIntensity = 0.4;
        scene.environmentIntensity = 0.2;
    }, undefined, function (err) {
        console.error("Lỗi load HDRI sky.hdr. Hãy chắc chắn bạn đã tải file và đặt đúng chỗ.", err);
        scene.background = new THREE.Color(0xa0a0a0);
    });

    // --- Tường bao quanh (3 Mặt: Trái, Phải, Sau) ---
    const setupWallTexture = (path, isColor = false) => {
        const tex = loader.load(path);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 1);
        if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    };

    const wallDiff = setupWallTexture('./assets/textures/wall/beige_wall_001_diff_4k.jpg', true);
    const wallMat = new THREE.MeshStandardMaterial({
        map: wallDiff,
        roughness: 0.9,
        metalness: 0,
    });

    const wallHeight = 8;
    const wallGeo = new THREE.BoxGeometry(40, wallHeight, 0.5);

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

    // --- Len chân tường ---
    const baseboardGeo = new THREE.BoxGeometry(40, 0.2, 0.6); // Cao 20cm, Dày hơn tường xíu (0.6)
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xEFE9E3, roughness: 0.5 });

    // Len chân tường sau
    const bbBack = new THREE.Mesh(baseboardGeo, baseboardMat);
    bbBack.position.set(0, 0.1, 20);
    scene.add(bbBack);

    // Len chân tường trái
    const bbLeft = new THREE.Mesh(baseboardGeo, baseboardMat);
    bbLeft.rotation.y = Math.PI / 2;
    bbLeft.position.set(-20, 0.1, 0);
    scene.add(bbLeft);

    // Len chân tường phải
    const bbRight = new THREE.Mesh(baseboardGeo, baseboardMat);
    bbRight.rotation.y = Math.PI / 2;
    bbRight.position.set(20, 0.1, 0);
    scene.add(bbRight);

    // --- 3. Trần nhà ---
    const ceilingGeo = new THREE.PlaneGeometry(40, 40);
    const ceilingDiff = setupWallTexture('./assets/textures/wall/beige_wall_001_diff_4k.jpg', true);
    const ceilingMat = new THREE.MeshStandardMaterial({
        map: ceilingDiff,
        roughness: 0.9,
        metalness: 0,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    scene.add(ceiling);

    // --- 4. Đèn trần ---
    const lightTargets = [
        { x: 0, z: 0 },
        { x: -12, z: -12 },
        { x: 12, z: -12 },
        { x: 12, z: 12 },
        { x: -12, z: 12 }
    ];

    lightTargets.forEach(pos => {
        // a) Tạo Model bóng đèn trên trần
        const fixtureGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
        const fixtureMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixture.position.set(pos.x, wallHeight - 0.1, pos.z);
        scene.add(fixture);

        // b) Tạo lõi đèn phát sáng
        const bulbGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.y = -0.11;
        fixture.add(bulb);

        // c) Tạo SpotLight chiếu xuống
        const spotLight = new THREE.SpotLight(0xffffff, 50);
        spotLight.position.set(pos.x, wallHeight - 0.5, pos.z);

        spotLight.target.position.set(pos.x, 0, pos.z);

        // Cấu hình bóng đổ và góc chiếu
        spotLight.angle = Math.PI / 5; // đèn sáng độ rộng: 45 độ
        spotLight.penumbra = 0.5;
        spotLight.distance = 30;
        spotLight.decay = 1;
        spotLight.castShadow = true;

        // Tối ưu shadow map
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.bias = -0.0001;

        scene.add(spotLight);
        scene.add(spotLight.target);
    });

    // --- GridHelper để dễ căn vị trí
    // const grid = new THREE.GridHelper(tileSize * tilesX, tileSize * tilesX, 0x000000, 0x555555);
    // scene.add(grid);

    return scene;
}