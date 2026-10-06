class SubtitlesMenager{
    constructor(subList,yomikataSubtitles,videoElement,startExplainCallback,endExplainCallback){
        this.yomikataTokenizer = new YomikataTokenizer();

        this.subList = subList;

        this.lastSubLine = null;
        this.onTimeUpdate = null;

        this.YOMIKATA_SUB_ELEMENT = yomikataSubtitles;
        this.VIDEO_ELEMENT = videoElement;

        this.startExplainCallback = null;
        if(typeof startExplainCallback === "function"){
            this.startExplainCallback = () =>{
                startExplainCallback();
            }
        }
        this.endExplainCallback = null;
        if(typeof endExplainCallback === "function"){
            this.endExplainCallback = ()=>{
                endExplainCallback();
            }
        }

        this.pausedWhileExplaining = false;
        this.isExplaining = false;
    }
    startExplain(){
        if(this.VIDEO_ELEMENT.paused && !this.isExplaining){
            //console.log("weszlo w warunek");
            this.pausedWhileExplaining = true;
        } 
        this.isExplaining = true;

        this.VIDEO_ELEMENT.pause();

        if(this.startExplainCallback){
            this.startExplainCallback();
        }
    }
    endExplain(){
        //console.log("konczy tlumaczyc");
        if(!this.pausedWhileExplaining){
            this.VIDEO_ELEMENT.play();
        }
        
        this.pausedWhileExplaining = false;
        this.isExplaining = false;
        
        if(this.endExplainCallback){
            this.endExplainCallback();
        }
    }
    refreshSubs(){
        const currSubLine = this.subList.getSubLine(this.VIDEO_ELEMENT.currentTime);
        if(currSubLine){
            this.lastSubLine = currSubLine;
            const tokenized = this.yomikataTokenizer.tokenize(this.lastSubLine.content);
            const destructedSentence = (new YomikataSenctence(this.lastSubLine.content,tokenized)).destructedOriginalSentence;

            const currSubLineSpan = document.createElement("span");
            for(const wordObj of destructedSentence){
                if(isCharSeparator(wordObj.original_word)){
                    const sep = document.createElement("span");
                    sep.textContent = wordObj.original_word;
                    currSubLineSpan.appendChild(sep);
                }else{
                    const yomikataWord = new YomikataWordElment(wordObj.original_word,()=>this.startExplain(),()=>this.endExplain());
                    currSubLineSpan.appendChild(yomikataWord.itself());
                }
            }
            this.YOMIKATA_SUB_ELEMENT.appendSubtitles(currSubLineSpan);
        }else{
            this.YOMIKATA_SUB_ELEMENT.setSubtitles("");
        }
    }
    async init(){
        await this.yomikataTokenizer.initSudachi();

        this.lastSubLine = this.subList.getSubLine(this.VIDEO_ELEMENT.currentTime)?this.subList.getSubLine(this.VIDEO_ELEMENT.currentTime):this.subList.subTab[0];
        this.onTimeUpdate = ()=>{
            if(this.lastSubLine.timeStop < this.VIDEO_ELEMENT.currentTime){
                this.refreshSubs();
            }else if(this.lastSubLine.timeStop > this.VIDEO_ELEMENT.currentTime){
                this.refreshSubs();
            }
        }
        this.VIDEO_ELEMENT.addEventListener("timeupdate",this.onTimeUpdate);
    }
    destroy(){
        try{
            this.VIDEO_ELEMENT.removeEventListener("timeupdate",this.onTimeUpdate);
        }catch{}
    }
}