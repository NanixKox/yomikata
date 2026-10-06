class YomikataSubsElement{
    constructor(){
        this.subBox = document.createElement("div");
        this.subBox.classList.add("yomikata-subtitle-box");

        this.subContainer = document.createElement("div");
        this.subContainer.classList.add("yomikata-subtitle-container");
        this.subContainer.classList.add("yomikata-sub-expl-up");
        
        this.subContainer.appendChild(this.subBox);
    }

    setSubtitles(str){
        this.subBox.textContent = str;
    }
    appendSubtitles(elements){ 
        this.subBox.textContent = "";
        this.subBox.appendChild(elements);
    }

    itself(){
        return this.subContainer;
    }
}