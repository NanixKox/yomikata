class CrunchyrollWatch extends VideoWatch{
    //appendController(){}
    //appendSidebar(){}
    //appendSubtitles(){}
    constructor(yomikataIconButton,
                yomikataSidebar,
                yomikataSubtitles,
                videoWatchContainer,
                videoElement,
                specificSelectors){
        const vidContainer = document.createElement("div");
        vidContainer.classList.add("yomikata-cr-video-parent");
        videoElement.parentNode
            .insertBefore(vidContainer,
                            videoElement);

        super(
            yomikataIconButton,
            yomikataSidebar,
            yomikataSubtitles,
            vidContainer,
            videoElement,
            specificSelectors
        );

        //const bitMOVIN = document.querySelector(".bitmovinplayer-container\\:aspect-16x9");

        const observer = new ResizeObserver(() => {
            const rect = this.VIDEO_ELEMENT.getBoundingClientRect();
            const parentRect = this.VIDEO_ELEMENT.parentElement.getBoundingClientRect();

            console.log("Video changed:");

            console.log("x:", rect.x);
            console.log("y:", rect.y);
            console.log("width:", rect.width);
            console.log("height:", rect.height);

            vidContainer.style.left = `${rect.left - parentRect.left}px`;
            vidContainer.style.top = `${rect.top - parentRect.top}px`;
            vidContainer.style.width = `${rect.width}px`;
            vidContainer.style.height = `${rect.height}px`; 

        });

        observer.observe(this.VIDEO_ELEMENT);
    }
}
class CrunchyrollMenager extends VideoMenager{
    async additionalWaitForElements(){
        this.videoPlayerWrapper = waitForElement(".video-player-wrapper");
    }
    constructor(){
        const specificSelectors = {
            ...videoWatchSelectors
        }
        specificSelectors.videoStater = ".kat\\:absolute.kat\\:w-full.kat\\:top-0 > .kat\\:bg-gradient-9001000";
        specificSelectors.videoContainer = ".player-container";
        specificSelectors.videoActive = "kat:opacity-100";
        specificSelectors.videoInactive = "kat:opacity-0";
        specificSelectors.videoPassive = "xdddddddd";

        super(specificSelectors);

        this.videoPlayerWrapper = null;
    }
    createVideoWatch(){
        this.vWatch = new CrunchyrollWatch(
            this.yomikataIconButton,
            this.yomikataSidebar,
            this.yomikataSubtitles,
            this.WATCH_VIDEO_CONTAINER,
            this.VIDEO_ELEMENT,
            this.specificSelectors);
    }

    async getTitle(){
        const title = (await waitForElement(".show-title-link h4")).textContent;

        console.log(title);
        return title;
    }
    async getEpisode(){
        const titleNepStr = (await waitForElement(".erc-current-media-info .title")).textContent;
        const splitedTS = titleNepStr.split(" - ");

        const r =  splitedTS.length>1 ? Number(splitedTS[0].slice(1)):null;
        console.log(r);
        return r;
    }
    
}