const videoWatchClasses = {
    videoStater:"",
    videoContainer:"",
    videoElement:""
}
class VideoWatch{
    #appendController(){
        this.WATCH_VIDEO_CONTAINER.appendChild(this.yomikataIcBtn.yic);
    }
    #videoControlersActiveAction(){
        this.yomikataIcBtn.yic.classList.remove("yomikata-hide");

        this.yomikataSubtitles.subContainer.classList.add("yomikata-subtitle-container-up");
        this.yomikataSubtitles.subContainer.classList.remove("yomikata-subtitle-container-hide");
    }
    #videoControlersInactiveAction(){
        this.yomikataIcBtn.yic.classList.add("yomikata-hide");

        if(!this.isReadingExplanation){
            this.yomikataSubtitles.subContainer.classList.remove("yomikata-subtitle-container-up");
            this.yomikataSubtitles.subContainer.classList.remove("yomikata-subtitle-container-hide");
        }
    }
    #videoControlersPassiveAction(){
        this.yomikataIcBtn.yic.classList.add("yomikata-hide");

        this.yomikataSubtitles.subContainer.classList.remove("yomikata-subtitle-container-up");
        this.yomikataSubtitles.subContainer.classList.add("yomikata-subtitle-container-hide");
    }
    #setupControllerStateHook(){
        this.elementWaiter = new MutationObserver(()=>{
        const VIDEO_STATER = document.querySelector(this.specificClasses.videoStater);

        if(VIDEO_STATER){
            this.VIDEO_STATES_ELEMENT = VIDEO_STATER;
            this.elementWaiter.disconnect();

            this.videoElementObservator = new MutationObserver((mutations)=>{
                for(const mut of mutations){
                    if(mut.type != "attributes") continue;
                    if(mut.attributeName != "class") continue;
                }

                const classList = mut.target.classList;
                if(classList.contains("active")){
                    this.#videoControlersActiveAction();
                }else if(classList.contains("inactive")){
                    this.#videoControlersInactiveAction();
                }else if(classList.contains("passive")){
                    this.#videoControlersPassiveAction();
                }
            });

            this.videoElementObservator.observe(VIDEO_STATER,{
            attributes: true,
            attributeFilter: ["class"],
            attributeOldValue: true
            });
        }
        })
        this.elementWaiter.observe(document.body, {
        childList: true,
        subtree: true
        });
    }
    #appendSidebar(){
        this.WATCH_VIDEO_CONTAINER.appendChild(this.yomikataSiBar.ys);
    }
    #appendSubtitles(){
        this.WATCH_VIDEO_CONTAINER.appendChild(this.yomikataSubtitles.itself());
    }
    constructor(yomikataIconButton,yomikataSidebar,yomikataSubtitles,videoWatchContainer,videoElement,specificClasses){
        this.specificClasses = specificClasses;

        this.elementWaiter = null;
        this.videoElementObservator = null;

        this.yomikataIcBtn = yomikataIconButton;
        this.yomikataSiBar = yomikataSidebar;
        this.yomikataSubtitles = yomikataSubtitles;

        this.VIDEO_STATES_ELEMENT = null;
        this.WATCH_VIDEO_CONTAINER = videoWatchContainer;
        this.VIDEO_ELEMENT = videoElement;



        this.isReadingExplanation = false;
    }
    #isVideoOn(){
        return !this.VIDEO_ELEMENT.paused;
    }
    destroy(){
        try{
            this.WATCH_VIDEO_CONTAINER.removeChild(this.yomikataIcBtn.yic);
            this.WATCH_VIDEO_CONTAINER.removeChild(this.yomikataSiBar.ys);
            this.WATCH_VIDEO_CONTAINER.removeChild(this.yomikataSubtitles.itself());            
        }catch{}

        try{
            this.videoElementObservator.disconnect();
            this.elementWaiter.disconnect();
        }catch{}
    }
}
class VideoMenager{
    constructor(specificClasses){
        this.specificClasses = specificClasses;

        this.CONFIG = new Config();

        this.WATCH_VIDEO_CONTAINER = null;
        this.VIDEO_ELEMENT = null;
        this.SUB_ELEMENT = null;

        this.yomikataIconButton = new YomikataIconButton();
        this.yomikataSidebar = new YomikataSidebar();
        this.yomikataSubtitles = new YomikataSubsElement();
        this.yomikataSubList = null;
        this.yomikataSubMenger = null;

        this.yomikataIconButton.onClick(()=>{
            this.yomikataSidebar.toggle();
        });
        this.yomikataSidebar.onToggle((isVisible)=>{

        });

        this.video = null;
    }
    async waitForElements(){
        this.WATCH_VIDEO_CONTAINER = await waitForElement(this.specificClasses.videoContainer);
        this.VIDEO_ELEMENT = await waitForElement(this.specificClasses.videoElement);
        this.yomikataSubList = await waitForSubList(
            this.yomikataSidebar,
            this.VIDEO_ELEMENT,
            this.CONFIG.jimakuApiKey);
        
        this.vWatch = new VideoWatch(
            this.yomikataIconButton,
            this.yomikataSidebar,
            this.yomikataSubtitles,
            this.WATCH_VIDEO_CONTAINER,
            this.VIDEO_ELEMENT,
            this.specificClasses);

        this.yomikataSubMenger = new SubtitlesMenager(
            this.yomikataSubList,
            this.yomikataSubtitles,
            this.VIDEO_ELEMENT,
            ()=>{this.vWatch.isReadingExplanation = true},
            ()=>{this.vWatch.isReadingExplanation = false});
    }
    async build(){

    }
}

function waitForElement(querySelectorStr,maxWaitTime = 0){
    return new Promise((resolve) => {
            const element = document.querySelector(querySelectorStr);

            if (element) {
                resolve(element);
                return;
            }

            const observeElement = new MutationObserver(() => {
                const element = document.querySelector(querySelectorStr);

                if (element) {
                    observeElement.disconnect();
                    resolve(element);
                }
            });

            observeElement.observe(document.body, {
                childList: true,
                subtree: true
            });

            if(maxWaitTime){
                const timeout = setTimeout(()=>{
                    observeElement.disconnect();

                     resolve(null);
                     return;
                },maxWaitTime);
            }
        });
}