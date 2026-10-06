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
        const elementWaiter = new MutationObserver(()=>{
        const NETFLIX_VIDEO_STATER = document.querySelector(".default-ltr-iqcdef-cache-fntwn3");

        if(NETFLIX_VIDEO_STATER){
            this.NETFLIX_VIDEO_STATES_ELEMENT = NETFLIX_VIDEO_STATER;
            elementWaiter.disconnect();

            const NetflixVObservator = new MutationObserver((mutations)=>{
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

            NetflixVObservator.observe(NETFLIX_VIDEO_STATER, {
            attributes: true,
            attributeFilter: ["class"],
            attributeOldValue: true
            });
        }
        })
        elementWaiter.observe(document.body, {
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
    startReadingExp(){
        this.isReadingExplanation = true;
    }
    endReadingExp(){
        this.isReadingExplanation = false;
        if(this.NETFLIX_VIDEO_STATES_ELEMENT){
            if(this.NETFLIX_VIDEO_STATES_ELEMENT.classList.contains("active")){
                this.#videoControlersActiveAction();
                return;
            }
            if(this.NETFLIX_VIDEO_STATES_ELEMENT.classList.contains("inactive")){
                this.#videoControlersInactiveAction();
                return;
            }
            if(this.NETFLIX_VIDEO_STATES_ELEMENT.classList.contains("passive")){
                this.#videoControlersPassiveAction();
                return;
            }
        }
    }
    pausVideo(){
        this.NETFLIX_VIDEO.pause();
    }
    playVideo(){
        this.NETFLIX_VIDEO.play();
    }

}
async function waitForElement(querySelectorStr){
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
        });
}
async function waitForSubList(yomikataSidebar,videoElement,apiKey){
    const animeDataDiv = await waitForElement(".default-ltr-iqcdef-cache-m1ta4i");

    const animeTitleH = (animeDataDiv.querySelector("h4")).textContent;
    const animeEp = parseInt((animeDataDiv.querySelector("span")).textContent.replace(/\D/g, ""),10);

    const sub_res = await fetchDownloadJimakuSubs(animeTitleH,animeEp,"netflix",apiKey);
    if(sub_res.ok){
        function sideBarAppendTextBlock(subObj){
            const textBlock = document.createElement("button");
            textBlock.classList.add("yomikata-sidebar-item");
            textBlock.textContent = subObj.content;

            textBlock.addEventListener("click",()=>{
                //videoElement.currentTime = subObj.timeStart;
                //videoElement.pause();
            });

            yomikataSidebar.appendChild(textBlock);
        }
        return new SubList(sub_res,sideBarAppendTextBlock);
    }else{

    }
}
function isCharSeparator(char){
    return /[\s.\/?'\\|]/.test(char);
}
async function main() {
    const CONFIG = new Config();

    const netflixWatchDiv = await waitForElement(".watch-video");
    const netflixVideoEle = await waitForElement("video");

    const yomikataIconButton = new YomikataIconButton();
    const yomikataSidebar = new YomikataSidebar();
    const yomikataSubtitles = new YomikataSubsElement();
    const yomikataSubList = await waitForSubList(yomikataSidebar,netflixVideoEle,CONFIG.jimakuApiKey);
    
    yomikataIconButton.onClick(()=>{
        yomikataSidebar.toggle();
    });
    yomikataSidebar.onToggle((isVisible)=>{

    });
    const netflixMenager = new NetflixWatch(yomikataIconButton,yomikataSidebar,yomikataSubtitles,netflixWatchDiv,netflixVideoEle);

    //SUBTITLES SEGMENT
    const yomikataTokenizer = new YomikataTokenizer();
    await yomikataTokenizer.initSudachi();

    let lastSubLine = yomikataSubList.getSubLine(netflixVideoEle.currentTime)?yomikataSubList.getSubLine(netflixVideoEle.currentTime):yomikataSubList.subTab[1];
    
    function startExplain(){
        netflixMenager.startReadingExp();
        netflixMenager.pausVideo();
    }
    function endExplain(){
        netflixMenager.endReadingExp();
        netflixMenager.playVideo();
    }
    function refreshSubs(){
        const currSubLine = yomikataSubList.getSubLine(netflixVideoEle.currentTime);
        if(currSubLine){
            lastSubLine = currSubLine;

            const tokenized = yomikataTokenizer.tokenize(lastSubLine.content);
            const destructedSentence = (new YomikataSenctence(lastSubLine.content,tokenized)).destructedOriginalSentence;

            const currSubLineSpan = document.createElement("span");
            for(const wordObj of destructedSentence){
                if(isCharSeparator(wordObj.original_word)){
                    const sep = document.createElement("span");
                    sep.textContent = wordObj.original_word;
                    currSubLineSpan.appendChild(sep);
                }else{
                    const yomikataWord = new YomikataWordElment(wordObj.original_word,startExplain,endExplain);
                    currSubLineSpan.appendChild(yomikataWord.itself());
                }
            }
            yomikataSubtitles.appendSubtitles(currSubLineSpan);
        }else{
            yomikataSubtitles.setSubtitles("");
        }
    }

    netflixVideoEle.addEventListener("timeupdate",()=>{
        if(lastSubLine.timeStop < netflixVideoEle.currentTime){
            refreshSubs();
        }else if(lastSubLine.timeStop > netflixVideoEle.currentTime){
            refreshSubs();
        }
    });
}

main();

let currentUrl = location.href;
function handleRouteChange(newUrl, oldUrl) {
  console.log("Zmiana podstrony:");
  console.log("Stary URL:", oldUrl);
  console.log("Nowy URL:", newUrl);

  if (newUrl.includes("/watch")) {
    
  } else {
    
  }
}

setInterval(() => {
  const newUrl = location.href;

  if (newUrl !== currentUrl) {
    const oldUrl = currentUrl;
    currentUrl = newUrl;

    handleRouteChange(newUrl, oldUrl);
  }
}, 500);

