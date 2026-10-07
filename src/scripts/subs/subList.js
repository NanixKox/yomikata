class SubList{
    getLastSubSecond(){
        if(this.subTab.length > 0){
            return this.subTab[this.subTab.length - 1].timeStop;
        }else{
            return null;
        }
    }
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
    #assTimeToSecs(time) {
        // ASS: H:MM:SS.cc
        const match = time.trim().match(/^(\d+):(\d{2}):(\d{2})[.](\d{2})$/);

        if (!match) {
            return Number.NaN;
        }

        const [, hours, minutes, seconds, centiseconds] = match;

        return (
            Number(hours) * 3600 +
            Number(minutes) * 60 +
            Number(seconds) +
            Number(centiseconds) * 0.01
        );
    }
    #cleanAssText(text) {
        const cleanedText = text
            // ASS newline
            .replace(/\\N/g, "\n")
            .replace(/\\n/g, "\n")

            // ASS forced line break
            .replace(/\\h/g, " ")

            // Usuwanie tagów ASS, np.
            // {\i1}
            // {\an8}
            // {\pos(100,200)}
            // {\fnArial}
            .replace(/\{[^}]*\}/g, "")

            .trim();

        // Replacement characters/control bytes mean the payload was not
        // decoded as subtitle text. Do not surface that corruption as a cue.
        if (/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(cleanedText)) {
            return "";
        }

        return cleanedText;
    }
    #ass2tab(sub) {
        const normalizedSub = this.#normalizeSubtitleFile(sub);

        if (!normalizedSub) {
            return;
        }

        // A plain-text ASS script must have an Events section. Some sources
        // label protected/binary payloads as .ass; those are not parseable ASS.
        if (!/^\s*\[Events\]\s*$/im.test(normalizedSub)) {
            console.warn("Ignoring .ass subtitle file without an [Events] section.");
            return;
        }

        const lines = normalizedSub.split("\n");
        const defaultFormat = [
            "layer", "start", "end", "style", "name",
            "marginl", "marginr", "marginv", "effect", "text",
        ];
        let inEventsSection = false;
        let eventFormat = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const section = trimmedLine.match(/^\[([^\]]+)\]$/);
            if (section) {
                inEventsSection = section[1].trim().toLowerCase() === "events";
                if (!inEventsSection) eventFormat = null;
                continue;
            }
            const formatMatch = trimmedLine.match(/^Format\s*:\s*(.*)$/i);
            if (inEventsSection && formatMatch) {
                eventFormat = formatMatch[1].split(",").map(field =>
                    field.trim().toLowerCase()
                );
                continue;
            }

            const dialogueMatch = trimmedLine.match(/^Dialogue\s*:\s*(.*)$/i);
            if (!inEventsSection || !dialogueMatch) continue;

            // Używamy kolejności pól zadeklarowanej w [Events]. Tekst jest
            // ostatnim polem i może zawierać przecinki, więc ich nie dzielimy.
            const fields = eventFormat?.length ? eventFormat : defaultFormat;
            const textIndex = fields.indexOf("text");
            const startIndex = fields.indexOf("start");
            const endIndex = fields.indexOf("end");
            if (textIndex < 0 || startIndex < 0 || endIndex < 0) continue;

            const rawParts = dialogueMatch[1].split(",");
            if (rawParts.length < fields.length) continue;

            const parts = rawParts.slice(0, fields.length - 1);
            parts.push(rawParts.slice(fields.length - 1).join(","));

            const start = this.#assTimeToSecs(parts[startIndex]);
            const stop = this.#assTimeToSecs(parts[endIndex]);
            const rawText = parts[textIndex] ?? "";
            const content = this.#cleanAssText(rawText);

            if (!content || !Number.isFinite(start) || !Number.isFinite(stop) || stop <= start) {
                continue;
            }

            const styleIndex = fields.indexOf("style");
            const lineObj = {
                timeStart: start,
                timeStop: stop,
                content,
                type: styleIndex >= 0 ? parts[styleIndex]?.trim() || null : null,
            };

            this.#appendSubtitle(lineObj);
            if (typeof this.onLineAppend === "function") {
                this.onLineAppend(lineObj);
            }
        }

        this.subTab.sort((a, b) => a.timeStart - b.timeStart);
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
        switch(sub_res.type?.toLowerCase()){
            case ".srt":
                this.#srt2tab(sub_res.content);
                break;
            case ".vtt":
                this.#vtt2tab(sub_res.content);
                break;
            case ".ass":
                this.#ass2tab(sub_res.content);
                break;
        }
    }

    getSubLine(time){
        if (!this.subTab.length || !Number.isFinite(time)) {
            return null;
        }

        if (this.currentPoint < 0 || this.currentPoint >= this.subTab.length) {
            this.currentPoint = 0;
        }

        const curLine = this.subTab[this.currentPoint];
        if (!curLine) {
            this.currentPoint = 0;
            return null;
        }

        if(time >= curLine.timeStart && time <= curLine.timeStop){
            return curLine;
        }

        if(time > curLine.timeStop){
            for(let i = this.currentPoint + 1;i < this.subTab.length;i++){

                const line = this.subTab[i];

                if(time >= line.timeStart && time <= line.timeStop){
                    this.currentPoint = i;
                    return line;
                }
                
                if(time > line.timeStop) continue;
                
                return null;
            }
        }else if(time < curLine.timeStart){
            for(let i = this.currentPoint - 1;i >= 0;i--){
                const line = this.subTab[i]; 

                if(time >= line.timeStart && time <= line.timeStop){
                    this.currentPoint = i;
                    return line;
                }

                if(time < line.timeStart) continue;

                return null;
            }
        }

        return null;
    }
}
