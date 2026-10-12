class YomikataIconButton{
    constructor(){
        this.icon = document.createElement("img");
        this.icon.classList.add("yomikata-icon");
        this.icon.src = chrome.runtime.getURL("src/icons/nihon.png");;
        
        this.yic = document.createElement("div");
        this.yic.classList.add("yomikata-icon-button");
        this.yic.appendChild(this.icon);

        this.listOfFuncs = [];
        this.yic.addEventListener("click", () => this.#playListOfFuncs());
    }
    itself(){
        return this.yic;
    }
    #playListOfFuncs(){
        for(const f of this.listOfFuncs){
            if(typeof f === "function"){
                f();
            }
        }
    }
    onClickAppend(callback){
        this.listOfFuncs.push(callback);
    }

    isVisible(){
        return this.yic.classList.contains("yomikata-hide");
    }
}
