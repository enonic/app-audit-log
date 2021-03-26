import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { Mask } from 'lib-admin-ui/ui/mask/Mask';
import { SelectionList, FetchOptions } from './SelectionList';
import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { Element } from 'lib-admin-ui/dom/Element';
import { Body } from 'lib-admin-ui/dom/Body';
import { Dropdown } from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import { FormInputEl } from 'lib-admin-ui/dom/FormInputEl';
import { DatePicker } from 'lib-admin-ui/ui/time/DatePicker';

export class SelectionPanel extends Panel {

    private mask: Mask;
    private selectionList: SelectionList;
    private optionsToolbar: Toolbar;
    private toolbar: Toolbar;
    private loading: boolean = false;

    constructor(optionsToolbar: Toolbar, className?: string) {
        super(className);
        this.optionsToolbar = optionsToolbar;
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

        this.selectionList = new SelectionList(this.toolbar);

        listPanel.appendChild(this.selectionList);
        // Can return null, should never return null
        this.selectionList.loadMoreSelections(true, 100, this.getOptions())
            .then(() => {
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
            if (this.loading === false) {
                let maxScroll = panelHtml.scrollHeight - panelHtml.clientHeight;
                let scroll = panelHtml.scrollTop;
                let tenner = (maxScroll / 100) * 10;
                if (scroll >= maxScroll - tenner) {
                    this.loading = true;
                    this.mask.show();
                    this.selectionList
                        .loadMoreSelections(false, 50, this.getOptions())
                        .then(() => {
                            this.mask.hide();
                            this.loading = false;
                        });
                }
            }
        });

        return panel;
    }

    /**
     * Get all the FetchOptions form the toolbar to create a new seletion list
     */
    getOptions(): FetchOptions {
        let optTool = this.optionsToolbar;
        const from = (<DatePicker>optTool.findChildById('select-from', true))
            .getTextInput().getValue();
        const to = (<DatePicker>optTool.findChildById('select-to', true))
            .getTextInput().getValue();
        const user = (<Dropdown<string>>optTool.findChildById('select-user', true)).getValue();
        const type = (<Dropdown<String>>optTool.findChildById('select-type', true)).getValue();
        const fullText = (<FormInputEl>optTool.findChildById('fulltext', true)).getValue();

        const options: FetchOptions = {};
        if (notEmtpy(from)) {
            options.from = from;
        }
        if (notEmtpy(to)) {
            options.to = to;
        }
        if (notEmtpy(user)) {
            options.user = user;
        }
        if (notEmtpy(type)) {
            options.type = type;
        }
        if (notEmtpy(fullText)) {
            options.fullText = fullText;
        }

        return options;

        function notEmtpy(opt: string) {
            if (opt && opt !== '') {
                return true;
            }
            return false;
        }
    }

    public onSelectionClick(handle: (event: CustomEvent) => void) {
        this.getEl().addEventListener('SelectionClick', handle);
    }

    public createNewSelectionList() {
        this.showMask();
        this.loading = true;

        this.selectionList
            .loadMoreSelections(true, 50, this.getOptions())
            .then(() => {
                this.hideMask();
                this.loading = false;
            });
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
