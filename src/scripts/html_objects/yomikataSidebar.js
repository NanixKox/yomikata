class YomikataSidebar{
    constructor(){
        this.topCancelE = document.createElement("button");
        this.topCancelE.classList.add("yomikata-sidebar-close");
        this.topCancelE.type = "button";
        this.topCancelE.ariaLabel = "Close sidebar";
        this.topCancelE.textContent = "x";
        this.topCancelE.addEventListener("click",()=>{
            this.toggle();
        })

        this.topE = document.createElement("div");
        this.topE.classList.add("yomikata-sidebar-top");
        this.topE.appendChild(this.topCancelE);

        this.contentE = document.createElement("div");
        this.contentE.classList.add("yomikata-sidebar-content");

        this.bottomE = document.createElement("yomikata-sidebar-bottom")

        this.ys = document.createElement("aside");
        this.ys.classList.add("yomikata-hidden","yomikata-sidebar");
        this.ys.appendChild(this.topE);
        this.ys.appendChild(this.contentE);
        this.ys.append(this.bottomE);

        this.toggleCallback = null;
    }
    onToggle(callback){
        this.toggleCallback = callback;
    }
    toggle(){
        this.ys.classList.toggle("yomikata-hidden");

        if(typeof this.toggleCallback === "function"){
            this.toggleCallback(this.ys.classList.contains("yomikata-hidden"));
        }
    }
    appendChild(child){
        this.contentE.appendChild(child);
    }
}