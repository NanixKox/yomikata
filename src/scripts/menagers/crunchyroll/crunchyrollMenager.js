class CrunchyrollMenager extends VideoMenager{
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