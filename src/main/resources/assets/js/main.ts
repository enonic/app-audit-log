import { Application } from 'lib-admin-ui/app/Application';
import { AppPanel } from 'lib-admin-ui/app/AppPanel';
import { AppBar } from 'lib-admin-ui/app/bar/AppBar';
import { DeckPanel } from 'lib-admin-ui/ui/panel/DeckPanel';
import { Body } from 'lib-admin-ui/dom/Body';
import { Element } from 'lib-admin-ui/dom/Element';
import { Messages } from 'lib-admin-ui/util/Messages';
import { EditPanelBuilder } from './EditPanel';


interface GlobalConfig {
    auditServiceUrl: string;
    allUsers: Array<{
        key: string;
        name: string;
    }>;
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
    private appPanel: AppPanel;

    constructor() {
        this.app = this.createApplication();
        this.createAppPanels(this.app);

        /* eslint-disable */
        Messages.setMessages({
            'action.ok': 'ok',
            'dialog.notification.title': 'Filters',
        });
        /* eslint-enable */
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

        // Attach the selection click to setup a new preview panel

        const editPanel = new EditPanelBuilder().build('edit-panel');
        const mainPanel = new DeckPanel('main-panel');


        mainPanel.appendChildren(appBar, <Element>editPanel);
        this.appPanel.appendChild(mainPanel);

        Body.get().appendChild(this.appPanel);
    }
}

// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {

    const applicationView = new AuditLogView();

});
