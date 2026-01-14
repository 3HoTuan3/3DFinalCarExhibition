export class DialogueManager {
    constructor(controls) {
        this.controls = controls;
        this.box = document.getElementById('dialogue-box');
        this.nameEl = document.getElementById('dialogue-name');
        this.textEl = document.getElementById('dialogue-text');
        
        this.isActive = false;
        this.dialogueLines = [];
        this.currentIndex = 0;
    }

    start(name, lines) {
        if (this.isActive) return;
        
        this.isActive = true;
        this.dialogueLines = lines;
        this.currentIndex = 0;
        this.nameEl.innerText = name;
        
        // Hiện UI
        this.box.style.display = 'block';
        this.controls.unlock();

        this.showLine();
    }

    showLine() {
        if (this.currentIndex < this.dialogueLines.length) {
            this.textEl.innerText = this.dialogueLines[this.currentIndex];
        } else {
            this.end();
        }
    }

    next() {
        if (!this.isActive) return;
        
        this.currentIndex++;
        if (this.currentIndex < this.dialogueLines.length) {
            this.showLine();
        } else {
            this.end();
        }
    }

    end() {
        this.isActive = false;
        this.box.style.display = 'none';
        this.controls.lock();
    }
}