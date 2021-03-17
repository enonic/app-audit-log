import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { Mask } from 'lib-admin-ui/ui/mask/Mask';
import { SelectionList } from './SelectionList';
import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { Element } from 'lib-admin-ui/dom/Element';
import { Body } from 'lib-admin-ui/dom/Body';

export class SelectionPanel extends Panel {

    private mask: Mask;
    private selectionList: SelectionList;
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

        this.toolbar = new Toolbar('select-toolbar');

        let listPanel = this.createListPanel();
        this.appendChildren(
            <Element>this.toolbar,
            listPanel,
        );

        let list = new SelectionList(this.toolbar);
        this.selectionList = list;

        listPanel.appendChild(list);
        let loadPromise = list.loadMoreSelections(true, 100);
        loadPromise.then(() => {
            this.hideMask();
        });

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

    private createListPanel() {
        const panel = new Panel('selection-panel');

        let panelHtml = panel.getHTMLElement();

        // Add scroll listner event and fetch more items for the selection list
        panel.onScroll(() => {
            let maxScroll = panelHtml.scrollHeight - panelHtml.clientHeight;
            let scroll = panelHtml.scrollTop;
            let tenner = (maxScroll/100) * 10;
            if (scroll >= tenner) {
                this.selectionList.loadMoreSelections(false, 50);
            }
        });

        return panel;
    }

    showMask() {
        // this.mask.show();
        this.mask.getHTMLElement().style.display = 'block';
    }

    hideMask() {
        // this.mask.hide();
        this.mask.getHTMLElement().style.display = 'none';
    }
}
