class YomikataIconButton{
    constructor(){
        this.icon = document.createElement("img");
        this.icon.classList.add("yomikata-icon");
        this.icon.src = chrome.runtime.getURL("src/icons/nihon.png");;
        
        this.yic = document.createElement("div");
        this.yic.classList.add("yomikata-icon-button");
        this.yic.appendChild(this.icon);
    }

    onClick(callback){
        this.yic.addEventListener("click",callback);
    }

    isVisible(){
        return this.yic.classList.contains("yomikata-hide");
    }
}
