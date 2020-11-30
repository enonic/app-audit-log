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
    window.typeAutoComplete.forEach((element) => {
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

    const datepickers = document.querySelectorAll(".datepicker");
    M.Datepicker.init(datepickers, {
        autoClose: true,
        format: "yyyy-mm-dd",
        defaultDate: Date.now(),
        showClearBtn: true,
        onClose: clearAndUpdate,
    });

    function setupSelectionList() {
        selectionList.childNodes.forEach(function (selectEl) {
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

        const searchEl = document.getElementById("search-text");
        if (searchEl.value) {
            options.fullText = searchEl.value;
        }

        return options;
    }

    /**
     * Clear all selection and reset the preview
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
            let li = shortCreate("", "", "li");
            let button = shortCreate("", "entry", "button");
            li.appendChild(button);

            button.dataset.a = data._id;
            let leftD = document.createElement("div");
            let rightD = document.createElement("div");
            leftD.appendChild(shortCreate(`${data.type}`, "h6"));
            leftD.appendChild(shortCreate(`${data.time}`, "", "time"));
            rightD.appendChild(shortCreate(`${data.user}`, ""));
            button.appendChild(leftD);
            button.appendChild(rightD);

            selectionList.append(li);
        });

        // Apply event listners etc.
        setupSelectionList();
    }

    /**
     * Updated the list with new audit-logs
     * Get start of logs and count is the amount of logs to fetch. eks: start: 100: count: 50
     * @param {Number} start
     * @param {number} count
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
            let node = data[i];
            let button = replaceElements[i].querySelector(".entry");
            button.classList.remove("tombstone");
            button.dataset.a = node._id;

            let children = button.childNodes;
            children[0].textContent = `${node.type}`;
            children[1].textContent = `${node.user}`;
            children[2].textContent = `${node.time}`;
        }
    }

    function infiniteScrollSelectionList() {
        //Note total amount so we don't fetch unused items
        selectionList.addEventListener("scroll", function () {
            let selectionSize = selectionList.children.length;
            let scroll = selectionList.scrollTop;
            let scrollOnlyHeight =
                selectionList.scrollHeight - selectionList.clientHeight;

            if (
                scroll > scrollOnlyHeight - 300 &&
                asyncLoading == false &&
                currentSelection[1] < total
            ) {
                let oneJump = 25;
                asyncLoading = true;

                let nextBatch =  oneJump;
                if (selectionSize + oneJump > total) {
                    nextBatch = selectionSize - total;
                }
                

                let tombStoneItems = createSelectionTombstones(
                    nodesToRequest,
                    "append"
                );

                updateSelectionList(
                    oldListSize,
                    nodesToRequest,
                    tombStoneItems
                );
            }
            // TODO back to top infinite scroller
        });
    }

    /**
     * Placeholders/tombstones for new entries fill be used when content is fetched
     * @param {Boolean} [append=true]
     */
    function createSelectionTombstones(amount,) {        

        for (let i=0; i<amount; i++) {
            let selectItem = document.createElement("li");
            const button = shortCreate("", [".entry", ".tombstone"], "button");
            selectItem.appendChild(button);
            
            let leftD = document.createElement("div");
            let rightD = document.createElement("div");

            button.appendChild(leftD);
            button.appendChild(rightD);

            selectionList.append(selectItem);
        }

        return oldGroup;
    }

    function createSelectionElement(data) {
        let selectItem = document.createElement("li");

        let entryClasses = ["entry"];
        if (data) {
            entryClasses.appendChild("tombstone");
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
            rightD.appendChild(shortCreate(`${data.user}`, ""));
            button.dataset.a = data._id;
        } else {
            leftD.appendChild(document.createElement("h6"));
            leftD.appendChild(document.createElement("time"));
            rightD.appendChild(document.createElement(""));
        }

        return selectItem;
    }
});
