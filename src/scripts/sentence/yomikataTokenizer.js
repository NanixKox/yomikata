class YomikataTokenizer{
    #isChromeExtension(){
        return typeof chrome !== "undefined"
            && chrome.runtime
            && typeof chrome.runtime.getURL === "function";
    }
    async initSudachi() {
        const sudachiModule = this.#isChromeExtension()
            ? await import(chrome.runtime.getURL("src/scripts/node_modules/sudachi-wasm333/sudachi.js"))
            : await import("sudachi-wasm333");

        const { SudachiStateless } = sudachiModule;
        this.TokenizeMode = sudachiModule.TokenizeMode;

        this.sudachi = new SudachiStateless();

        if(this.#isChromeExtension()){
            const dictPath = chrome.runtime.getURL(
                "src/scripts/node_modules/sudachi-wasm333/resources/system.dic"
            );

            await this.sudachi.initialize_browser(dictPath);
            return;
        }

        const fs = await import("fs/promises");
        const path = await import("path");

        const dictPath = path.resolve(
            __dirname,
            "../node_modules/sudachi-wasm333/resources/system.dic"
        );

        await this.sudachi.initialize_node(fs.readFile, dictPath);
    }
    constructor(){
        this.sudachi = null;
        this.TokenizeMode = null;
    }
    tokenize(sentence){
        return this.sudachi.tokenize_raw(sentence, this.TokenizeMode.C);
    }
    isReady(){
        return this.sudachi && this.TokenizeMode? true:false;
    }
}