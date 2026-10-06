class NetflixWatch{
    #appendController(){
        this.NETFLIX_WATCH_VIDEO_E.appendChild(this.yomikataIcBtn.yic);
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
        const NETFLIX_VIDEO_STATER = document.querySelector(".default-ltr-iqcdef-cache-fntwn3");

        if(NETFLIX_VIDEO_STATER){
            this.NETFLIX_VIDEO_STATES_ELEMENT = NETFLIX_VIDEO_STATER;
            this.elementWaiter.disconnect();

            this.NetflixVObservator = new MutationObserver((mutations)=>{
                for(const mut of mutations){
                    if(mut.type != "attributes") continue;
                    if(mut.attributeName != "class") continue;

                    const classList = mut.target.classList;
                    if(classList.contains("active")){
                        this.#videoControlersActiveAction();
                    }else if(classList.contains("inactive")){
                        this.#videoControlersInactiveAction();
                    }else if(classList.contains("passive")){
                        this.#videoControlersPassiveAction();
                    }
                    //console.log(NETFLIX_VIDEO_STATER.classList);
                }
            });

            this.NetflixVObservator.observe(NETFLIX_VIDEO_STATER, {
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
        this.NETFLIX_WATCH_VIDEO_E.appendChild(this.yomikataSiBar.ys);
    }
    #appendSubtitles(){
        this.NETFLIX_WATCH_VIDEO_E.appendChild(this.yomikataSubtitles.itself());
    }
    constructor(yomikataIconButton,yomikataSidebar,yomikataSubtitles,netflixWatchDiv,netflixVideo){
        this.elementWaiter = null;
        this.NetflixVObservator = null;

        this.yomikataIcBtn = yomikataIconButton;
        this.yomikataSiBar = yomikataSidebar;
        this.yomikataSubtitles = yomikataSubtitles;
        
        this.NETFLIX_VIDEO_STATES_ELEMENT = null;
        this.NETFLIX_WATCH_VIDEO_E = netflixWatchDiv;
        this.NETFLIX_VIDEO = netflixVideo;

        this.#appendController();
        this.#appendSidebar();
        this.#appendSubtitles();

        this.#setupControllerStateHook();

        this.isReadingExplanation = false;
    }
    #isVideoOn(){
        return !this.NETFLIX_VIDEO.paused;
    }

    destroy(){
        try{
            this.NETFLIX_WATCH_VIDEO_E.removeChild(this.yomikataIcBtn.yic);
            this.NETFLIX_WATCH_VIDEO_E.removeChild(this.yomikataSiBar.ys);
            this.NETFLIX_WATCH_VIDEO_E.removeChild(this.yomikataSubtitles.itself());
        }catch{}

        try{
            this.NetflixVObservator.disconnect();
            this.elementWaiter.disconnect();
        }catch{}
    }
}
class NetflixMenager{
    constructor(){
        this.CONFIG = new Config();

        this.NETFLIX_WATCH_DIV = null;
        this.NETFLIX_VIDEO_ELEMENT = null;
        this.NETFLIX_SUB_ELEMENT = null;

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

        this.netflixSubMutation = null;
    }
    async waitForElements(){
        this.NETFLIX_WATCH_DIV = await waitForElement(".watch-video");
        this.NETFLIX_VIDEO_ELEMENT = await waitForElement("video");
        this.yomikataSubList = await waitForSubList(
            this.yomikataSidebar,
            this.NETFLIX_VIDEO_ELEMENT,
            this.CONFIG.jimakuApiKey);
        
        this.netflixWatch = new NetflixWatch(
            this.yomikataIconButton,
            this.yomikataSidebar,
            this.yomikataSubtitles,
            this.NETFLIX_WATCH_DIV,
            this.NETFLIX_VIDEO_ELEMENT);

        this.yomikataSubMenger = new SubtitlesMenager(
            this.yomikataSubList,
            this.yomikataSubtitles,
            this.NETFLIX_VIDEO_ELEMENT,
            ()=>{this.netflixWatch.isReadingExplanation = true},
            ()=>{this.netflixWatch.isReadingExplanation = false});
    }

    async build(){
        await this.waitForElements();
        await this.yomikataSubMenger.init();
    }

    destroy(){
        try{
            this.yomikataSubMenger.destroy();
        }catch{}
        try{
            this.netflixWatch.destroy();
        }catch{}
    }
}
async function getTitle(){
    const animeDataDiv = await waitForElement(".default-ltr-iqcdef-cache-m1ta4i");
    animeDataDiv.querySelector('[data-uia="video-title"] h4') ? console.log("jest tytul") : console.log("nie ma tytulu");

    return (animeDataDiv.querySelector("h4")).textContent;
    document.querySelector('[data-uia="video-title"] h4') ? console.log("jest tytul") : console.log("nie ma tytulu");
    return document.querySelector('[data-uia="video-title"] h4')
        ?.textContent
        ?.trim();
}
async function getEpisode(){
    const animeDataDiv = await waitForElement(".default-ltr-iqcdef-cache-m1ta4i");

    return parseInt((animeDataDiv.querySelector("span")).textContent.replace(/\D/g, ""),10);
}
async function waitForSubList(yomikataSidebar,videoElement,apiKey){
    const netflixTitle =
    document.querySelector('[data-uia="video-title"] h4')
        ?.textContent
        ?.trim();

        console.log(netflixTitle);
    const animeTitleH = await getTitle();
    const animeEp = await getEpisode();

    const sub_res = await fetchDownloadJimakuSubs(animeTitleH,animeEp,"netflix",apiKey);
    if(sub_res.ok){
        function sideBarAppendTextBlock(subObj){
            const textBlock = document.createElement("button");
            textBlock.classList.add("yomikata-sidebar-item");
            textBlock.textContent = subObj.content;

            textBlock.addEventListener("click",()=>{
                //console.log(subObj.timeStart, typeof subObj.timeStart);
                //videoElement.fastSeek(subObj.timeStart);
                //videoElement.currentTime = subObj.timeStart;
                //videoElement.pause();
            });

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