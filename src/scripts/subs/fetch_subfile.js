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
            if(entry.name.toLowerCase().replace(/\s/g, "") == title.toLowerCase().replace(/\s/g, "")
            || entry.english_name.toLowerCase().replace(/\s/g, "") == title.toLowerCase().replace(/\s/g, "")
            || entry.japanese_name.toLowerCase().replace(/\s/g, "") == title.toLowerCase().replace(/\s/g, "")){
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
    console.log(files);
    const normalizedPlatform = platform
        .toLowerCase()
        .replace(/\s/g, "");

    const formatPriority = {
        ".srt": 3,
        ".vtt": 2,
        ".ass": 1,
    };
    const shiai = {
        option: null,
        points: -Infinity,
        type: null,
    };

    for (const file of files) {
        const fileName = file.name ?? "";
        const extension = fileName.match(/\.(srt|vtt|ass)$/i)?.[0].toLowerCase();
        if (!extension) continue;

        const normalizedName = fileName
        .toLowerCase()
        .replace(/\s/g, "");

        // Format priority comes first (.ass stays the fallback); platform
        // matching only breaks ties between files of the same format.
        const points = formatPriority[extension] * 2 +
            (normalizedName.includes(normalizedPlatform) ? 1 : 0);

        if(shiai.points < points){
            shiai.option = file;
            shiai.points = points;
            shiai.type = extension;
        }
    }

    return {content:shiai.option,type:shiai.type};
}

function decodeAssSubtitle(buffer, fileName = "") {
    const bytes = new Uint8Array(buffer);

    // ASS sources commonly use UTF-16 with a byte-order mark. Respect it
    // before trying filename-based legacy encodings.
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
        return new TextDecoder("utf-16le").decode(bytes);
    }
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
        return new TextDecoder("utf-16be").decode(bytes);
    }
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        return new TextDecoder("utf-8").decode(bytes);
    }

    const normalizedName = fileName.toLowerCase();
    if (normalizedName.includes("big5")) {
        return new TextDecoder("big5").decode(bytes);
    }
    if (/(?:^|[._-])gb(?:k)?(?:[._-]|$)/i.test(normalizedName)) {
        return new TextDecoder("gbk").decode(bytes);
    }

    return new TextDecoder("utf-8").decode(bytes);
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
        console.log("STAGE 1");
    } catch {
        return {
            ok: false,
            status: 500,
            detail: "Entry fetch failed",
        };
    }

    let subHead;
    let subType;
    let subFileName = "";

    try {
        console.log(platform);
        const res = await fetchJimakuSubHead(show.id, episode, platform,apiKey);
        subHead = res.content;
        subType = res.type;
        subFileName = subHead?.name ?? "";

        if (!subHead) {
            return {
                ok: false,
                status: 404,
                detail: "Subtitle header not found",
            };
        }
        console.log("STAGE 2");
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

        const txt = subType === ".ass"
            ? decodeAssSubtitle(await resSubDown.arrayBuffer(), subFileName)
            : await resSubDown.text();
        console.log("STAGE 3");
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
