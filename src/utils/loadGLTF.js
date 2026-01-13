import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export const loadGLTF = (path) => {
    return new Promise((resolve, reject) => {
        // KHÔNG TRUYỀN MANAGER VÀO ĐÂY -> Nó sẽ tự dùng DefaultLoadingManager
        const loader = new GLTFLoader();
        
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);

        loader.load(
            path,
            (gltf) => {
                resolve(gltf);
            },
            (xhr) => {
                // onProgress mặc định
            },
            (error) => {
                console.error("Lỗi tải model:", path, error);
                reject(error);
            }
        );
    });
};