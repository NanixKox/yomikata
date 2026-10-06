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

            const currSubCont = document.createElement("span");
            for(const wordObj of destructedSentence){
                const yomikataWord = new YomikataWordElment(wordObj.original_word,startExplain,endExplain);
                currSubCont.appendChild(yomikataWord.itself());
            }
            yomikataSubtitles.setSubtitles(currSubCont);
        }else{
            yomikataSubtitles.setSubtitles("");
        }
    }