async function fetch_kanji(kanji) {
    const res = await fetch(`https://kanjiapi.dev/v1/kanji/${kanji}`);
    if(res.ok){
        const data = await res.json();
        return data;
    }
        
    throw new Error("Error while trying to fetch kanji"); 
}