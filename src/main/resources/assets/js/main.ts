import { createDatePicker } from './components';
import { setDropdownTypes, setDropDownUsers } from './data';
import { Application } from 'lib-admin-ui/app/Application';
import { AppPanel } from 'lib-admin-ui/app/AppPanel';
import { AppBar } from 'lib-admin-ui/app/bar/AppBar';
import { SplitPanel, SplitPanelAlignment, SplitPanelBuilder, SplitPanelUnit } from 'lib-admin-ui/ui/panel/SplitPanel';
import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { DeckPanel } from 'lib-admin-ui/ui/panel/DeckPanel';
import { Body } from 'lib-admin-ui/dom/Body';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { LabelEl } from 'lib-admin-ui/dom/LabelEl';
import { Element } from 'lib-admin-ui/dom/Element';
import { Messages } from 'lib-admin-ui/util/Messages';
import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Dropdown } from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import { FormInputEl } from 'lib-admin-ui/dom/FormInputEl';
import { SelectionPanel } from './SelectionPanel';
import { PreviewPanel } from './PreviewPanel';


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

    private selectionPanel: SelectionPanel;
    private previewPanel: PreviewPanel;

    constructor() {
        const app: Application = this.createApplication();
        this.body = Body.get();
        this.createAppPanels(app);

        Messages.setMessages({
            'action.ok': 'ok',
        });
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

        this.previewPanel = new PreviewPanel();
        this.selectionPanel = new SelectionPanel(toolbar, 'selection-panel');

        // Attach the selection click to setup a new preview panel
        this.selectionPanel.onSelectionClick((event) => {
            const id = event.detail.id;
            this.previewPanel.createPreview(id);
        });
        const splitPanel = this.createSplitPanel(this.selectionPanel, this.previewPanel);

        const mainPanel = new DeckPanel('main-panel');
        const editPanel = new Panel('edit-panel');

        mainPanel.appendChildren(appBar, <Element>editPanel);
        editPanel.appendChildren(toolbar, <Element>splitPanel);
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
        panel.getEl().setTopPx(84);
        return panel;
    }

    createTopToolbar(): Toolbar {
        const toolbar = new Toolbar('tools');

        const fromWrapper = new DivEl('wrapper');
        const fromDatePicker = createDatePicker('select-from');
        fromDatePicker.onSelectedDateTimeChanged(() => {
            this.selectionPanel.createNewSelectionList();
        });
        const fromLabel: Element = new LabelEl('From', fromDatePicker.getTextInput());
        fromWrapper.appendChildren(
            fromLabel,
            fromDatePicker,
        );

        const toWrapper = new DivEl('wrapper');
        const toDatePicker = createDatePicker('select-to');
        toDatePicker.onSelectedDateTimeChanged(() => {
            this.selectionPanel.createNewSelectionList();
        });
        const toLabel: Element = new LabelEl('To', toDatePicker.getTextInput());
        toWrapper.appendChildren(
            toLabel,
            toDatePicker,
        );

        const userWrapepr = new DivEl('wrapper');
        const userDropdown = new Dropdown('User', { inputPlaceholderText: 'Select' });
        userDropdown.setId('select-user');
        userDropdown.onOptionSelected(() => {
            this.selectionPanel.createNewSelectionList();
        });
        const userLabel: Element = new LabelEl('User', <Element>userDropdown);
        setDropDownUsers(userDropdown);
        userWrapepr.appendChildren(
            userLabel,
            userDropdown,
        );

        const typeWrapper = new DivEl('wrapper');
        const typeDropdown = new Dropdown('type', { inputPlaceholderText: 'Select' });
        typeDropdown.setId('select-type');
        typeDropdown.onOptionSelected(() => {
            this.selectionPanel.createNewSelectionList();
        });
        const typeLabel: Element = new LabelEl('Type', <Element>typeDropdown);
        setDropdownTypes(typeDropdown);

        typeWrapper.appendChildren(
            typeLabel,
            typeDropdown,
        );

        const searchWrapper = new DivEl('wrapper');
        const searchInput = new FormInputEl('input', 'xp-admin-common-text-input form-input');
        searchInput.setId('fulltext');
        searchInput.onValueChanged(() => {
            this.selectionPanel.createNewSelectionList();
        });
        const searchLabel: Element = new LabelEl('Search', searchInput);
        searchWrapper.appendChildren(
            searchLabel,
            searchInput,
        );

        toolbar
            .appendChildren(
                fromWrapper,
                toWrapper,
                userWrapepr,
                typeWrapper,
                searchWrapper,
            );

        return toolbar;
    }
}


// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {

    let applicationView = new AuditLogView();

});
