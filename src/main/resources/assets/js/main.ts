import { Application } from 'lib-admin-ui/app/Application';
import { AppPanel } from 'lib-admin-ui/app/AppPanel';
import { AppBar } from 'lib-admin-ui/app/bar/AppBar';
import { SplitPanel, SplitPanelAlignment, SplitPanelBuilder, SplitPanelUnit } from 'lib-admin-ui/ui/panel/SplitPanel';
import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { DeckPanel } from 'lib-admin-ui/ui/panel/DeckPanel';
import { Body } from 'lib-admin-ui/dom/Body';
import { Element } from 'lib-admin-ui/dom/Element';
import { Messages } from 'lib-admin-ui/util/Messages';
import { SelectionPanel } from './SelectionPanel';
import { PreviewPanel } from './PreviewPanel';
import { getUrlParams } from './Urlparam';
import { SelectionToolbar } from './SelectionToolbar';


interface GlobalConfig {
    auditServiceUrl: string;
    allUsers: Array<string>;
    allTypes: Array<{
        key: number;
        docCount: string;
    }>;
    projects: Array<{
        id: string;
        name: string;
    }>;
    launcherUrl: string;
    services: object;
    appIconUrl: string;
    icon: string;
    licenseText: string;
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
            'dialog.notification.title': 'Filters',
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
        this.selectionPanel = new SelectionPanel('selection-panel');
        const toolbar = new SelectionToolbar(this.selectionPanel);
        toolbar.setup();
        this.selectionPanel.setup(toolbar);

        this.previewPanel = new PreviewPanel('preview-panel');

        // Attach the selection click to setup a new preview panel
        this.selectionPanel.onSelectionClick((event) => {
            const id = event.detail.id;
            this.previewPanel.setPreview(id);
        });
        const layoutPanel = this.createLayoutPanel(this.selectionPanel, this.previewPanel);

        const mainPanel = new DeckPanel('main-panel');
        const editPanel = new Panel('edit-panel');

        mainPanel.appendChildren(appBar, <Element>editPanel);
        editPanel.appendChildren(toolbar, <Element>layoutPanel);
        appPanel.appendChild(mainPanel);

        this.body.appendChild(appPanel);
    }

    createLayoutPanel(left: Panel, right: Panel): SplitPanel {
        const panel = new SplitPanelBuilder(left, right)
            .setAlignment(SplitPanelAlignment.VERTICAL)
            .setSecondPanelMinSize(30, SplitPanelUnit.PERCENT)
            .setFirstPanelMinSize(30, SplitPanelUnit.PERCENT)
            .setFirstPanelSize(38, SplitPanelUnit.PERCENT)
            .build();
        panel.getEl().setTopPx(84);
        return panel;
    }
}

// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {

    let applicationView = new AuditLogView();

});
