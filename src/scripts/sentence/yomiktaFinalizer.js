class YomikataFinalizer{
    constructor(){
        this.YOMIKATA_TOKENIZER = new YomikataTokenizer();
    }

    isReady(){
        return this.YOMIKATA_TOKENIZER.isReady();
    }
}
