document.addEventListener("DOMContentLoaded", function () {
    //MaterialCss
    var elems = document.querySelectorAll(".collapsible");
    M.Collapsible.init(elems, {
        onOpenStart: getEnteries, //Create entry list ajax
    });

    let data = {};
    window.typeAutoComplete.forEach((element) => {
        data[element.key] = null;
    });

    var autoComplete = document.querySelectorAll(".autocomplete");
    M.Autocomplete.init(autoComplete, {
        data,
        minLength: 0,
    });
    // Need to iterate over all if more the none
    autoComplete[0].addEventListener("change", filterEntries);

    var datepickers = document.querySelectorAll(".datepicker");
    M.Datepicker.init(datepickers, {
        autoClose: true,
        format: "yyyy-mm-dd",
        defaultDate: Date.now(),
        showClearBtn: true,
        onClose: filterEntries,
    });
});

function filterEntries() {
    let fromEl = document.getElementById("select-from");
    let from = null;
    if (fromEl.value) {
        from = fromEl.value;
    }

    let toEl = document.getElementById("select-to");
    let to = null;
    if (toEl.value) {
        to = toEl.value;
    }

    let typeEl = document.getElementById("select-type");
    let type = null;
    if (typeEl.value) {
        type = typeEl.value;
    }

    clearAll();
    getSelectionGroups(from, to, type);
}

function clearAll() {
    let selection = document.querySelector("#select-section");
    while (selection.childNodes.length > 0) {
        selection.firstChild.remove();
    }

    let preview = document.querySelector(".show-wrapper");
    while (preview.childNodes.length > 0) {
        preview.firstChild.remove();
    }

    preview.appendChild(
        shortCreate(
            "Free space, select something on the left",
            "placeholder",
            "span"
        )
    );
}

function getSelectionGroups(from, to, type) {
    let selection = document.querySelector("#select-section");

    let loading = shortCreate("", "loading-anim");
    //Add loadinganimation
    for (let i = 0; i < 3; i++) {
        loading.appendChild(shortCreate("", "dot"));
    }
    selection.appendChild(loading);

    let data = {
        selectionGroup: true,
    };
    if (to) data.to = to;
    if (from) data.from = from;
    if (type) data.from = type;

    data = JSON.stringify(data);

    let request = sendXMLHttpRequest(handleSelectionGroup, data);

    function handleSelectionGroup() {
        let data = JSON.parse(request.response);

        console.log(data);

        createSelectionGroups(data);
    }
}

function createSelectionGroups(data) {
    //test;
}

/**
 * Uses ajax to get all entries from a single day.
 * Also adds a loading animtation
 * @param {HTMLElement} element the dom element that was clicked
 */
function getEnteries(element) {
    let container = element.querySelector(".day-body");

    //If its not empty ignore it!
    if (container.childNodes.length > 0) {
        return;
    }
    //Add loadinganimation
    let loading = shortCreate("", "loading-anim");
    for (let i = 0; i < 3; i++) {
        loading.appendChild(shortCreate("", "dot"));
    }

    container.appendChild(loading);

    let id = element.querySelector(".day-header").dataset.a;

    let data = JSON.stringify({
        singelDate: id,
    });

    let request = sendXMLHttpRequest(handleOpenEntries, data);

    function handleOpenEntries() {
        let data = JSON.parse(request.response);

        //Clear loading animation
        while (container.childNodes.length > 0) {
            container.firstChild.remove();
        }

        setupEntries(data, container);
    }
}

/**
 * Method for creating the expanded entry list when pressing on the dropdown.
 * @param {Array} entriesData The selection entries
 * @param {HTMLElement} container parent container (When pressed to open)
 */
function setupEntries(entriesData, container) {
    let entries = [];
    entriesData.forEach(function (dataEntry) {
        let domEntry = shortCreate(
            `${dataEntry.time}  ${dataEntry.type}`,
            "entry",
            "button"
        );
        domEntry.innerHTML += `<br>${dataEntry.user}`;
        domEntry.dataset.h = dataEntry.id;
        container.appendChild(domEntry);
        entries.push(domEntry);
    });

    entries.forEach(function (entry) {
        entry.addEventListener("click", handleSelected);
        entry.addEventListener("keyDown", handleSelected);
    });

    function unselectAll() {
        let list = document.getElementsByClassName("entry");
        for (entry of list) {
            entry.classList.remove("selected");
        }
    }

    function handleSelected(event) {
        if ((event.code = "Enter" || event.code == undefined)) {
            let pressed = toggleEntry(event.currentTarget);
            if (pressed) {
                let id = event.currentTarget.dataset.h;
                if (id) {
                    getEntry(id);
                }
            }
        }
    }

    function toggleEntry(target) {
        let active = target.classList.contains("selected");

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

/**
 * Shorthand function for sendign ajax request
 * @param {function} handler
 * @param {*} data
 * @returns {request} The xml request object
 */
function sendXMLHttpRequest(handler, data) {
    let request = new XMLHttpRequest();
    request.open("POST", window.auditServiceUrl);
    request.setRequestHeader("Content-type", "application/json");

    request.responseType = "application/json";
    request.onload = handler;
    request.send(data);

    return request;
}

/**
 * Gets a single log entry from the server
 * @param {String} id
 */
function getEntry(id) {
    let data = JSON.stringify({
        entryId: id,
    });

    let request = sendXMLHttpRequest(handleResponse, data);

    //Service retrieving a audit log entry
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

            show.appendChild(createEntry(entry));
        } else {
            console.error(request);
        }
    }
}

//Does all the dom manipulation to show a single log entry
function createEntry(entry) {
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

// Recusive function that handles all data structures
function createObjectStructure(data, parent) {
    for (const prop in data) {
        let node = shortCreate(null, "data");
        if (typeof data[prop] == "object") {
            node.appendChild(shortCreate(`${prop}:`, "label", "span"));
            if (Array.isArray(data[prop])) {
                createListStructure(data[prop], node);
            } else {
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

// A small util methods for fast dom element creation
function shortCreate(text, className = null, tag = "div") {
    let elem = document.createElement(tag);
    if (className) elem.classList.add(className);
    if (text != null) elem.textContent = text;
    return elem;
}
