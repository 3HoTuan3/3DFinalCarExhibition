import * as THREE from 'three';
import gsap from 'gsap';

export class Entrance {
    constructor(scene, controls) {
        this.scene = scene;
        this.controls = controls;
        this.isOpen = false;

        // Loader & wall texture
        this.loader = new THREE.TextureLoader();
        this.wallTex = this.loader.load('./assets/textures/wall/beige_wall_001_diff_4k.jpg');
        this.wallTex.wrapS = THREE.RepeatWrapping;
        this.wallTex.wrapT = THREE.RepeatWrapping;
        this.wallTex.repeat.set(4, 1);
        this.wallTex.colorSpace = THREE.SRGBColorSpace;
        this.wallTex.anisotropy = 8;

        const loadCarpetTex = (path) => {
            const tex = this.loader.load(path);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(3, 15); 
            return tex;
        };

        this.carpetDiff = loadCarpetTex('./assets/textures/carpet/velour_velvet_diff_4k.jpg');
        this.carpetDiff.colorSpace = THREE.SRGBColorSpace;

        this.init();
    }

    init() {
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0, -20);

        // --- 1. TƯỜNG MẶT TIỀN (FRONT WALL) ---
        const wallMat = new THREE.MeshStandardMaterial({
            map: this.wallTex,
            roughness: 0.9,
            metalness: 0
        });
        const wallThickness = 1.0;
        const wallHeight = 8;
        const doorWidth = 8;
        const doorHeight = 5;

        // Tường trái
        const leftPart = new THREE.Mesh(
            new THREE.BoxGeometry(16, wallHeight, wallThickness),
            wallMat
        );
        leftPart.position.set(-12, wallHeight / 2, 0);
        this.mesh.add(leftPart);

        // Tường phải
        const rightPart = new THREE.Mesh(
            new THREE.BoxGeometry(16, wallHeight, wallThickness),
            wallMat
        );
        rightPart.position.set(12, wallHeight / 2, 0);
        this.mesh.add(rightPart);

        // Tường trên (Header)
        const topPart = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth, wallHeight - doorHeight, wallThickness),
            wallMat
        );
        topPart.position.set(0, doorHeight + (wallHeight - doorHeight) / 2, 0);
        this.mesh.add(topPart);

        // --- Len chân tường mặt tiền ---
        const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xEFE9E3, roughness: 0.5 });
        const baseboardGeo = new THREE.BoxGeometry(16, 0.2, 0.6);

        const bbLeft = new THREE.Mesh(baseboardGeo, baseboardMat);
        bbLeft.position.set(-12, 0.1, 0.25);
        this.mesh.add(bbLeft);

        const bbRight = new THREE.Mesh(baseboardGeo, baseboardMat);
        bbRight.position.set(12, 0.1, 0.25);
        this.mesh.add(bbRight);

        // --- 2. Cánh cửa ---
        const gap = 0.01; // Khe hở 1cm
        const panelWidth = (doorWidth / 2) - gap;

        // Geometry cửa
        const doorGeo = new THREE.BoxGeometry(panelWidth, doorHeight, 0.2);
        doorGeo.translate(panelWidth / 2, 0, 0);

        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x5c3a21,
            roughness: 0.4,
            metalness: 0.1
        });

        // --- Cửa trái ---
        this.leftDoor = new THREE.Mesh(doorGeo, doorMat);
        this.leftDoor.position.set(-doorWidth / 2, doorHeight / 2, 0);
        this.leftDoor.userData = { isClickable: true, type: 'door' };
        this.createHandle(this.leftDoor, 'left', panelWidth);
        this.mesh.add(this.leftDoor);

        // --- Cửa phải ---
        this.rightDoor = new THREE.Mesh(doorGeo, doorMat);
        this.rightDoor.rotation.y = Math.PI;
        this.rightDoor.position.set(doorWidth / 2, doorHeight / 2, 0);
        this.rightDoor.userData = { isClickable: true, type: 'door' };
        this.createHandle(this.rightDoor, 'right', panelWidth);
        this.mesh.add(this.rightDoor);

        // --- 3. Thảm đỏ ---
        const carpetLength = 30;
        const carpetGeo = new THREE.PlaneGeometry(6, carpetLength);
        const carpetMat = new THREE.MeshStandardMaterial({
            map: this.carpetDiff,
            normalMap: this.carpetNor,
            normalScale: new THREE.Vector2(1, 1),
            aoMap: this.carpetArm,
            roughnessMap: this.carpetArm,
            metalnessMap: this.carpetArm,
            color: 0xF63049,
            roughness: 1.0, 
            metalness: 0.0,
            side: THREE.DoubleSide
        });

        const carpet = new THREE.Mesh(carpetGeo, carpetMat);
        carpet.rotation.x = -Math.PI / 2;
        carpet.position.set(0, 0.02, -15);
        carpet.receiveShadow = true;
        this.scene.add(carpet);
        this.scene.add(this.mesh);
    }

    createHandle(doorMesh, side, panelWidth) {
        const handleGroup = new THREE.Group();


        const handleMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 1.0,
            roughness: 0.3
        });

        const stickGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 16);
        const stick = new THREE.Mesh(stickGeo, handleMat);
        stick.position.z = 0.15;

        const pinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16);
        pinGeo.rotateX(Math.PI / 2);
        const pinTop = new THREE.Mesh(pinGeo, handleMat);
        pinTop.position.y = 0.2;
        pinTop.position.z = 0.075;
        const pinBottom = new THREE.Mesh(pinGeo, handleMat);
        pinBottom.position.y = -0.2;
        pinBottom.position.z = 0.075;

        handleGroup.add(stick);
        handleGroup.add(pinTop);
        handleGroup.add(pinBottom);

        handleGroup.position.set(panelWidth - 0.4, 0, 0.1);
        doorMesh.add(handleGroup);
        const handleBack = handleGroup.clone();
        handleBack.position.z = -0.1;
        handleBack.rotation.y = Math.PI;
        doorMesh.add(handleBack);
    }

    handleClick() {
        if (this.isOpen) {
            this.closeDoors();
        } else {
            this.openDoors();
        }
    }

    openDoors() {
        this.isOpen = true;
        // Mở rộng ra
        gsap.to(this.leftDoor.rotation, { y: -Math.PI / 2, duration: 2, ease: "power2.inOut" });
        gsap.to(this.rightDoor.rotation, { y: Math.PI + Math.PI / 2, duration: 2, ease: "power2.inOut" });
        this.teleportUserOut();
    }

    closeDoors() {
        this.isOpen = false;
        gsap.to(this.leftDoor.rotation, { y: 0, duration: 2 });
        gsap.to(this.rightDoor.rotation, { y: Math.PI, duration: 2 });
    }

    teleportUserOut() {
        if (this.controls) {
            const player = this.controls.getObject();
            gsap.to(player.position, {
                x: 0,
                z: 30,
                duration: 1,
                onComplete: () => {
                    player.lookAt(0, 1.6, 0);
                }
            });
        }
    }
}