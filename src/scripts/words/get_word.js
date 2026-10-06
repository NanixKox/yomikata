function get_word(words, actualWord){
    if (!words || !Array.isArray(words.data)) {
        return { status: 404, data: [] };
    }

    const word_list = words.data;
    if (word_list.length === 0) {
        return { status: 404, data: [] };
    }

    let val_tab = [];

    for(const word of word_list){
        if(!word || !("slug" in word)){
            val_tab.push(0);
            continue;
        }

        if(word.slug == actualWord){
            const wk_l = Array.isArray(word.tags)
                ? word.tags.find(str => /^wanikani\d$/.test(str))
                : null;

            const wk_s = wk_l ? Number(wk_l[wk_l.length - 1]) : 0;
            const wk = wk_s ? Math.floor(((60 - wk_s) / 61) * 10) : 0;

            const jlptTag = Array.isArray(word.jlpt) ? word.jlpt[0] : null;
            const jlpt_n = jlptTag ? Number(jlptTag[jlptTag.length - 1]) : 0;

            val_tab.push(jlpt_n * 10 + wk);
        }else{
            val_tab.push(0);
        }
    }

    const max_val = Math.max(...val_tab);
    const word = word_list[val_tab.findIndex(num => max_val == num)];

    if (!word) {
        return { status: 404, data: [] };
    }

    return { status: 200, data: [word] };
}