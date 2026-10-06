class Config{
    constructor(){
        this.jimakuApiKey = "AAAAAAAAK6wuAS7LLmntz1Uo2G_boG4A8ITM_tj0orKs1NwPa6mVFVBXiA";
    }

    async getJimakuApiKey(){
        return (await chrome.storage.local.get("jimakuApiKey")).jimakuApiKey;
    }

    async setJimakuApiKey(apiKey){
        await chrome.storage.local.set({jimakuApiKey:apiKey});
    }
}