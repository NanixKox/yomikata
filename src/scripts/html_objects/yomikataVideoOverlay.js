class YomikataVideoOverlay{
    constructor(sidebar,icon,subsElement){
        this.sidebar = sidebar;
        this.icon = icon;
        this.subsElement = subsElement;

        this.squishyPanel = document.createElement("div");
        this.squishyPanel.classList.add("yomikata-overlay-squishy-panel");
        this.squishyPanel.append(
            this.icon.itself(),
            this.subsElement.itself()
        );

        this.overlay = document.createElement("div");
        this.overlay.classList.add("yomikata-video-overlay");

        this.overlay.append(
            this.squishyPanel,
            this.sidebar.itself()
        );
    }
    changePositionAndSize(x,y,width,heigth){
        this.overlay.style.left = `${x}px`;
        this.overlay.style.top = `${y}px`;
        //this.overlay.style.width = `${width}px`;
        this.overlay.style.height = `${heigth}px`;
    }

    videoControlersActiveAction(){
        this.icon.yic.classList.remove("yomikata-hide");

        this.subsElement.subContainer.classList.add("yomikata-subtitle-container-up");
        this.subsElement.subContainer.classList.remove("yomikata-subtitle-container-hide");
    }
    videoControlersInactiveAction(isReadingExplanation){
        this.icon.yic.classList.add("yomikata-hide");

        if(!isReadingExplanation){
            this.subsElement.subContainer.classList.remove("yomikata-subtitle-container-up");
            this.subsElement.subContainer.classList.remove("yomikata-subtitle-container-hide");
        }
    }
    videoControlersPassiveAction(){
        this.icon.yic.classList.add("yomikata-hide");

        this.subsElement.subContainer.classList.remove("yomikata-subtitle-container-up");
        this.subsElement.subContainer.classList.add("yomikata-subtitle-container-hide");
    }

    itself(){
        return this.overlay;
    }
}