const preview = require("./preview.es6");
const util = require("./util.es6");
const shortCreate = util.shortCreate;
const sendXMLHttpRequest = util.sendXMLHttpRequest;

// Main function called on page load
document.addEventListener("DOMContentLoaded", function () {
    const selectionList = document.querySelector(
        "#select-section .select-list"
    );
    let total = 0;
    let asyncLoading = false;
    // Initial selection list rendering
    newSelectionList();
    setupSelectionList();
    infiniteScrollSelectionList();

    const type = document.getElementById("select-type");
    CONFIG.allTypes.forEach((element) => {
        const option = document.createElement("option");
        option.value = element.key;
        option.textContent = element.key;
        type.appendChild(option);
    });
    // M = materializecss
    M.FormSelect.init(type, {});
    type.addEventListener("change", clearAndUpdate);

    const textSearch = document.getElementById("search-text");
    textSearch.addEventListener("change", clearAndUpdate);

    const userSearch = document.getElementById("select-user");
    M.Autocomplete.init(userSearch, {
        onAutocomplete: clearAndUpdate,
        data: CONFIG.allUsers, 
        limit: 20,
        minLength: 2,
    });
    //userSearch.addEventListener("change", clearAndUpdate);

    const datepickers = document.querySelectorAll(".datepicker");
    M.Datepicker.init(datepickers, {
        autoClose: true,
        format: "yyyy-mm-dd",
        defaultDate: Date.now(),
        showClearBtn: true,
        onClose: clearAndUpdate,
    });

    const button = document.getElementById("search-button");
    button.addEventListener("click", function() {
        clearAndUpdate();
    });


    function setupSelectionList(elements) {
        if (elements == undefined) {
            element = selectionList.childNodes;
        }
        element.forEach(function (selectEl) {
            selectEl.addEventListener("click", handleSelect);
            selectEl.addEventListener("keyDown", handleSelect);
        });

        function handleSelect(event) {
            if ((event.code = "Enter" || event.code == undefined)) {
                const clickEl = event.currentTarget;
                const target = clickEl.querySelector("button");
                const id = target.dataset.a;
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
        newSelectionList();
        setupSelectionList();
    }

    /**
     * Get the current filters that are active and return them as a options object.
     */
    function getOptions() {
        const options = {};
        const fromEl = document.getElementById("select-from");
        if (fromEl.value) {
            options.from = fromEl.value;
        }

        const toEl = document.getElementById("select-to");
        if (toEl.value) {
            options.to = toEl.value;
        }

        const typeEl = document.getElementById("select-type");
        if (typeEl.value) {
            options.type = typeEl.value;
        }

        const userEl = document.getElementById("select-user");
        if (userEl.value) {
            options.user = userEl.value;
        }

        const searchEl = document.getElementById("search-text");
        if (searchEl.value) {
            options.fullText = searchEl.value;
        }

        return options;
    }

    /**
     * Clear selection list and reset the preview
     */
    function clearAll() {
        while (selectionList.childNodes.length > 0) {
            selectionList.firstChild.remove();
        }

        /**
         * Preview. Could refactor into preview.es6
         */
        const previewPanel = document.querySelector(".show-wrapper");
        while (previewPanel.childNodes.length > 0) {
            previewPanel.firstChild.remove();
        }

        const helpText = shortCreate(
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
    function newSelectionList(loading = true) {
        if (loading) {
            const loading = shortCreate("", "loading-anim");
            //Add loadinganimation
            for (let i = 0; i < 3; i++) {
                loading.appendChild(shortCreate("", "dot"));
            }
            selectionList.prepend(loading);
        }

        const data = {
            selection: true,
            options: getOptions(),
        };

        const request = sendXMLHttpRequest(
            handleSelectionGroup,
            JSON.stringify(data)
        );

        function handleSelectionGroup() {
            const responseData = JSON.parse(request.response);
            total = responseData.total;

            createSelectionList(responseData);
        }
    }

    /**
     * Creates a new selection list based on the data provided
     * @param {Array} dataList all entries that need to be generated
     */
    function createSelectionList(dataList) {
        const totalEl = document.querySelector("#select-section .total");

        totalEl.textContent = `Total: ${total}`;

        while (selectionList.childNodes.length > 0) {
            selectionList.firstChild.remove();
        }

        dataList.selections.forEach((data) => {
            selectionList.appendChild(createSelectionElement(data));
        });

        // Apply event listners etc.
        setupSelectionList();
    }

    /**
     * Updated the list with new audit-logs. They are fetched from server.
     * @param {Number} start from number to get the logs. eg get from log 100.
     * @param {number} count how many logs to get.
     */
    function updateSelectionList(start, count, replaceElements) {
        const data = {
            selection: true,
            options: { ...getOptions(), start, count },
        };

        sendXMLHttpRequest(handleUpdateSelection, JSON.stringify(data));

        function handleUpdateSelection(request) {
            const responseData = JSON.parse(request.response);

            replaceWithNewSelection(replaceElements, responseData.selections);

            asyncLoading = false;
        }
    }

    function replaceWithNewSelection(replaceElements, data) {
        if (replaceElements.length != data.length) {
            console.error("Data and replacements do not match");
        }

        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            let button = replaceElements[i].querySelector(".entry");
            button.classList.remove("tombstone");
            button.dataset.a = node._id;

            const nested = button.childNodes;
            nested[0].childNodes[0].textContent = `${node.type}`;
            nested[0].childNodes[1].textContent = `${node.time}`;
            nested[1].childNodes[0].textContent = `${node.user}`;
        }
    }

    /**
     * Sets up the scroll listener and deals with the ajax calls needed to get new entrys.
     * Should only be called once on page load. Multiple evnt listners will break the page.
     */
    function infiniteScrollSelectionList() {
        //Note total amount so we don't fetch unused items
        let selectionSize = selectionList.children.length;

        selectionList.addEventListener("scroll", function () {
            const scroll = selectionList.scrollTop;
            const scrollOnlyHeight =
                selectionList.scrollHeight - selectionList.clientHeight;

            if (
                scroll > scrollOnlyHeight - 300 &&
                asyncLoading == false &&
                selectionSize < total
            ) {
                const oneJump = 25;
                asyncLoading = true;

                let nextBatch = oneJump;
                if (selectionSize + oneJump > total) {
                    nextBatch = total - selectionSize;
                }
                selectionSize += nextBatch;
                const tombStoneItems = createSelectionTombstones(nextBatch);

                updateSelectionList(
                    selectionSize - nextBatch,
                    nextBatch,
                    tombStoneItems
                );
            }
        });
    }

    /**
     * Placeholders/tombstones for new entries fill be used when content is fetched
     * @param {Boolean} [append=true]
     */
    function createSelectionTombstones(amount) {
        const group = [];
        for (let i = 0; i < amount; i++) {
            let tombstone = createSelectionElement();
            group.push(tombstone);
            selectionList.appendChild(tombstone);
        }
        setupSelectionList(group)

        return group;
    }

    function createSelectionElement(data) {
        let selectItem = document.createElement("li");

        let entryClasses = ["entry"];
        if (data == null || data == undefined) {
            entryClasses.push("tombstone");
        }
        const button = shortCreate("", entryClasses, "button");
        selectItem.appendChild(button);

        let leftD = document.createElement("div");
        let rightD = document.createElement("div");

        button.appendChild(leftD);
        button.appendChild(rightD);

        if (data) {
            leftD.appendChild(shortCreate(`${data.type}`, "h6"));
            leftD.appendChild(shortCreate(`${data.time}`, "", "time"));
            rightD.appendChild(shortCreate(`${data.user}`, "user", "div"));
            button.dataset.a = data._id;
        } else {
            leftD.appendChild(document.createElement("h6"));
            leftD.appendChild(document.createElement("time"));
            rightD.appendChild(shortCreate(null, "user", "div"));
        }

        return selectItem;
    }
});
