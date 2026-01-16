export class MusicManager {
    constructor(playlist) {
        this.playlist = playlist;
        this.currentIndex = 0;
        this.isPlaying = false;
        
        // Tạo Audio object
        this.audio = new Audio();
        this.audio.volume = 0.2; // Âm lượng mặc định 20%

        // Lấy các element UI
        this.uiName = document.getElementById('music-name');
        this.uiTime = document.getElementById('music-time');
        this.uiContainer = document.getElementById('music-panel');

        // Setup sự kiện
        this.audio.addEventListener('timeupdate', () => this.updateUI());
        this.audio.addEventListener('ended', () => this.next()); // Hết bài tự qua bài mới

        // Load bài đầu tiên
        this.loadTrack(this.currentIndex);
    }

    loadTrack(index) {
        if (index < 0) index = this.playlist.length - 1;
        if (index >= this.playlist.length) index = 0;

        this.currentIndex = index;
        this.audio.src = this.playlist[this.currentIndex].path;
        this.uiName.innerText = `🎵 ${this.playlist[this.currentIndex].name}`;
        
        // Reset thời gian hiển thị
        this.uiTime.innerText = "00:00 / 00:00";
    }

    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.uiContainer.classList.add('playing');
            })
            .catch(e => console.log("Cần tương tác người dùng để phát nhạc:", e));
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.uiContainer.classList.remove('playing');
    }

    toggle() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    next() {
        this.loadTrack(this.currentIndex + 1);
        if (this.isPlaying) this.play();
    }

    prev() {
        this.loadTrack(this.currentIndex - 1);
        if (this.isPlaying) this.play();
    }

    // Format giây sang MM:SS
    formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    updateUI() {
        const current = this.formatTime(this.audio.currentTime);
        const duration = this.formatTime(this.audio.duration);
        this.uiTime.innerText = `${current} / ${duration}`;
    }
}