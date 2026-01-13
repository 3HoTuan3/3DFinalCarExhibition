import * as THREE from 'three';

export function setupLoadingUI(containerId, progressId, onCompleteCallback) {
    const containerElement = document.getElementById(containerId);
    const progressElement = document.getElementById(progressId);
    const manager = THREE.DefaultLoadingManager;

    manager.onStart = (url, itemsLoaded, itemsTotal) => {
        // console.log('Started loading: ' + url);
        if(progressElement) {
            progressElement.style.width = '0%';
            progressElement.innerText = 'Loading...';
        }
    };

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const percent = (itemsLoaded / itemsTotal) * 100;
        // console.log('Loading: ' + Math.round(percent) + '%');
        if(progressElement) {
            progressElement.style.width = Math.round(percent) + '%';
            progressElement.innerText = `Loading Assets: ${Math.round(percent)}%`;
        }
    };

    manager.onLoad = () => {
        console.log('Loading complete!');
        if(containerElement) {
            // Hiệu ứng mờ dần
            containerElement.style.transition = 'opacity 1s ease';
            containerElement.style.opacity = '0';
            
            // Xóa khỏi màn hình sau khi mờ xong
            setTimeout(() => {
                containerElement.style.display = 'none';
                if (onCompleteCallback) onCompleteCallback();
            }, 1000);
        }
    };

    manager.onError = (url) => {
        console.error('Có lỗi khi tải file:', url);
    };
}