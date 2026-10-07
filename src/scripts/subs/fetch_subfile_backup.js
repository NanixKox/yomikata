async function main() {
    const response = await fetch(
        "https://jimaku.cc/api/entries/search?anilist_id=1210"
    ,
        {
            headers: {
                Authorization: "AAAAAAAAK6wuAS7LLmntz1Uo2G_boG4A8ITM_tj0orKs1NwPa6mVFVBXiA"
            }
        }
    );

    console.log("status:", response.status);

    const text = await response.text();
    console.log("body:", text);
}

main();