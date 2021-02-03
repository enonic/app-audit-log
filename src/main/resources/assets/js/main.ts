import { getEntry } from './preview';
import { sendXMLHttpRequest, shortCreate, formatDate } from './util';

interface GlobalConfig {
    auditServiceUrl: string;
    allUsers: Array<string>;
    allTypes: Array<{
        key: number;
        docCount: string;
    }>;
    launcherUrl: string;
    services: object;
    icon: string;
}

declare global {
    const CONFIG: GlobalConfig;
    const M: Object; //Materialcss
}

// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {
    const selectionElement: HTMLElement = document.querySelector(
        '#select-section .select-list'
    );
    let total = 0;
    let asyncLoading = false;
    // Initial selection list rendering
    newSelectionList();
    setupSelectionList();
    infiniteScrollSelectionList();

    const type = document.getElementById('select-type');
    CONFIG.allTypes.forEach((element) => {
        const option = document.createElement('option');
        option.value = element.key.toString();
        option.textContent = element.key.toString();
        type.appendChild(option);
    });
    // M = materializecss
    (M as any).FormSelect.init(type, {});
    type.addEventListener('change', clearAndUpdate);

    const textSearch = document.getElementById('search-text');
    textSearch.addEventListener('change', clearAndUpdate);
    textSearch.addEventListener('keyup', onEnter);

    const userSearch = document.getElementById('select-user');
    (M as any).Autocomplete.init(userSearch, {
        data: CONFIG.allUsers,
        limit: 20,
        minLength: 2,
    });
    userSearch.addEventListener('change', clearAndUpdate);
    userSearch.addEventListener('keyup', onEnter);

    const datepickers = document.querySelectorAll('.datepicker');
    (M as any).Datepicker.init(datepickers, {
        autoClose: true,
        format: 'yyyy-mm-dd',
        defaultDate: Date.now(),
        showClearBtn: true,
        onClose: clearAndUpdate,
    });

    const searchbutton = document.getElementById('search-button');
    searchbutton.addEventListener('click', function () {
        clearAndUpdate();
    });

    function onEnter(e: KeyboardEvent) {
        if ((e.code === 'Enter')) {
            clearAndUpdate();
        }
    }

    // Htmlelements and nodelist should be the same
    function setupSelectionList(elements: HTMLElement[] | NodeList = selectionElement.childNodes) {
        elements.forEach(function (selectEl: HTMLElement) {
            selectEl.addEventListener('click', handleSelect);
            selectEl.addEventListener('keyDown', handleSelect);
        });

        function handleSelect(event: Event) {
            if (event.type === 'click' || (event.type === 'keyDown' &&
                (event as KeyboardEvent).code === 'Enter')) {
                const clickEl = event.target;
                const target: HTMLElement = (clickEl as HTMLElement).querySelector('.entry');
                const clickElements = selectionElement.querySelectorAll('.entry.active');
                clickElements.forEach(function (item: HTMLElement) {
                    item.classList.remove('active');
                });
                target.classList.add('active');
                const id = target.dataset.a;
                if (id) {
                    getEntry(id);
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
        const options: {
            [key: string]: String;
        } = {};

        const fromEl = document.getElementById('select-from') as HTMLInputElement;
        if (fromEl.value) {
            options.from = fromEl.value;
        }

        const toEl = document.getElementById('select-to') as HTMLInputElement;
        if (toEl.value) {
            options.to = toEl.value;
        }

        const typeEl = document.getElementById('select-type') as HTMLInputElement;
        if (typeEl.value) {
            options.type = typeEl.value;
        }

        const userEl = document.getElementById('select-user') as HTMLInputElement;
        if (userEl.value) {
            options.user = userEl.value;
        }

        const searchEl = document.getElementById('search-text') as HTMLInputElement;
        if (searchEl.value) {
            options.fullText = searchEl.value;
        }

        return options;
    }

    /**
     * Clear selection list and reset the preview
     */
    function clearAll() {
        while (selectionElement.childNodes.length > 0) {
            selectionElement.firstChild.remove();
        }

        /**
         * Preview. Could refactor into preview.es6
         */
        const previewPanel = document.querySelector('.show-wrapper');
        while (previewPanel.childNodes.length > 0) {
            previewPanel.firstChild.remove();
        }

        const helpText = shortCreate(
            'Free space, select something on the left',
            'placeholder',
            'div',
        );

        previewPanel.appendChild(helpText);
    }

    /**
     * Get a new selection list based on the filters active
     * and start generating a new list
     *
     * @param {Object} options Active filters
     */
    function newSelectionList(loading: boolean = true) {
        if (loading) {
            const loadingElement = shortCreate('', 'loading-anim');
            //Add loadinganimation
            for (let i = 0; i < 3; i++) {
                loadingElement.appendChild(shortCreate('', 'dot'));
            }
            selectionElement.prepend(loadingElement);
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

            createSelectionList(responseData);
        }
    }

    /**
     * Creates a new selection list based on the data provided
     *
     * @param {Array} dataList all entries that need to be generated
     */
    function createSelectionList(data: any) {
        const totalEl = document.querySelector('#select-section .total');
        total = data.total;
        totalEl.textContent = `Total: ${data.total}`;

        while (selectionElement.childNodes.length > 0) {
            selectionElement.firstChild.remove();
        }

        data.selections.forEach((selectData) => {
            selectionElement.appendChild(createSelectionElement(selectData));
        });

        // Apply event listners etc.
        setupSelectionList();
    }

    /**
     * Updated the list with new audit-logs. They are fetched from server.
     *
     * @param {Number} start from number to get the logs. eg get from log 100.
     * @param {number} count how many logs to get.
     */
    function updateSelectionList(start: number, count: number, replaceElements: HTMLElement[]) {
        const data = {
            selection: true,
            options: { ...getOptions(), start, count },
        };

        sendXMLHttpRequest(handleUpdateSelection, JSON.stringify(data));

        function handleUpdateSelection(request: XMLHttpRequest) {
            const responseData = JSON.parse(request.response);

            replaceWithNewSelection(replaceElements, responseData.selections);

            asyncLoading = false;
        }
    }

    function replaceWithNewSelection(replaceElements: HTMLElement[], data: any) {
        if (replaceElements.length !== data.length) {
            console.error('Data and replacements do not match');
        }

        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            let button: HTMLElement = replaceElements[i].querySelector('.entry');
            button.classList.remove('tombstone');
            // eslint-disable-next-line no-underscore-dangle
            button.dataset.a = node._id;

            const nested = button.childNodes;
            //Replace icon will go here
            nested[1].childNodes[0].textContent = `${node.type}`;
            nested[1].childNodes[1].textContent = `${node.time}`;
            nested[2].childNodes[0].textContent = `${node.user}`;
        }
    }

    /**
     * Sets up the scroll listener and deals with the ajax calls needed to get new entrys.
     * Should only be called once on page load. Multiple evnt listners will break the page.
     */
    function infiniteScrollSelectionList() {
        //Note total amount so we don't fetch unused items
        let selectionSize = selectionElement.children.length;

        selectionElement.addEventListener('scroll', function () {
            const scroll = selectionElement.scrollTop;
            const scrollOnlyHeight =
                selectionElement.scrollHeight - selectionElement.clientHeight;

            if (
                scroll > scrollOnlyHeight - 300 &&
                asyncLoading === false &&
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
     *
     * @param {Boolean} [append=true]
     */
    function createSelectionTombstones(amount: Number) {
        const group = [];
        for (let i = 0; i < amount; i++) {
            let tombstone = createSelectionElement();
            group.push(tombstone);
            selectionElement.appendChild(tombstone);
        }
        setupSelectionList(group);

        return group;
    }

    function createSelectionElement(data: any = null) {
        let selectItem = document.createElement('li');

        let entryClasses = ['entry'];
        if (data == null || data === undefined) {
            entryClasses.push('tombstone');
        }
        const button = shortCreate('', entryClasses, 'div');
        selectItem.appendChild(button);

        let icon = document.createElement('img');
        icon.src = CONFIG.icon;
        let leftD = document.createElement('div');
        let rightD = document.createElement('div');

        button.appendChild(icon);
        button.appendChild(leftD);
        button.appendChild(rightD);

        if (data) {
            const time = formatDate(new Date(data.time));
            leftD.appendChild(shortCreate(`${data.type}`, 'h6'));
            leftD.appendChild(shortCreate(`${time}`, '', 'time'));
            rightD.appendChild(shortCreate(`${data.user}`, 'user', 'div'));
            // eslint-disable-next-line no-underscore-dangle
            button.dataset.a = data._id;
        } else {
            leftD.appendChild(document.createElement('h6'));
            leftD.appendChild(document.createElement('time'));
            rightD.appendChild(shortCreate(null, 'user', 'div'));
        }

        return selectItem;
    }
});
