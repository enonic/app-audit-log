import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { AuditlogNode, SelectionEl } from './Selection';
import { SelectionPanel } from './SelectionPanel';

interface SelectionListData {
    total: number;
    selections: Array<AuditlogNode>;
}

interface FetchOptions {
    start: number;
    count: number;
    from?: string;
    to?: string;
    type?: string;
    user?: string;
    fullText?: string;
    sort?: string;
}

export class SelectionList extends DivEl {
    private toolbar: Toolbar;
    private elementsCount: number = 0;
    private elementsStart: number = 0;
    private total: number = 500;

    constructor(toolbar: Toolbar, classes?: string, prefix?: string) {
        super(classes, prefix);
        this.toolbar = toolbar;
    }

    /**
     * Removes all children from the list
     */
    clearAll() {
        this.removeChildren();
    }

    public clearActive() {
        this.getChildren().forEach(element => {
            if (element.hasClass('active')) {
                element.removeClass('active');
            }
        });
    }

    private fetchSelectionData(success: CallableFunction, options?: FetchOptions | null) {
        const data = {
            selection: true,
            options,
        };


        return fetch(CONFIG.auditServiceUrl, {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(data),
        })
            .then(function (res: Response) {
                return res.json();
            })
            .then(jsonData => {
                success(jsonData);
            })
            .catch(error => {
                console.log(error);
            });
    }

    createSelectionList(data: SelectionListData, clear: boolean = false) {
        if (clear) {
            this.clearAll();
            // this.total = data.total;
            this.toolbar.getEl().setText(`Total: ${data.total}`);
        }
        data.selections.forEach(element => {
            this.appendChild(new SelectionEl(element));
        });
    }

    loadMoreSelections(clear?: boolean, amount: number = 50) {
        let context = this;
        this.elementsCount += amount;
        if (this.elementsCount >= this.total) {
            return this.fetchSelectionData(function (data: SelectionListData) {
                context.createSelectionList(data, clear);
            }, {
                start: this.elementsStart,
                count: this.elementsCount,
            });
        }
    }
}
