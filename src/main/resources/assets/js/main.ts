import {Application} from '@enonic/lib-admin-ui/app/Application';
import {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {AppBar} from '@enonic/lib-admin-ui/app/bar/AppBar';
import {DeckPanel} from '@enonic/lib-admin-ui/ui/panel/DeckPanel';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';
import {EditPanelBuilder} from './EditPanel';


interface GlobalConfig {
    auditServiceUrl: string;
    allUsers: {
        key: string;
        name: string;
    }[];
    allTypes: {
        key: number;
        docCount: string;
    }[];
    projects: {
        id: string;
        name: string;
    }[];
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

        // Attach the selection click to setup a new preview panel

        const editPanel = new EditPanelBuilder().build('edit-panel');
        const mainPanel = new DeckPanel('main-panel');


        mainPanel.appendChildren<Element>(appBar, editPanel);
        this.appPanel.appendChild(mainPanel);

        Body.get().appendChild(this.appPanel);
    }
}

// Main function called on page load
document.addEventListener('DOMContentLoaded', function () {

    const applicationView = new AuditLogView();

});
