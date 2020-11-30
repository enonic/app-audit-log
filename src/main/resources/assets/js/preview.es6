const util = require("./util.es6");
const shortCreate = util.shortCreate;
const sendXMLHttpRequest = util.sendXMLHttpRequest;

/**
 * Request and show an log entry in the preview panel
 * @param {String} id
 */
export function getEntry(id) {
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
    let title = shortCreate(`${entry.type}`, "title", "h1");
    let path = shortCreate(`${entry.user}`, "path", "h4");
    header.appendChild(title);
    header.appendChild(path);
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

// Creates a list out of an array value
function createListStructure(list, parent, tag) {
    list.forEach(function (item) {
        parent.appendChild(shortCreate(`${item}`, null, tag));
    });
}