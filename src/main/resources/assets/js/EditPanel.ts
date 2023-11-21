import { Element } from '@enonic/lib-admin-ui/dom/Element';
import { Panel } from '@enonic/lib-admin-ui/ui/panel/Panel';
import { SplitPanel, SplitPanelAlignment, SplitPanelBuilder } from '@enonic/lib-admin-ui/ui/panel/SplitPanel';
import { SplitPanelSize } from '@enonic/lib-admin-ui/ui/panel/SplitPanelSize';
import { ResponsiveManager } from '@enonic/lib-admin-ui/ui/responsive/ResponsiveManager';
import { EditToolbar } from './EditToolbar';
import { PreviewPanel } from './PreviewPanel';
import { SelectionPanel } from './SelectionPanel';

export class EditPanelBuilder {
    toolbar: EditToolbar;
    selectionPanel: SelectionPanel;
    previewPanel: PreviewPanel;
    splitPanel: SplitPanel;

    constructor() {
        this.selectionPanel = new SelectionPanel('selection-panel');
        this.toolbar = new EditToolbar();
        this.selectionPanel.setup(this.toolbar);

        this.previewPanel = new PreviewPanel('preview-panel');
        this.splitPanel = new SplitPanelBuilder(this.selectionPanel, this.previewPanel)
            .setAlignment(SplitPanelAlignment.VERTICAL)
            .setAlignmentTreshold(700)
            .setSecondPanelShouldSlideRight(true)
            .setSecondPanelMinSize(SplitPanelSize.PERCENTS(30))
            .setFirstPanelMinSize(SplitPanelSize.PERCENTS(30))
            .setFirstPanelSize(SplitPanelSize.PERCENTS(30))
            .build();

        // Force mobil to re-render
        this.toolbar.onRendered(() => {
            this.splitPanel.render(true);
        });

    }

    build(className?: string) {
        return new EditPanel(this, className);
    }
}

class EditPanel extends Panel {
    splitPanel: SplitPanel;
    selectionPanel: SelectionPanel;
    previewPanel: PreviewPanel;

    private mobileView: boolean = false;


    constructor(builder: EditPanelBuilder, className?: string) {
        super(className);
        this.splitPanel = builder.splitPanel;
        this.selectionPanel = builder.selectionPanel;
        this.previewPanel = builder.previewPanel;

        this.selectionPanel.onSelectionClick(this.onSelectedEvent.bind(this));

        ResponsiveManager.onAvailableSizeChanged(this.splitPanel, () => setTimeout(this.checkResponsiveSize.bind(this)));

        this.splitPanel.onShown(() => this.checkResponsiveSize());

        this.onOptionsChanged(() => {
            this.previewPanel.clear();
            this.selectionPanel.createNewSelectionList();
        });

        this.appendChildren(
            <Element>builder.toolbar,
            <Element>this.splitPanel,
        );
    }

    checkResponsiveSize() {
        const panel = this.splitPanel;
        const secondSize = panel.getActiveWidthPxOfSecondPanel();
        // This is a backwards way of getting the size...
        const firstSize = panel.getEl().getWidthWithBorder() - secondSize;

        if (secondSize + firstSize < 700 && this.mobileView === false) {
            panel.foldSecondPanel();
            panel.hideSplitter();

            this.render(true);

            this.selectionPanel.onSelectionClick(this.onSelectedEventMobile.bind(this));

            this.previewPanel.showBackButton = true;
            this.previewPanel.setBackButton(() => {
                if (panel.isSecondPanelHidden() === false) {
                    panel.foldSecondPanel();
                } else {
                    panel.showSecondPanel();
                }
            });
            this.selectionPanel.setSelectionListScroll(true);
            this.mobileView = true;
        } else if (firstSize >= 700 && panel.isSecondPanelHidden() && this.mobileView === true) {
            panel.showSecondPanel();
            this.previewPanel.showBackButton = false;

            this.render(true);

            this.selectionPanel.setSelectionListScroll(false);
            this.selectionPanel.unSelectionClick(this.onSelectedEventMobile.bind(this));

            if (panel.isFirstPanelHidden()) {
                panel.showFirstPanel();
            }
            this.mobileView = false;
        }
    }

    onOptionsChanged(listner: (event: Event) => void) {
        this.getEl().addEventListener('optionsChanged', listner);
    }

    onSelectedEvent(event: CustomEvent) {
        const id = event.detail.id;
        this.previewPanel.setPreview(id);
    }

    onSelectedEventMobile(event: CustomEvent) {
        this.splitPanel.showSecondPanel();
    }
}
