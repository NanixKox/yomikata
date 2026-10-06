class SubList{
    #normalizeSubtitleFile(sub) {
        if (typeof sub !== "string") {
            return "";
        }

        return sub
            .replace(/^\uFEFF/, "")  // usuwa BOM
            .replace(/\r\n?/g, "\n") // CRLF i CR zamienia na LF
            .trim();
    }


    #createSubtitleObject(start, stop, contentLines, cueSettings = null) {
        let content = contentLines
            .join("\n")
            .trim();

        if (!content) {
            return null;
        }

        const typeMatch = content.match(/\{\\an\d\}/);

        let type = cueSettings;

        if (typeMatch) {
            type = typeMatch[0];

            content = content
                .replace(typeMatch[0], "")
                .trim();
        }

        /*
            Twoje #getSecs obsługuje tylko przecinek:
            00:00:01,500

            Dlatego timestamp VTT:
            00:00:01.500

            zamieniamy tutaj na format z przecinkiem.
            Nie trzeba edytować #getSecs.
        */
        const normalizedStart = start.replace(".", ",");
        const normalizedStop = stop.replace(".", ",");

        return {
            timeStart: this.#getSecs(normalizedStart),
            timeStop: this.#getSecs(normalizedStop),
            content,
            type,
        };
    }


    #appendSubtitle(lineObj) {
        if (!lineObj) {
            return;
        }

        this.subTab.push(lineObj);
    }
    #getSecs(regexCheckedPart){
        let secs = 0;

        const [hours,minutes,secNmil] = regexCheckedPart.split(":");
        const [seconds,milSecs] = secNmil.split(',');

        secs += Number(hours)*60*60;
        secs += Number(minutes)*60;
        secs += Number(seconds);
        secs += Number(milSecs)*0.001;

        return secs;
    }
    #srt2tab(sub) {
        this.#parseSubtitles(sub, {
            format: "srt",
            msSeparator: ",",
        });
    }


    #vtt2tab(sub) {
        this.#parseSubtitles(sub, {
            format: "vtt",
            msSeparator: ".",
        });
    }


    #parseSubtitles(sub, { format, msSeparator }) {
        const normalizedSub = this.#normalizeSubtitleFile(sub);

        if (!normalizedSub) {
            return;
        }

        const escapedSeparator = msSeparator.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const timestampPattern =
            format === "vtt"
                ? `(?:\\d{2,}:)?\\d{2}:\\d{2}${escapedSeparator}\\d{3}`
                : `\\d{2}:\\d{2}:\\d{2}${escapedSeparator}\\d{3}`;

        const regexTime = new RegExp(
            `^(${timestampPattern})\\s*-->\\s*(${timestampPattern})(?:\\s+(.+))?$`
        );

        const blocks = normalizedSub.split(/\n\s*\n/);

        for (const block of blocks) {
            const lines = block
                .split("\n")
                .map(line => line.trimEnd());

            if (format === "vtt" && this.#isVttMetadataBlock(lines)) {
                continue;
            }

            const timeLineIndex = lines.findIndex(line =>
                regexTime.test(line.trim())
            );

            if (timeLineIndex === -1) {
                continue;
            }

            const match = lines[timeLineIndex]
                .trim()
                .match(regexTime);

            if (!match) {
                continue;
            }

            const [, start, stop, cueSettings] = match;

            const contentLines = lines.slice(timeLineIndex + 1);

            const lineObj = this.#createSubtitleObject(
                start,
                stop,
                contentLines,
                cueSettings?.trim() || null
            );

            this.#appendSubtitle(lineObj);
            if(typeof this.onLineAppend === "function"){
                this.onLineAppend(lineObj);
            }
        }
    }


    #isVttMetadataBlock(lines) {
        const firstLine = lines[0]?.trim() ?? "";

        return (
            firstLine === "WEBVTT" ||
            firstLine.startsWith("WEBVTT ") ||
            firstLine === "STYLE" ||
            firstLine === "REGION" ||
            firstLine === "NOTE" ||
            firstLine.startsWith("NOTE ")
        );
    }
    constructor(sub_res,onLineAppend){
        this.onLineAppend = onLineAppend;

        this.currentPoint = 0;//tab index
        this.subTab = [];
        switch(sub_res.type){
            case ".srt":
                this.#srt2tab(sub_res.content);
                break;
            case ".vt":
                this.#vtt2tab(sub_res.content);
                break;
        }
    }

    getSubLine(time){
        const curLine = this.subTab[this.currentPoint];
        if(time >= curLine.timeStart && time <= curLine.timeStop){
            return curLine;
        }

        if(time > curLine.timeStop){
            for(let i = this.currentPoint + 1;i < this.subTab.length;i++){

                const line = this.subTab[i];

                if(time >= line.timeStart && time <= line.timeStop){
                    return line;
                }
                
                if(time > line.timeStop) continue;
                
                return null;
            }
        }else if(time < curLine.timeStart){
            for(let i = this.currentPoint - 1;i >= 0;i--){
                const line = this.subTab[i]; 

                if(time >= line.timeStart && time <= line.timeStop){
                    return line;
                }

                if(time < line.timeStart) continue;

                return null;
            }
        }

        return null;
    }
}