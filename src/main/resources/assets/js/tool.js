document.addEventListener("DOMContentLoaded", function () {
    setupEntries();

    //MaterialCss
    var elems = document.querySelectorAll(".collapsible");
    M.Collapsible.init(elems);
});

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
                let id = event.currentTarget.dataset.id;
                if (id) {
                    getEntry(id);
                }
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

function getEntry(id) {
    let data = JSON.stringify({
        logId: id,
    });

    //Service retrieving a audit log entry
    let request = new XMLHttpRequest();
    request.open("POST", window.auditServiceUrl);
    request.setRequestHeader("Content-type", "application/json");

    request.responseType = "application/json";
    request.onload = handleResponse;
    request.send(data);

    function handleResponse() {
        let response = request.response;
        if (request.status == 200 && response) {
            let entry = JSON.parse(response);
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
        } else {
            console.log(request);
        }
    }
}

function createShowEntry(entry) {
    let showEntry = document.createElement("div");
    showEntry.id = "entry-show";

    for (const prop in entry) {
        let node = shortCreate(null, "data");
        if (typeof entry[prop] == "object") {
            node.appendChild(shortCreate(`${prop}:`, "label", "span"));

            if (Array.isArray(entry[prop])) {
                createListStructure(entry[prop], node);
            } else {
                createObjectStructure(entry[prop], node);
            }
        } else {
            node.appendChild(shortCreate(`${prop}:`, "label", "span"));
            node.appendChild(shortCreate(`${entry[prop]}`, "", "span"));
        }
        showEntry.appendChild(node);
    }

    return showEntry;
}

function createObjectStructure(data, parent) {
    for (const prop in data) {
        let node = shortCreate(null, "data");
        if (typeof data[prop] == "object") {
            node.appendChild(shortCreate(`${prop}:`, "label", "span"));
            if (Array.isArray(data[prop])) {
                createListStructure(data[prop], node);
            } else {
                console.log("deeper object");
                createObjectStructure(data[prop], node);
            }
        } else {
            node.appendChild(shortCreate(`${prop}:`, "label", "span"));
            node.appendChild(shortCreate(`${data[prop]}`, "", "span"));
        }
        parent.appendChild(node);
    }
}

function createListStructure(list, parent) {
    list.forEach((item) => {
        parent.appendChild(shortCreate(`${item}`));
    });
}

//showEntry.appendChild(shortCreate(JSON.stringify(entry)));

function shortCreate(text, className = null, tag = "div") {
    let elem = document.createElement(tag);
    if (className) elem.classList.add(className);
    if (text != null) elem.textContent = text;
    return elem;
}
