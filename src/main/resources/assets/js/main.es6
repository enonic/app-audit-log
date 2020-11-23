const preview = require("./preview.es6");
const util = require("./util.es6");
const shortCreate = util.shortCreate;
const sendXMLHttpRequest = util.sendXMLHttpRequest;

// Main function called on page load
document.addEventListener("DOMContentLoaded", function () {
    // Initial selection list rendering
    updateSelectionList();
    setupSelectionList();
    infiniteScrollSelectionList();

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
    type.addEventListener("change", clearAndUpdate);

    var textSearch = document.getElementById("search-text");
    textSearch.addEventListener("change", clearAndUpdate);

    var datepickers = document.querySelectorAll(".datepicker");
    M.Datepicker.init(datepickers, {
        autoClose: true,
        format: "yyyy-mm-dd",
        defaultDate: Date.now(),
        showClearBtn: true,
        onClose: clearAndUpdate,
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
                preview.getEntry(id);
            }
        }
    }
}

/**
 * Clear the panels and get a new selection list
 */
function clearAndUpdate() {
    clearAll();
    updateSelectionList();
    setupSelectionList();
    infiniteScrollSelectionList();
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

    /**
     * Preview. Could refactor into preview.es6
     */
    let previewPanel = document.querySelector(".show-wrapper");
    while (previewPanel.childNodes.length > 0) {
        previewPanel.firstChild.remove();
    }

    let helpText = shortCreate(
        "Free space, select something on the left",
        "placeholder",
        "div"
    );

    previewPanel.appendChild(helpText);
}

/**
 * Get a new selection list based on the filters active
 * and start generating a new list
 * @param {Object} options Active filters
 */
function updateSelectionList() {
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
    let total = document.querySelector("#select-section .total");
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

function infiniteScrollSelectionList() {
    let selectionList = document.querySelector("#select-section .select-list");
    let loading = false;

    selectionList.addEventListener("scroll", function() {
        let scroll = selectionList.scrollTop;
        let scrollOnlyHeight = selectionList.scrollHeight - selectionList.clientHeight;
        if (scroll > scrollOnlyHeight - 300) {
            // resycle elements back into view
            console.log("Load new!");
        }
    });
}