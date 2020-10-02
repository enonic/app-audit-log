document.addEventListener("DOMContentLoaded", function () {
    cleanDate();
    setupEntries();

    //MaterialCss
    var elems = document.querySelectorAll(".collapsible");
    M.Collapsible.init(elems);
});

function cleanDate() {
    let timetag = document.querySelectorAll("time.format-time");
    timetag.forEach((entry) => {
        let utcTime = entry.getAttribute("datetime");
        let entryTime = new Date(utcTime);
        let localTime = entryTime.toLocaleString(undefined, {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        });
        entry.textContent = localTime;
    });

    let dateonly = document.querySelectorAll("time.format-date");
    dateonly.forEach((entry) => {
        let utcTime = entry.getAttribute("datetime");
        let entryTime = new Date(utcTime);
        let localTime = entryTime.toLocaleDateString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
        entry.textContent = localTime;
    });
}

function setupEntries() {
    let entries = document.getElementsByClassName("entry");
    /* Event will not work on entry addition scroll loaded */
    for (let entry of entries) {
        entry.addEventListener("click", handleSelected);
        entry.addEventListener("keyDown", handleSelected);
    }

    function unselectAll() {
        for (let entry of entries) {
            entry.classList.remove("selected");
        }
    }

    function handleSelected(event) {
        if ((event.code = "Enter" || event.code == undefined)) {
            let pressed = toggleEntry(event.currentTarget);
            if (pressed) {
                showEntry(event.currentTarget);
            }
        }
    }

    function toggleEntry(target) {
        let active = false;
        if (target.classList.contains("selected")) {
            active = true;
        }
        unselectAll();
        // Switch state
        if (active) {
            target.classList.remove("selected");
            return false;
        } else {
            target.classList.add("selected");
            return true;
        }
    }
}

function showEntry(entryHtmlElement) {
    let id = entryHtmlElement.dataset.id;
    if (id) {
        let entry = window.allEntries.find((elem) => elem.id == id);
        if (entry) {
            let placeholder = document.querySelector("#preview .placeholder");
            if (placeholder) {
                placeholder.remove();
            }
            let show = document.querySelector("#preview .show-wrapper");
            while (show.childNodes.length > 0) {
                show.firstChild.remove();
            }
            //show.textContent = JSON.stringify(entry, null, 4);

            show.appendChild(createShowEntry(entry));
        }
    }
}

function createShowEntry(entry) {
    let showEntry = document.createElement("div");
    showEntry.id = "entry-show";
    showEntry.style.backgroundColor = "pink";

    showEntry.appendChild(shortCreate(entry.timestamp, "", "time"));
    showEntry.appendChild(shortCreate(entry.user));
    showEntry.appendChild(shortCreate(JSON.stringify(entry.objects)));

    return showEntry;

    function shortCreate(text, className = null, tag = "div") {
        let elem = document.createElement(tag);
        if (className) elem.classList.add(className);
        elem.textContent = text;
        return elem;
    }
}
