//class:"active default-ltr-iqcdef-cache-fntwn3"; dla zmniejszenia ui video z kontrolkami
class NetflixWatch extends VideoWatch{
    sidebarAppearAction(){
        console.log("sidebar wychylony");

        if(this.sizeObserver)
            this.sizeObserver.disconnect();

        this.sizeObserver = new ResizeObserver(()=>{
            const sidebarRect = 
                this.yomikataSiBar.itself().getBoundingClientRect();

            this.video2resize.style.width = 
                String(window.innerWidth - sidebarRect.width)+"px";
        });
        this.sizeObserver.observe(this.yomikataSiBar.itself());
    }
    sidebarHideAction(){
        console.log("Sidebar schowany");

        if(this.sizeObserver)
            this.sizeObserver.disconnect();

        this.video2resize.style.width = "100%";
    }

    appendVideoOverlay(){
        this.video2resize = document.querySelector(".default-ltr-iqcdef-cache-fntwn3")

        const observer = new ResizeObserver(() => {
        const rect = this.VIDEO_ELEMENT.getBoundingClientRect();
        const parentRect = this.VIDEO_ELEMENT.parentElement.getBoundingClientRect();

        this.yomikataVideoOverlay.changePositionAndSize(
            rect.left - parentRect.left,
            rect.top - parentRect.top,
            rect.width,
            rect.height
        );
        });

        observer.observe(this.VIDEO_ELEMENT);

        this.container2putin = document.querySelector(".watch-video");
        this.container2putin.appendChild(
            this.yomikataVideoOverlay.itself()
        )
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

        this.sizeObserver = null;
    }
}
class NetflixMenager extends VideoMenager{
    createVideoWatch(){
        this.vWatch = new NetflixWatch(
        this.yomikataIconButton,
        this.yomikataSidebar,
        this.yomikataSubtitles,
        this.WATCH_VIDEO_CONTAINER,
        this.VIDEO_ELEMENT,
        this.specificSelectors);
    }
    constructor(){
        const specificSelectors = {
            ...videoWatchSelectors
        }
        specificSelectors.videoContainer = ".watch-video";
        specificSelectors.videoStater = ".default-ltr-iqcdef-cache-fntwn3";
        specificSelectors.videoActive = "active";
        specificSelectors.videoInactive = "inactive";
        specificSelectors.videoPassive = "passive";
        
        super(specificSelectors);
    }
    async getTitle(){
        const animeDataDiv = await waitForElement(".default-ltr-iqcdef-cache-m1ta4i");
        animeDataDiv.querySelector('[data-uia="video-title"] h4') ? console.log("jest tytul") : console.log("nie ma tytulu");

        return (animeDataDiv.querySelector("h4")).textContent;
        document.querySelector('[data-uia="video-title"] h4') ? console.log("jest tytul") : console.log("nie ma tytulu");
        return document.querySelector('[data-uia="video-title"] h4')
            ?.textContent
            ?.trim();
    } 
    async getEpisode(){
        const animeDataDiv = await waitForElement(".default-ltr-iqcdef-cache-m1ta4i");

        return parseInt((animeDataDiv.querySelector("span")).textContent.replace(/\D/g, ""),10);
    }
}