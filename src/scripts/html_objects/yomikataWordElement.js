class YomikataWordElment{
    constructor(word,onHoverCallback=()=>{},outHoverCallback=()=>{}){
        this.wordText = word;

        this.wordExplanation = new YomikataSubExplanationElement();

        this.wordElement = document.createElement("span");
        this.wordElement.classList.add("yomikata-word");
        this.wordElement.textContent = word;

        this.wordWasSet = false;
        this.kanjiWasSet = false;

        this.timeHideout = null;
        this.wordElement.addEventListener("mouseover",()=>{
            clearTimeout(this.timeHideout);
            this.wordExplanation.showItself();
            onHoverCallback();

            if(!this.wordExplanation.wordElement && !this.wordWasSet){
                this.wordWasSet = true;
                this.loadWordData();
            }
        })
        this.wordElement.addEventListener("mouseout",()=>{
            this.timeHideout = setTimeout(()=>{
                this.wordExplanation.hideItself();
                outHoverCallback();
            },10);
        });

        this.wordExplanation.kanjiTag.addEventListener("click",()=>{
            if(!this.wordExplanation.kanjiElement && !this.kanjiWasSet){
                this.kanjiWasSet = true;
                this.loadKanjiData().then(()=>{
                if(this.wordExplanation.kanjiElement){
                    this.wordExplanation.kanjiElement.classList.remove("hidden");
                }
            });
            }

            if(this.wordExplanation.wordElement){
                this.wordExplanation.wordElement.classList.add("hidden");
            }
        })
        this.wordExplanation.wordTag.addEventListener("click",()=>{
            if(this.wordExplanation.kanjiElement){
                this.wordExplanation.kanjiElement.classList.add("hidden");
            }
            if(this.wordExplanation.wordElement){
                this.wordExplanation.wordElement.classList.remove("hidden");
            }
        })

        this.wordElement.appendChild(this.wordExplanation.itself());
    }

    async loadWordData(){
        let wordRes = [];
        let correctWord = [];
        try{
            wordRes = await fetch_word(this.wordText);
            correctWord = get_word(wordRes,this.wordText);

            if(correctWord?.status == 404){
                const msg = document.createElement("span");
                msg.classList.add("yomikata-sub-expl-message");
                msg.textContent = "No entrie`s for word found";

                this.wordExplanation.setWordMessage(msg);
                return;
            }
        }catch (e){}

        if(correctWord?.data?.[0]){
            this.wordText = correctWord.data[0].slug;
        }

        this.wordExplanation.setWordElement(correctWord);
    }

    async loadKanjiData() {
        if(!this.wordExplanation.wordElement) return;
        let kanjiList = [...this.wordText].filter(char =>
                /[\u4E00-\u9FFF]/.test(char)
            );
        const kanjiResFetched = [];
        try{
            for(const kanji of kanjiList){
                const kanjiRes = await fetch_kanji(kanji);
                kanjiResFetched.push(kanjiRes);
            }
        }catch{}
        if(kanjiResFetched.length == 0){
            const msg = document.createElement("span");
            msg.classList.add("yomikata-sub-expl-message");
            msg.textContent = "No kanji`s found";
            
            this.wordExplanation.setKanjiMessage(msg);
        }else{
            this.wordExplanation.setKanjiElement(kanjiResFetched);
        }
    }

    itself(){
        return this.wordElement;
    }
}