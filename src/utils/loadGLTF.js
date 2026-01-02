import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export const loadGLTF = (path) => {
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (gltf) => { resolve(gltf); },
            undefined, 
            (error) => { reject(error); }
        );
    });
};