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
import { EditToolbar } from './EditToolbar';
import { ResponsiveManager } from 'lib-admin-ui/ui/responsive/ResponsiveManager';


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
    private splitPanel: SplitPanel;
    private editToolbar: EditToolbar;
    private mobileView: boolean = false;

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
        this.editToolbar = new EditToolbar(this.selectionPanel);
        this.selectionPanel.setup(this.editToolbar);

        this.previewPanel = new PreviewPanel('preview-panel');

        // Attach the selection click to setup a new preview panel
        this.selectionPanel.onSelectionClick(this.onSelectedEvent.bind(this));
        this.splitPanel = this.createLayoutPanel(this.selectionPanel, this.previewPanel);

        const mainPanel = new DeckPanel('main-panel');
        const editPanel = new Panel('edit-panel');

        mainPanel.appendChildren(appBar, <Element>editPanel);
        editPanel.appendChildren(this.editToolbar, <Element>this.splitPanel);
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

        panel.getEl()
            .setTopPx(84);

        ResponsiveManager.onAvailableSizeChanged(panel, () => setTimeout(this.checkResponsiveSize.bind(this)));

        panel.onShown(() => this.checkResponsiveSize());

        return panel;
    }

    onSelectedEvent(event: CustomEvent) {
        const id = event.detail.id;
        this.previewPanel.setPreview(id);
    }

    onSelectedEventMobile(event: CustomEvent) {
        this.splitPanel.showSecondPanel();
        this.splitPanel.hideFirstPanel();
        const id = event.detail.id;
        this.previewPanel.setPreview(id);
    }

    checkResponsiveSize() {
        const panel = this.splitPanel;
        const secondSize = panel.getActiveWidthPxOfSecondPanel();
        // This is a backwards way of getting the size...
        const firstSize = panel.getEl().getWidthWithBorder() - secondSize;

        if (secondSize + firstSize <= 700 && this.mobileView === false) {
            panel.hideSecondPanel();

            this.selectionPanel.unSelectionClick(this.onSelectedEvent.bind(this));
            this.selectionPanel.onSelectionClick(this.onSelectedEventMobile.bind(this));
            this.editToolbar.addToggleButton(() => {
                if (panel.isFirstPanelHidden()) {
                    panel.showFirstPanel();
                    panel.hideSecondPanel();
                } else {
                    panel.showSecondPanel();
                    panel.hideFirstPanel();
                }
            });
            this.mobileView = true;
        } else if (firstSize > 700 && panel.isSecondPanelHidden() && this.mobileView === true) {
            panel.showSecondPanel();
            this.editToolbar.removeToggleButton();

            this.selectionPanel.unSelectionClick(this.onSelectedEventMobile);
            this.selectionPanel.onSelectionClick(this.onSelectedEvent);

            if (panel.isFirstPanelHidden()) {
                panel.showFirstPanel();
            }
            this.mobileView = false;
        }
    }

}

// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {

    let applicationView = new AuditLogView();

});