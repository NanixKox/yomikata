class YomikataSubExplanationElement{
    #containsKanji(text) {
        return /\p{Script=Han}/u.test(text);
    }
    constructor(){
        this.wordTag = document.createElement("span");
        this.wordTag.textContent = "Word";
        this.wordTag.classList.add("yomikata-explanation-tag");
        this.wordTag.classList.add("active");
        
        this.kanjiTag = document.createElement("span");
        this.kanjiTag.textContent = "Kanji";
        this.kanjiTag.classList.add("yomikata-explanation-tag");

        this.wordTag.addEventListener("click",()=>{
            this.kanjiTag.classList.remove("active");
            this.wordTag.classList.add("active");
        })
        this.kanjiTag.addEventListener("click",()=>{
            this.wordTag.classList.remove("active");
            this.kanjiTag.classList.add("active");
        })

        this.topBar = document.createElement("div");
        this.topBar.classList.add("yomikata-explanation-top-bar");
        this.topBar.appendChild(this.wordTag);
        this.topBar.appendChild(this.kanjiTag);

        this.mainContent = document.createElement("div");
        this.mainContent.classList.add("yomikata-explanation")
        this.mainContent.classList.add("yomikata-hidden");
        this.mainContent.appendChild(this.topBar);
        this.mainContent.appendChild(document.createElement("hr"));

        this.wordElement = null;
        this.kanjiElement = null;
    }

    showItself(){
        this.mainContent.classList.remove("yomikata-hidden");
    }
    hideItself(){
        this.mainContent.classList.add("yomikata-hidden");
    }
    setWordElement(wordResponse){
        this.wordElement = document.createElement("div");
        this.wordElement.classList.add("yomikata-explanation-container");

        this.mainContent.appendChild(this.wordElement);
        
        const resWordList = wordResponse.data;
        if(!resWordList || !resWordList[0]){
            return;
        }
        for(const resWord of resWordList){
            const wordText = resWord.slug;
            const wordReading = resWord.japanese[0].reading;

            const sensesList = resWord.senses;
            for(const sense of sensesList){
                if(this.#containsKanji(wordText)){
                    const wordReadingHeader = document.createElement("a");
                    wordReadingHeader.textContent = wordReading;
                    this.wordElement.appendChild(wordReadingHeader);
                }

                const wordHeader = document.createElement("h2");
                wordHeader.textContent = wordText;
                this.wordElement.appendChild(wordHeader);

                const ulForWord = document.createElement("ul");
                
                const definitionsList = sense.english_definitions;
                for(const definition of definitionsList){
                    const liElement = document.createElement("li");
                    liElement.textContent = definition;

                    ulForWord.appendChild(liElement);
                }

                this.wordElement.append(ulForWord);
            }
        }
    }

    setKanjiElement(kanjiResList){
        this.kanjiElement = document.createElement("div");
        this.kanjiElement.classList.add("yomikata-explanation-container");
        this.kanjiElement.classList.add("hidden");

        this.mainContent.appendChild(this.kanjiElement);

        if(!kanjiResList) return;
        for(const kanjiRes of kanjiResList){
            const kanjiExpElement = document.createElement("div");
            kanjiExpElement.classList.add("yomikata-explanation-kanji-element");

            const kanjiHeader = document.createElement("h2");
            kanjiHeader.textContent = kanjiRes.kanji;
            kanjiExpElement.appendChild(kanjiHeader);

            const meaning = document.createElement("span");
            meaning.classList.add("yomikata-explanation-kanji-element-state");
            meaning.textContent = "Meanings: ";
            const meaningTexts = document.createElement("span");
            meaningTexts.classList.add("yomikata-explanation-kanji-element-text");
            if("meanings" in kanjiRes){
                for(const mean of kanjiRes.meanings){
                    meaningTexts.textContent += mean+', ';
                }
            }
            meaning.appendChild(meaningTexts);
            kanjiExpElement.appendChild(meaning);
            kanjiExpElement.appendChild(document.createElement("br"));

            const onyomi = document.createElement("span");
            onyomi.classList.add("yomikata-explanation-kanji-element-state");
            onyomi.textContent = "Onyomi: ";
            const onyomiTexts = document.createElement("span");
            onyomiTexts.classList.add("yomikata-explanation-kanji-element-text");
            if("on_readings" in kanjiRes){
                for(const onyomiReading of kanjiRes.on_readings){
                    onyomiTexts.textContent += onyomiReading+', ';
                }
            }
            onyomi.append(onyomiTexts);
            kanjiExpElement.appendChild(onyomi);
            kanjiExpElement.appendChild(document.createElement("br"));

            const kunyomi = document.createElement("div");
            kunyomi.classList.add("yomikata-explanation-kanji-element-state");
            kunyomi.textContent = "Kunyomi: ";
            const kunyomiTexts = document.createElement("span");
            kunyomiTexts.classList.add("yomikata-explanation-kanji-element-text");
            if("kun_readings" in kanjiRes){
                for(const kunyomiReading of kanjiRes.kun_readings){
                    kunyomiTexts.textContent += kunyomiReading+', ';
                }
            }
            kunyomi.appendChild(kunyomiTexts);
            kanjiExpElement.appendChild(kunyomi);
            kanjiExpElement.appendChild(document.createElement("br"));

            this.kanjiElement.appendChild(kanjiExpElement);
        }
    }

    setKanjiMessage(msgElement){
        this.kanjiElement = document.createElement("div");
        this.kanjiElement.classList.add("yomikata-explanation-container");
        this.kanjiElement.classList.add("hidden");

        this.mainContent.appendChild(this.kanjiElement);

        this.kanjiElement.appendChild(msgElement);
    }

    setWordMessage(msgElement){
        this.wordElement = document.createElement("div");
        this.wordElement.classList.add("yomikata-explanation-container");

        this.mainContent.appendChild(this.wordElement);

        this.wordElement.appendChild(msgElement);
    }

    itself(){
        return this.mainContent;
    }
}