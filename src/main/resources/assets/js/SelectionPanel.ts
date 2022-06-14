import { Panel } from '@enonic/lib-admin-ui/ui/panel/Panel';
import { Mask } from '@enonic/lib-admin-ui/ui/mask/Mask';
import { SelectionList, FetchOptions } from './SelectionList';
import { DivEl } from '@enonic/lib-admin-ui/dom/DivEl';
import { Toolbar } from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';
import { Element } from '@enonic/lib-admin-ui/dom/Element';
import { Body } from '@enonic/lib-admin-ui/dom/Body';
import { SpanEl } from '@enonic/lib-admin-ui/dom/SpanEl';
import { EditToolbar } from './EditToolbar';

export class SelectionPanel extends Panel {

    private mask: Mask;
    private selectionList: SelectionList;
    private optionsToolbar: EditToolbar;
    private toolbar: Toolbar;
    private loading: boolean = false;

    constructor(className?: string) {
        super(className);
    }

    public setup(topToolbar: EditToolbar) {
        this.optionsToolbar = topToolbar;
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
                this.setupEmptySelectionList();
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

    private setupEmptySelectionList() {
        const placeholder = new DivEl('selection-placeholder');
        placeholder.appendChild(SpanEl.fromText('No logs found. Try changing the filters'));
        if (this.selectionList.getLastChild() === undefined) {
            this.selectionList.appendChild(placeholder);
        }
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
        const panel = new Panel('inner-selection-panel');

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
     * Get all the FetchOptions form the toolbar to create a new selection list
     */
    getOptions(): FetchOptions {
        let optTool = this.optionsToolbar;
        const from = optTool.filters.from.getTextInput().getValue();
        const to = optTool.filters.to.getTextInput().getValue();
        const project = optTool.filters.project.getValue();
        const user = optTool.filters.user.getValue();
        const type = optTool.filters.type.getValue();
        const fullText = optTool.filters.fulltext.getValue();

        const options: FetchOptions = {};
        if (notEmtpy(from)) {
            options.from = from;
        }
        if (notEmtpy(to)) {
            options.to = to;
        }
        if (notEmtpy(project)) {
            options.project = project;
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

    public unSelectionClick(listener: (event: CustomEvent) => void) {
        this.getEl().removeEventListener('click', listener);
    }

    public createNewSelectionList() {
        this.showMask();
        this.loading = true;

        this.selectionList
            .loadMoreSelections(true, 50, this.getOptions())
            .then(() => {
                this.hideMask();
                this.loading = false;
                this.setupEmptySelectionList();
            });
    }

    setSelectionListScroll(scroll: boolean) {
        this.selectionList.scrollIntoView = scroll;
    }

    showMask() {
        this.mask.getHTMLElement().style.display = 'block';
    }

    hideMask() {
        this.mask.getHTMLElement().style.display = 'none';
    }
}
