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
    private app: Application;
    private appPanel: AppPanel<any>;
    private selectionPanel: SelectionPanel;
    private previewPanel: PreviewPanel;
    private splitPanel: SplitPanel;
    private editToolbar: EditToolbar;
    private mobileView: boolean = false;

    constructor() {
        this.app = this.createApplication();
        this.createAppPanels(this.app);

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
        this.appPanel = new AppPanel('app-container');
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
        this.appPanel.appendChild(mainPanel);

        Body.get().appendChild(this.appPanel);
    }

    createLayoutPanel(left: Panel, right: Panel): SplitPanel {
        const panel = new SplitPanelBuilder(left, right)
            .setAlignment(SplitPanelAlignment.VERTICAL)
            .setAlignmentTreshold(700)
            .setSecondPanelShouldSlideRight(true)
            .setSecondPanelMinSize(30, SplitPanelUnit.PERCENT)
            .setFirstPanelMinSize(30, SplitPanelUnit.PERCENT)
            .setFirstPanelSize(38, SplitPanelUnit.PERCENT)
            .build();

        ResponsiveManager.onAvailableSizeChanged(panel, () => setTimeout(this.checkResponsiveSize.bind(this)));

        panel.onShown(() => this.checkResponsiveSize());

        // Force mobil to re-render
        this.editToolbar.onRendered(() => {
            panel.render(true);
        });

        return panel;
    }

    onSelectedEvent(event: CustomEvent) {
        const id = event.detail.id;
        this.previewPanel.setPreview(id);
    }

    onSelectedEventMobile(event: CustomEvent) {
        this.splitPanel.showSecondPanel();
    }

    checkResponsiveSize() {
        const panel = this.splitPanel;
        const secondSize = panel.getActiveWidthPxOfSecondPanel();
        // This is a backwards way of getting the size...
        const firstSize = panel.getEl().getWidthWithBorder() - secondSize;

        if (secondSize + firstSize < 700 && this.mobileView === false) {
            panel.foldSecondPanel();
            panel.hideSplitter();

            this.appPanel.render(true);

            // this.selectionPanel.unSelectionClick(this.onSelectedEvent.bind(this));
            this.selectionPanel.onSelectionClick(this.onSelectedEventMobile.bind(this));

            this.previewPanel.showBackButton = true;
            this.previewPanel.setBackButton(() => {
                if (panel.isSecondPanelHidden() === false) {
                    panel.foldSecondPanel();
                } else {
                    panel.showSecondPanel();
                }
            });
            this.mobileView = true;
        } else if (firstSize >= 700 && panel.isSecondPanelHidden() && this.mobileView === true) {
            panel.showSecondPanel();
            this.previewPanel.showBackButton = false;

            this.appPanel.render(true);

            this.selectionPanel.unSelectionClick(this.onSelectedEventMobile.bind(this));
            // this.selectionPanel.onSelectionClick(this.onSelectedEvent.bind(this));

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
