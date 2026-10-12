//kat:flex kat:self-stretch kat:h-44 kat:@lg:h-64       (kontrolki)
//kat:flex kat:self-stretch kat:h-44 kat:@lg:h-48 kat:gap-10        (pasek przewijania)
class CrunchyrollWatch extends VideoWatch{
    //appendController(){}
    //appendSidebar(){}
    //appendSubtitles(){}
    sidebarAppearAction(){
        console.log("sidebar wychylony");

        if(this.controlsSizeObserver)
            this.controlsSizeObserver.disconnect();

        this.controlsSizeObserver = new ResizeObserver(()=>{
            const sidebarRect = 
                this.yomikataSiBar.itself().getBoundingClientRect();

            this.videoScrollbar.style.width = 
                String(window.innerWidth - sidebarRect.width - 40)+"px";
            this.videoPlayerControls.style.width = 
                String(window.innerWidth - sidebarRect.width - 40)+"px";
            this.VIDEO_ELEMENT.style.width =
                String(window.innerWidth - sidebarRect.width)+"px";
        });
        this.controlsSizeObserver.observe(this.yomikataSiBar.itself());
    }
    sidebarHideAction(){
        console.log("Sidebar schowany");

        if(this.controlsSizeObserver)
            this.controlsSizeObserver.disconnect();

        this.videoPlayerControls.style.width = "100%";
        this.VIDEO_ELEMENT.style.width = "100%";
        this.videoScrollbar.style.width = "100%";
    }

    appendVideoOverlay(){
        this.VIDEO_ELEMENT.parentNode.insertBefore(
            this.yomikataVideoOverlay.itself(),
            this.VIDEO_ELEMENT
        );
    }
    constructor(yomikataIconButton,
                yomikataSidebar,
                yomikataSubtitles,
                videoWatchContainer,
                videoElement,
                specificSelectors){

        super(
            yomikataIconButton,
            yomikataSidebar,
            yomikataSubtitles,
            videoWatchContainer,
            videoElement,
            specificSelectors
        );

        this.videoScrollbar = document.querySelector(".kat\\:flex.kat\\:self-stretch.kat\\:h-44.kat\\:\\@lg\\:h-64");
        this.videoPlayerControls = document.querySelector(".kat\\:flex.kat\\:self-stretch.kat\\:h-44.kat\\:\\@lg\\:h-48.kat\\:gap-10");

        this.sizeObserver = new ResizeObserver(() => {
            const rect = this.VIDEO_ELEMENT.getBoundingClientRect();
            const parentRect = this.VIDEO_ELEMENT.parentElement.getBoundingClientRect();

            this.yomikataVideoOverlay.changePositionAndSize(
                rect.left - parentRect.left,
                rect.top - parentRect.top,
                rect.width,
                rect.height
            );

        });

        this.sizeObserver.observe(this.VIDEO_ELEMENT);
        this.controlsSizeObserver = null;
    }
}
class CrunchyrollMenager extends VideoMenager{
    async additionalWaitForElements(){
        this.videoPlayerWrapper = await waitForElement(".video-player-wrapper");
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
        this.videoPlayerControls = null;
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