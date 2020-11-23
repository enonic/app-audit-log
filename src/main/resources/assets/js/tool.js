document.addEventListener("DOMContentLoaded", function () {
    // Initial selection list rendering
    updateEntries();
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
    // M = materializecss
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
    let selection = document.querySelector("#select-section .select-list");

    let loading = shortCreate("", "loading-anim");
    //Add loadinganimation
    for (let i = 0; i < 3; i++) {
        loading.appendChild(shortCreate("", "dot"));
    }
    selection.prepend(loading);

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
    let total = document.querySelector('#select-section .total');
    let selection = document.querySelector("#select-section .select-list");

    total.textContent = `Total: ${dataList.total}`;

    while (selection.childNodes.length > 0) {
        selection.firstChild.remove();
    }

    dataList.selections.forEach((data) => {
        let li = shortCreate("", "", "li");
        let button = shortCreate("", "entry", "button");
        li.appendChild(button);

        button.dataset.a = data._id;
        button.appendChild(shortCreate(`${data.type}`, ""));
        button.appendChild(shortCreate(`${data.user}`, ""));
        button.appendChild(shortCreate(`${data.time}`, "", "time"));

        selection.append(li);
    });

    // Apply event listners etc.
    setupSelectionList();
}

/**
 * Shorthand function for sending ajax request
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
    showEntry.classList += "item-statistics-panel";
    let header = shortCreate(null, "header");
    header.id = "previewHeader";

    // header
    let image = shortCreate(null, null, "img");
    image.style.visibility = "hidden";
    header.appendChild(image);
    let title = shortCreate(`Log entry`, "title", "h1");
    header.appendChild(title);
    showEntry.appendChild(header);

    let propPanel = shortCreate(null, "properties-panel");
    showEntry.appendChild(propPanel);

    // top property list
    let itemGroup = shortCreate(null, "item-data-group");
    propPanel.appendChild(itemGroup);

    for (const prop in entry) {
        let propList = shortCreate(null, "data-list", "ul");
        itemGroup.appendChild(propList);

        if (prop != "data") {
            let listheader = shortCreate(`${prop}`, "list-header", "li");
            propList.appendChild(listheader);
            let valueEl = shortCreate(null, null, "li");

            if (Array.isArray(entry[prop])) {
                createListStructure(entry[prop], propList, "li");
            } else {
                valueEl.textContent = `${entry[prop]}`;
                propList.appendChild(valueEl);
            }
        }
    }

    // Data section
    let dataBlock = shortCreate(null, "item-data-group");
    propPanel.appendChild(dataBlock);

    let dataHeader = shortCreate("Data", "", "h2");
    dataBlock.appendChild(dataHeader);

    let data = entry.data;

    createObjectStructure(data, dataBlock);

    return showEntry;
}

// Recusive function that handles all data structures
function createObjectStructure(data, parent) {
    for (const prop in data) {
        let propList = shortCreate(null, "data-list", "ul");
        parent.appendChild(propList);

        if (typeof data[prop] == "object") {
            let header = shortCreate(`${prop}`, "list-header", "li");
            propList.appendChild(header);
            if (Array.isArray(data[prop])) {
                createListStructure(data[prop], propList, "li");
            } else {
                propList.classList.add("align-top");
                propList.classList.add("nested");
                let item = shortCreate(null, null, "li");
                propList.appendChild(item);
                createObjectStructure(data[prop], item);
            }
        } else {
            propList.appendChild(shortCreate(`${prop}`, "list-header", "li"));
            propList.appendChild(shortCreate(`${data[prop]}`, "", "li"));
        }
    }
}

function createListStructure(list, parent, tag) {
    list.forEach(function (item) {
        parent.appendChild(shortCreate(`${item}`, null, tag));
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
