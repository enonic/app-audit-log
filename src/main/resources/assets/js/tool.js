document.addEventListener("DOMContentLoaded", function () {
    //M = materializecss

    setupSelectionList();

    let type = document.getElementById("select-type");
    // let data = {};
    window.typeAutoComplete.forEach((element) => {
        // data[element.key] = null;
        let option = document.createElement("option");
        option.value = element.key;
        option.textContent = element.key;
        type.appendChild(option);
    });
    M.FormSelect.init(type, {});
    /* M.Autocomplete.init(type, {
        data,
        minLength: 0,
    }); */
    type.addEventListener("change", filterEntries);

    var textSearch = document.getElementById("search-text");
    textSearch.addEventListener("change", filterEntries);

    var datepickers = document.querySelectorAll(".datepicker");
    M.Datepicker.init(datepickers, {
        autoClose: true,
        format: "yyyy-mm-dd",
        defaultDate: Date.now(),
        showClearBtn: true,
        onClose: filterEntries,
    });
});

function setupSelectionList() {
    let selectionList = document.querySelector("#select-section .select-list");

    selectionList.childNodes.forEach(function (selectEl) {
        selectEl.addEventListener("click", handleSelect);
        selectEl.addEventListener("keyDown", handleSelect);
    });

    function handleSelect(event) {
        if ((event.code = "Enter" || event.code == undefined)) {
            let clickEl = event.currentTarget;
            let target = clickEl.querySelector("button");
            let id = target.dataset.a;
            if (id) {
                getEntry(id);
            }
        }
    }
}

/* function setupSelectionGroups() {
    var elems = document.querySelectorAll(".collapsible");
    M.Collapsible.init(elems, {
        onOpenStart: getEnteries, //Create entry list ajax
    });
} */

function filterEntries() {
    clearAll();
    updateEntries();
    setupSelectionList();
}

/**
 * Get the current filters that are active and return them as a options object.
 */
function getOptions() {
    let options = {};
    let fromEl = document.getElementById("select-from");
    if (fromEl.value) {
        options.from = fromEl.value;
    }

    let toEl = document.getElementById("select-to");
    if (toEl.value) {
        options.to = toEl.value;
    }

    let typeEl = document.getElementById("select-type");
    if (typeEl.value) {
        options.type = typeEl.value;
    }

    let searchEl = document.getElementById("search-text");
    if (searchEl.value) {
        options.fullText = searchEl.value;
    }

    return options;
}

/**
 * Clear all selection and reset the preview
 */
function clearAll() {
    let selection = document.querySelector("#select-section .select-list");
    while (selection.childNodes.length > 0) {
        selection.firstChild.remove();
    }

    let preview = document.querySelector(".show-wrapper");
    while (preview.childNodes.length > 0) {
        preview.firstChild.remove();
    }

    let helpText = shortCreate(
        "Free space, select something on the left",
        "placeholder",
        "div"
    );

    preview.appendChild(helpText);
}

/**
 * Get a new selection list based on the filters active
 * and start generating a new list
 * @param {Object} options Active filters
 */
function updateEntries() {
    let selection = document.querySelector("#select-section");

    let loading = shortCreate("", "loading-anim");
    //Add loadinganimation
    for (let i = 0; i < 3; i++) {
        loading.appendChild(shortCreate("", "dot"));
    }
    selection.appendChild(loading);

    let data = {
        selection: true,
        options: getOptions(),
    };

    data = JSON.stringify(data);

    let request = sendXMLHttpRequest(handleSelectionGroup, data);

    function handleSelectionGroup() {
        let responseData = JSON.parse(request.response);

        createSelectionList(responseData);
    }
}

/**
 * Creates a new selection list based on the data provided
 * @param {Array} dataList all entries that need to be generated
 */
function createSelectionList(dataList) {
    let selection = document.querySelector("#select-section");

    while (selection.childNodes.length > 0) {
        selection.firstChild.remove();
    }
    let domList = shortCreate("", "select-list", "ol");

    dataList.forEach((data) => {
        let li = shortCreate("", "", "li");
        let button = shortCreate("", "entry", "button");
        li.appendChild(button);

        button.dataset.a = data._id;
        button.appendChild(shortCreate(`${data.time}`, "", "time"));
        button.appendChild(shortCreate(`${data.type}`, ""));
        button.appendChild(shortCreate(`${data.user}`, ""));

        domList.append(li);
    });
    selection.appendChild(domList);

    // Apply event listners etc.
    setupSelectionList();
}

/**
 * Uses ajax to get all entries from a single day.
 * Also adds a loading animtation
 * @param {HTMLElement} element the dom element that was clicked
 */
/* function getEnteries(element) {
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
        user: id,
        options: getOptions(),
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
} */

/**
 * Method for creating the expanded entry list when pressing on the dropdown.
 * @param {Array} entriesData The selection entries
 * @param {HTMLElement} container parent container (When pressed to open)
 */
/* function setupEntries(entriesData, container) {
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
} */

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
    let showEntry = document.createElement("section");
    showEntry.id = "entry-show";

    // Top section
    let topBlock = shortCreate(null, "item-data-group");
    let headline = shortCreate(`${entry.cleanType}`, "headline", "h1");
    //let subheader = shortCreate(`${entry._id}`, "section-headline", "h2");

    showEntry.appendChild(topBlock);
    topBlock.appendChild(headline);

    let topTable = shortCreate(null, "propList", "table");
    topBlock.appendChild(topTable);

    for (const prop in entry) {
        if (prop != "data") {
            let tr = shortCreate(null, "", "tr");
            let labelEl = shortCreate(`${prop}:`, "", "td");
            let valueEl = shortCreate(null, "", "td");
            tr.appendChild(labelEl);

            if (Array.isArray(entry[prop])) {
                createListStructure(entry[prop], valueEl);
            } else {
                valueEl.textContent = `${entry[prop]}`;
            }
            
            tr.appendChild(valueEl);
            topTable.appendChild(tr);
        }
    }

    // Data section
    let dataBlock = shortCreate(null, "item-data-group");
    //dataBlock.appendChild();
    showEntry.appendChild(dataBlock);

    let dataHeader = shortCreate("Data", "section-headline", "h2");
    let dataTable = shortCreate(null, "", "table");

    dataBlock.appendChild(dataHeader);
    dataBlock.appendChild(dataTable);

    let data = entry.data;

    createObjectStructure(data, dataTable);

    /* for (const prop in data) {
        let tr = shortCreate(null, "", "tr");

        if (typeof data[prop] == "object") {
            node.appendChild(shortCreate(`${prop}:`, "", "td"));

            if (Array.isArray(data[prop])) {
                createListStructure(data[prop], node);
            } else {
                createObjectStructure(data[prop], node);
            }
        } else {
            node.appendChild(shortCreate(`${prop}:`, "", "td"));
            node.appendChild(shortCreate(`${data[prop]}`, "", "td"));
        }
        dataTable.appendChild(node);
    } */

    return showEntry;
}

// Recusive function that handles all data structures
function createObjectStructure(data, parent) {
    let table = shortCreate(null, "", "table");
    parent.appendChild(table);

    for (const prop in data) {
        let tr = shortCreate(null, "", "tr");
        if (typeof data[prop] == "object") {
            let topTd = shortCreate(null, "", "td");
            tr.appendChild(shortCreate(`${prop}:`, "", "td"));
            tr.appendChild(topTd);
            if (Array.isArray(data[prop])) {
                createListStructure(data[prop], topTd);
            } else {
                createObjectStructure(data[prop], topTd);
            }
        } else {
            tr.appendChild(shortCreate(`${prop}:`, "label", "td"));
            tr.appendChild(shortCreate(`${data[prop]}`, "", "td"));
        }
        table.appendChild(tr);
    }
}

function createListStructure(list, parent) {
    list.forEach(function (item) {
        parent.appendChild(shortCreate(`${item}`, null));
    });
}

// A small util methods for fast dom element creation
function shortCreate(text, className = null, tag = "div") {
    let elem = document.createElement(tag);

    if (Array.isArray(className)) {
        className.forEach((singleClass) => {
            elem.classList.add(singleClass);
        });
    } else if (className) {
        elem.classList.add(className);
    }
    if (text != null) elem.textContent = text;
    return elem;
}
