class YomikataSenctence{
    async #initialize(){

    }
    #destructSentence(){
        const tab = [];
        for(const token of this.tokenized_word_list){
            const mapE = {
                original_word:this.#sliceByByteOffsets(this.original_sentence,token.begin,token.end),
                normalized_form:token.normalized_form
            };
            tab.push(mapE);
        }
        return tab;
    }
    constructor(original_sentence,tokenized_word_list){
        this.original_sentence = original_sentence;
        this.tokenized_word_list = tokenized_word_list;

        this.destructedOriginalSentence = this.#destructSentence();
    }
    #byteOffsetToCharIndex(str, byteOffset) {
        const chars = Array.from(str);
        let bytes = 0;

        for (let i = 0; i < chars.length; i++) {
            if (bytes === byteOffset) {
            return i;
            }

            bytes += new TextEncoder().encode(chars[i]).length;

            if (bytes > byteOffset) {
            return i + 1;
            }
        }

        return chars.length;
    }
    #sliceByByteOffsets(str, beginByte, endByte) {
        const chars = Array.from(str);

        const beginChar = this.#byteOffsetToCharIndex(str, beginByte);
        const endChar = this.#byteOffsetToCharIndex(str, endByte);

        return chars.slice(beginChar, endChar).join("");
    }
}