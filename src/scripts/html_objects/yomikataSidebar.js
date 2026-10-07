class YomikataSidebar{
    constructor(){
        this.offsetValue = 0;
        
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


        this.bottomE = document.createElement("div");
        this.bottomE.classList.add("yomikata-sidebar-bottom");

        this.shiftLeftButton = document.createElement("button");
        this.shiftLeftButton.classList.add("yomikata-sidebar-shift-button");
        this.shiftLeftButton.type = "button";
        this.shiftLeftButton.textContent = "<";

        this.shiftValue = document.createElement("span");
        this.shiftValue.classList.add("yomikata-sidebar-shift-value");
        this.shiftValue.textContent = "0.0s";

        this.shiftRightButton = document.createElement("button");
        this.shiftRightButton.type = "button";
        this.shiftRightButton.classList.add("yomikata-sidebar-shift-button");
        this.shiftRightButton.textContent = ">";

        this.bottomE.append(
            this.shiftLeftButton,
            this.shiftValue,
            this.shiftRightButton
        );

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
    leftShiftButtonOnClick(func){
        this.shiftLeftButton.onclick = func;
    }
    rightShiftButtonOnClick(func){
        this.shiftRightButton.onclick = func;
    }
    appendChild(child){
        this.contentE.appendChild(child);
    }
    refreshOffsetVal(b){
    this.offsetValue += b ? 0.1 : -0.1;
    this.shiftValue.textContent = `${this.offsetValue.toFixed(1)}s`;
    }
}