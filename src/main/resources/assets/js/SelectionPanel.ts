import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { Mask } from 'lib-admin-ui/ui/mask/Mask';
import { SelectionListEl } from './SelectionListEl';
import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { Element } from 'lib-admin-ui/dom/Element';
import { Body } from 'lib-admin-ui/dom/Body';
import { AuditlogNode } from './SelectionEl';

interface SelectionListData {
    total: number;
    selectionList: Array<AuditlogNode>;
}

export class SelectionPanel extends Panel {

    private mask: Mask;
    private selectionList: SelectionListEl;
    private toolbar: Toolbar;

    constructor(className?: string) {
        super(className);
        this.createPanel();
        this.showMask();
    }

    private createPanel() {
        this.mask = new Mask(this);
        // Fake load mask
        this.mask.addClass('load-mask');
        const splash = new DivEl('mask-splash');
        const spinner = new DivEl('spinner');

        splash.appendChild(spinner);
        this.mask.appendChild(splash);

        const selectionPanel = new Panel('selection');
        this.toolbar = new Toolbar('select-toolbar');

        this.appendChildren(
            <Element>this.toolbar,
            selectionPanel,
        );

        this.selectionList = new SelectionListEl();
        this.createSelectionListFromData();

        selectionPanel.appendChild(this.selectionList);

        const selectPanelEl = $(this.getHTMLElement());

        // Could not find a good way position the mask
        // Please change if there is a better way
        const maskDimensions: { width: string; height: string } = {
            width: selectPanelEl.outerWidth() + 'px',
            height: selectPanelEl.outerHeight() + 'px',
        };

        let maskOffset: { top: number; left: number } = selectPanelEl.position();

        this.mask.getEl()
            .setTopPx(maskOffset.top)
            .setLeftPx(maskOffset.left)
            .setWidth(maskDimensions.width)
            .setHeight(maskDimensions.height);

        splash.getHTMLElement().style.display = 'block';

        // Sett all the correct sizing of the mask. Bug? should be auto.
        this.positionMask();

        Body.get().getHTMLElement().appendChild(this.mask.getHTMLElement());
    }

    private positionMask() {
        const selectPanelEl = $(this.getHTMLElement());

        // Could not find a good way position the mask
        // Please change if there is a better way
        const maskDimensions: { width: string; height: string } = {
            width: selectPanelEl.outerWidth() + 'px',
            height: selectPanelEl.outerHeight() + 'px',
        };

        let maskOffset: { top: number; left: number } = selectPanelEl.position();

        this.mask.getEl()
            .setTopPx(maskOffset.top)
            .setLeftPx(maskOffset.left)
            .setWidth(maskDimensions.width)
            .setHeight(maskDimensions.height);

    }

    showMask() {
        // this.mask.show();
        this.mask.getHTMLElement().style.display = 'block';
    }

    hideMask() {
        // this.mask.hide();
        this.mask.getHTMLElement().style.display = 'none';
    }

    private createSelectionList(data: SelectionListData, clear: boolean = false) {
        console.log(data);
        // Nodes might be json string
        if (clear) {
            this.selectionList.clearAll();
            this.toolbar.getEl().setText(`Total: ${data.total}`);
        }
        this.selectionList.createList(data.selectionList);
    }

    //TODO map options to the correct structure
    // Move this to selectionListEl?
    private createSelectionListFromData(options?: [any | null]) {
        const data = {
            selection: true,
            options,
        };

        const context = this;
        fetch(CONFIG.auditServiceUrl, {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(data),
        })
            .then(function(res: Response) {
                context.createSelectionList(<any>res.json(), true);
                context.hideMask();
                return;
            })
            .catch(error => {
                console.log(error);
            });
    }

}
