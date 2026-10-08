class YomikataVideoOverlay{
    constructor(){
        this.overlay = document.createElement("div");
        this.overlay.classList.add("yomikata-video-overlay");
    }
    itself(){
        return this.overlay;
    }
}