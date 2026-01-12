import * as THREE from 'three';
import gsap from 'gsap';

export class Entrance {
    constructor(scene, controls) {
        this.scene = scene;
        this.controls = controls;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.mesh = new THREE.Group();
        // Vị trí cụm cửa
        this.mesh.position.set(0, 0, -20); 
        
        // --- 1. FRONT WALL ---
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
        const wallThickness = 1.0;
        const wallHeight = 8;
        const doorWidth = 8;  // Door width 8m
        const doorHeight = 5; // Door height 5m

        // Phần tường bên trái cửa
        const leftPart = new THREE.Mesh(
            new THREE.BoxGeometry((40 - doorWidth) / 2, wallHeight, wallThickness), 
            wallMat
        );
        leftPart.position.set(-(20 + doorWidth/2)/2 - 2, wallHeight/2, 0); 

        leftPart.geometry = new THREE.BoxGeometry(16, wallHeight, wallThickness);
        leftPart.position.set(-12, wallHeight/2, 0);
        this.mesh.add(leftPart);

        // Phần tường bên phải cửa
        const rightPart = new THREE.Mesh(
            new THREE.BoxGeometry(16, wallHeight, wallThickness), 
            wallMat
        );
        rightPart.position.set(12, wallHeight/2, 0);
        this.mesh.add(rightPart);

        // Phần tường phía trên cửa (Header)
        const topPart = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth, wallHeight - doorHeight, wallThickness), 
            wallMat
        );
        topPart.position.set(0, doorHeight + (wallHeight - doorHeight)/2, 0);
        this.mesh.add(topPart);

        // --- 2. DOORS ---
        const doorGeo = new THREE.BoxGeometry(doorWidth / 2, doorHeight, 0.2);
        doorGeo.translate(doorWidth / 4, 0, 0); 

        const doorMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Màu nâu gỗ
            roughness: 0.3,
            metalness: 0.1
        });

        // Cửa Trái
        this.leftDoor = new THREE.Mesh(doorGeo, doorMat);
        this.leftDoor.position.set(-doorWidth/2, doorHeight/2, 0);

        this.leftDoor.userData = { isClickable: true, type: 'door' };
        this.mesh.add(this.leftDoor);

        // Cửa Phải
        this.rightDoor = new THREE.Mesh(doorGeo, doorMat);

        this.rightDoor.rotation.y = Math.PI; 
        this.rightDoor.position.set(doorWidth/2, doorHeight/2, 0);
        this.rightDoor.userData = { isClickable: true, type: 'door' };
        this.mesh.add(this.rightDoor);

        // --- 3. RED CARPET ---
        // Chiều dài thảm trải
        const carpetLength = -30; 
        const carpetGeo = new THREE.PlaneGeometry(6, carpetLength);
        const carpetMat = new THREE.MeshStandardMaterial({ 
            color: 0xaa0000, // Đỏ đậm
            roughness: 1.0,  // Vải nhung không bóng
            side: THREE.DoubleSide
        });
        const carpet = new THREE.Mesh(carpetGeo, carpetMat);
        carpet.rotation.x = -Math.PI / 2;

        carpet.position.set(0, 0.02, -20);
        carpet.receiveShadow = true;
        this.scene.add(carpet);
        this.scene.add(this.mesh);
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
        // Cửa trái xoay -90 độ
        gsap.to(this.leftDoor.rotation, { y: -Math.PI / 2, duration: 2, ease: "power2.inOut" });
        // Cửa phải xoay +90 độ (cộng thêm PI ban đầu)
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
                z: 30, // Ra ngoài sân
                duration: 1,
                onComplete: () => {
                    player.lookAt(0, 1.6, 0);
                }
            });
        }
    }
}