const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function suggestOpen() {
    fader.style.pointerEvents = "all";
    fader.style.opacity = 1;
    suggestType(null); // Init the selection
}

function suggestType(event) {
    type = menu.value;
    Array.from(menu.childNodes).filter(child => {
        return child.nodeName == "OPTION"
    }).forEach(option => {
        if (option.value == "") return; // Skip placeholder
        tab = document.getElementById(option.value);
        selected = tab.id == type;
        tab.style.display = (selected ? "block" : "none");

        // Clear and change required fields
        Array.from(tab.childNodes).filter(child => {
            return child.id
        }).forEach(element => {
            element.required = selected;
            if (!selected) element.value = "";
        });
    });
}

function suggestClose(event) {
    fader.style.pointerEvents = "none";
    fader.style.opacity = 0;
}

let fader = document.getElementById("suggestFade");
let menu = document.getElementById("suggestSelect");

menu.addEventListener("input", suggestType);
document.getElementById("suggestCancel").addEventListener("click", suggestClose);