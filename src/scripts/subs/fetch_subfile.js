async function fetchJimakuSerieEntrie(title,apiKey) {
    const searchRes = await fetch(
        `https://jimaku.cc/api/entries/search?query=${encodeURIComponent(title)}&anime=true`,
        {
        headers: {
            Authorization: apiKey,
        },
        }
    );

    const entries = await searchRes.json();
    if(entries && !("error" in entries)){
        for(const entry of entries){
            if(entry.name.toLowerCase().replace(/\s/g, "") == title.toLowerCase().replace(/\s/g, "")){
                return entry;
            }
        }
    }

    return null;
}

async function fetchJimakuSubHead(id,episodeN,platform,apiKey){
    const filesRes = await fetch(
    `https://jimaku.cc/api/entries/${id}/files?episode=${episodeN}`,
        {
            headers: {
            Authorization: apiKey,
            },
        }
    );

    const files = await filesRes.json();
    const normalizedPlatform = platform
        .toLowerCase()
        .replace(/\s/g, "");

    const shiai = {
        option:null,
        points:null
    }

    let subtype = "";

    for (const file of files) {
        const normalizedName = file.name
        .toLowerCase()
        .replace(/\s/g, "");

        let points = 0;

        if(file.name.endsWith(".srt")){
            points += 2;

            if(normalizedName.includes(normalizedPlatform)){
                points += 10;
            }

            subtype = ".srt";
        }else if(file.name.endsWith(".vtt")){
            points += 1;

            if(normalizedName.includes(normalizedPlatform)){
                points += 10;
            }
            subtype = ".vtt";
        }

        if(shiai.points < points){
            shiai.option = file;
        }
    }

    return {content:shiai.option,type:subtype};
}

globalThis.fetchDownloadJimakuSubs = fetchDownloadJimakuSubs;

async function fetchDownloadJimakuSubs(title,episode,platform,apiKey) {
    let show;

    try {
        show = await fetchJimakuSerieEntrie(title,apiKey);

        if (!show) {
            return {
                ok: false,
                status: 404,
                detail: "Entry not found",
            };
        }
    } catch {
        return {
            ok: false,
            status: 500,
            detail: "Entry fetch failed",
        };
    }

    let subHead;
    let subType;

    try {
        const res = await fetchJimakuSubHead(show.id, episode, platform,apiKey);
        subHead = res.content;
        subType = res.type;

        if (!subHead) {
            return {
                ok: false,
                status: 404,
                detail: "Subtitle header not found",
            };
        }
    }catch {
        return {
            ok: false,
            status: 500,
            detail: "Subtitle header fetch failed",
        };
    }

    const url = subHead.url;
    let resSubDown = null;
    try{
        resSubDown = await fetch(url,{
            headers:{
                apiKey:apiKey,
            },
        });

        if(!resSubDown.ok){
            return {
                ok: false,
                status: 404,
                detail: "Subtitle not found",
            };
        }

        const txt = await resSubDown.text()

        return {
            ok:true,
            status:200,
            content:txt,
            type:subType
        }
    }catch{
        return {
            ok: false,
            status: 500,
            detail: "Subtitle fetch failed",
        };
    }

    return null;
}
