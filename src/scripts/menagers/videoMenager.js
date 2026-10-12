const videoWatchSelectors= {
    videoStater:"",
    videoContainer:"",
    videoElement:"video",
    videoActive:"",
    videoInactive:"",
    videoPassive:"",
}

class VideoWatch{
    sidebarAppearAction(){}
    sidebarHideAction(){}

    #setupControllerStateHook(){
        this.elementWaiter = new MutationObserver(()=>{
        const VIDEO_STATER = document.querySelector(this.specificSelectors.videoStater);

        if(VIDEO_STATER){
            this.VIDEO_STATES_ELEMENT = VIDEO_STATER;
            this.elementWaiter.disconnect();

            this.videoElementObservator = new MutationObserver((mutations)=>{
                for(const mut of mutations){
                    if(mut.type != "attributes") continue;
                    if(mut.attributeName != "class") continue;
                

                    const classList = mut.target.classList;
                    if(classList.contains(this.specificSelectors.videoActive)){
                        this.yomikataVideoOverlay.videoControlersActiveAction();
                    }else if(classList.contains(this.specificSelectors.videoInactive)){
                        this.yomikataVideoOverlay.videoControlersInactiveAction(
                            this.isReadingExplanation);
                    }else if(classList.contains(this.specificSelectors.videoPassive)){
                        this.yomikyomikataVideoOverlay.videoControlersPassiveAction();
                    }
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
    appendVideoOverlay(){
        throw new Error("You need to override appendVideoOverlay() in VideoWatch class")
    }
    constructor(yomikataIconButton,yomikataSidebar,yomikataSubtitles,videoWatchContainer,videoElement,specificSelectors){
        this.specificSelectors = specificSelectors;

        this.elementWaiter = null;
        this.videoElementObservator = null;

        this.yomikataVideoOverlay = new YomikataVideoOverlay(
            yomikataSidebar,
            yomikataIconButton,
            yomikataSubtitles
        );
        this.yomikataIcBtn = yomikataIconButton;
        this.yomikataSiBar = yomikataSidebar;
        this.yomikataSubtitles = yomikataSubtitles;

        this.VIDEO_STATES_ELEMENT = null;
        this.WATCH_VIDEO_CONTAINER = videoWatchContainer;
        this.VIDEO_ELEMENT = videoElement;

        this.appendVideoOverlay();

        this.#setupControllerStateHook();

        this.isReadingExplanation = false;

        this.yomikataIcBtn.onClickAppend(()=>{
            this.yomikataSiBar.toggle();
        });
        this.yomikataSiBar.onToggle((isVisible)=>{
            isVisible ? this.sidebarAppearAction() : this.sidebarHideAction();
        });
    }
    #isVideoOn(){
        return !this.VIDEO_ELEMENT.paused;
    }
    destroy(){
        try{
            this.WATCH_VIDEO_CONTAINER.removeChild(this.yomikataIcBtn.yic);
            this.WATCH_VIDEO_CONTAINER.removeChild(this.yomikataSiBar.ys);
            this.WATCH_VIDEO_CONTAINER.removeChild(this.yomikataSubtitles.itself());   
            delete this.yomikataVideoOverlay;         
        }catch{}

        try{
            this.videoElementObservator.disconnect();
            this.elementWaiter.disconnect();
        }catch{}

        try{
            delete this.yomikataSubtitles;
        }
    }
}
class VideoMenager{
    async additionalWaitForElements(){}
    constructor(specificSelectors){
        this.specificSelectors = specificSelectors;

        this.CONFIG = new Config();

        this.WATCH_VIDEO_CONTAINER = null;
        this.VIDEO_ELEMENT = null;
        this.SUB_ELEMENT = null;

        this.yomikataIconButton = new YomikataIconButton();
        this.yomikataSidebar = new YomikataSidebar();
        this.yomikataSubtitles = new YomikataSubsElement();
        this.yomikataSubList = null;
        this.yomikataSubMenger = null;

        this.video = null;
    }
    createVideoWatch(){
        this.vWatch = new VideoWatch(
            this.yomikataIconButton,
            this.yomikataSidebar,
            this.yomikataSubtitles,
            this.WATCH_VIDEO_CONTAINER,
            this.VIDEO_ELEMENT,
            this.specificSelectors);
    }
    async waitForElements(){
        this.WATCH_VIDEO_CONTAINER = await waitForElement(this.specificSelectors.videoContainer);
        this.VIDEO_ELEMENT = await waitForElement(this.specificSelectors.videoElement);
        this.yomikataSubList = await this.waitForSubList(
            this.yomikataSidebar,
            this.VIDEO_ELEMENT,
            this.CONFIG.jimakuApiKey);
        
        this.createVideoWatch();

        this.yomikataSubMenger = new SubtitlesMenager(
            this.yomikataSubList,
            this.yomikataSubtitles,
            this.VIDEO_ELEMENT,
            ()=>{this.vWatch.isReadingExplanation = true},
            ()=>{this.vWatch.isReadingExplanation = false});

        if(this.yomikataSubMenger){
            this.yomikataSidebar.leftShiftButtonOnClick(()=>{
                if(this.yomikataSubMenger.offsetMinus100ms()){
                    this.yomikataSidebar.refreshOffsetVal(false);
                }
                }
            )
            this.yomikataSidebar.rightShiftButtonOnClick(()=>{
                if(this.yomikataSubMenger.offsetPlus100ms()){
                    this.yomikataSidebar.refreshOffsetVal(true);
                }
                }
            )
        }

        await this.additionalWaitForElements();
    }
    async build(){
        await this.waitForElements();
        await this.yomikataSubMenger.init();
    }
    async getTitle(){
        throw new Error("getTitle() in class VideoMenager was not overriden");
    }
    async getEpisode(){
        throw new Error("getEpisode() in class VideoMenager was not overriden");
    }
    async waitForSubList(yomikataSidebar,videoElement,apiKey){
        const animeTitleH = await this.getTitle();
        const animeEp = await this.getEpisode();

        const sub_res = await fetchDownloadJimakuSubs(animeTitleH,animeEp,"netflix",apiKey);
        if(sub_res.ok){
            function sideBarAppendTextBlock(subObj){
                const textBlock = document.createElement("button");
                textBlock.classList.add("yomikata-sidebar-item");
                textBlock.textContent = subObj.content;

                textBlock.addEventListener("click",()=>{});

                yomikataSidebar.appendChild(textBlock);
            }
            return new SubList(sub_res,sideBarAppendTextBlock);
        }else{
            const msg = document.createElement("a");
            msg.classList.add("yomikata-sidebar-message");
            msg.textContent = "Sorry it appears that there are no Subtitles for this episode!";
            yomikataSidebar.appendChild(msg);
        }
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

function isCharSeparator(char){
    return /[\s.\/?'\\|]/.test(char);
}