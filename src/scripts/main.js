let currentUrl = location.href;
let MENAGER = null;

async function appendMenager(url){
    if (url.includes("netflix.com")) {
        if(url.includes("/watch")){
            try{
                MENAGER.destroy();
            }catch{}

            MENAGER = new NetflixMenager();
            await MENAGER.build();
        }
    }
    else if(url.includes("crunchyroll.com")){
        if(url.includes("/watch")){
            try{
                MENAGER.destroy();
            }catch{}

            MENAGER = new CrunchyrollMenager();
            await MENAGER.build();
        }
    } 
    else {
        
    }
}

appendMenager(currentUrl);

setInterval(() => {
  const newUrl = location.href;

  if (newUrl !== currentUrl) {
    const oldUrl = currentUrl;
    currentUrl = newUrl;

    appendMenager(newUrl);
  }
}, 500);