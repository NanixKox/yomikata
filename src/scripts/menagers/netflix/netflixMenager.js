class NetflixMenager extends VideoMenager{
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