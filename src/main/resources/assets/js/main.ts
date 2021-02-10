import { getEntry } from './preview';
import { sendXMLHttpRequest, shortCreate, formatDate } from './util';
import { createDatePicker } from './components';
import { Application } from 'lib-admin-ui/app/Application';
import { AppPanel } from 'lib-admin-ui/app/AppPanel';
import { AppBar } from 'lib-admin-ui/app/bar/AppBar';
import { SplitPanel, SplitPanelAlignment, SplitPanelBuilder, SplitPanelUnit } from 'lib-admin-ui/ui/panel/SplitPanel';
import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { DeckPanel } from 'lib-admin-ui/ui/panel/DeckPanel';
import { Element } from 'lib-admin-ui/dom/Element';
import { Body } from 'lib-admin-ui/dom/Body';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';

interface GlobalConfig {
    auditServiceUrl: string;
    allUsers: Array<string>;
    allTypes: Array<{
        key: number;
        docCount: string;
    }>;
    launcherUrl: string;
    services: object;
    appIconUrl: string;
    icon: string;
}

declare global {
    const CONFIG: GlobalConfig;
}

// const body = Body.get();
class AuditLogView {
    body: Body = null;

    constructor() {
        const app = this.createApplication();
        this.body = Body.get();
        this.createAppPanels(app);
        console.log(this.body);
    }

    createApplication(): Application {
        const iconUrl = CONFIG.appIconUrl;
        const app = new Application('audit-log', 'Audit Log Browser', 'ALB', iconUrl);
        app.setWindow(window);
        return app;
    }

    createAppPanels(app: Application) {
        const appBar = new AppBar(app);
        const appPanel = new AppPanel('app-container');
        const toolbar = this.createTopToolbar();

        const previewPanel = this.createPreviewPanel();
        const selectPanel = this.createSelectPanel();
        const splitPanel = this.createSplitPanel(selectPanel, previewPanel);

        const mainPanel = new DeckPanel('main-panel');
        const editPanel = new Panel('edit-panel');
        mainPanel.appendChildren(...[appBar, editPanel]);

        editPanel.appendChildren(...[toolbar, splitPanel]);

        appPanel.appendChild(mainPanel);

        this.body.appendChild(appPanel);
    }

    createSplitPanel(left: Panel, right: Panel): SplitPanel {
        const panel = new SplitPanelBuilder(left, right)
            .setAlignment(SplitPanelAlignment.VERTICAL)
            .setSecondPanelMinSize(30, SplitPanelUnit.PERCENT)
            .setFirstPanelMinSize(30, SplitPanelUnit.PERCENT)
            .setFirstPanelSize(38, SplitPanelUnit.PERCENT)
            .build();
        panel.getEl().setTopPx(44);
        return panel;
    }

    //Preview panel
    createSelectPanel() {
        const selectPanel = new Panel('select-panel');

        selectPanel.appendChild(new Toolbar('select-toolbar'));

        return selectPanel;
    }

    createPreviewPanel() {
        return new Panel('preview-panel');
    }

    createTopToolbar(): Toolbar {
        const toolbar = new Toolbar('tools');

        toolbar
            .appendChild(createDatePicker('select-from'))
            .appendChild(createDatePicker('select-to'));

        return toolbar;
    }
}


// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {

    let applicationView = new AuditLogView();

});

function oldRender() {
    const selectionElement: HTMLElement = document.querySelector(
        '#select-section .select-list'
    );
    let total: number = 0;
    let asyncLoading: boolean = false;

    // Initial selection list rendering
    newSelectionList();
    setupSelectionList();
    infiniteScrollSelectionList();

    const type: HTMLElement = document.getElementById('select-type');
    CONFIG.allTypes.forEach((element) => {
        const option = document.createElement('option');
        option.value = element.key.toString();
        option.textContent = element.key.toString();
        type.appendChild(option);
    });

    type.addEventListener('change', clearAndUpdate);

    const textSearch: HTMLElement = document.getElementById('search-text');
    textSearch.addEventListener('change', clearAndUpdate);
    textSearch.addEventListener('keyup', onEnter);

    const userSearch = document.getElementById('select-user');

    userSearch.addEventListener('change', clearAndUpdate);
    userSearch.addEventListener('keyup', onEnter);

    const datepickerDivs: NodeList = document.querySelectorAll('.datepicker');
    const fromInput = createDatePicker('select-from');
    const toInput = createDatePicker('select-to');

    // datepickerDivs[0].appendChild(fromInput);
    // datepickerDivs[1].appendChild(toInput);

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
                const clickEl = event.currentTarget;
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
        if (fromEl && fromEl.value) {
            options.from = fromEl.value;
        }

        const toEl = document.getElementById('select-to') as HTMLInputElement;
        if (toEl && toEl.value) {
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
        const previewPanel: HTMLElement = document.querySelector('.show-wrapper');
        while (previewPanel.childNodes.length > 0) {
            previewPanel.firstChild.remove();
        }

        const helpText: HTMLElement = shortCreate(
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
            const responseData = request.response;

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
            const responseData = request.response;

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
}
