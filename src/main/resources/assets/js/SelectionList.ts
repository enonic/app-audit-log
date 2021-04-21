import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Exception } from 'lib-admin-ui/Exception';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { AuditlogNode, SelectionEl } from './SelectionEl';
// import { SelectionPanel } from './SelectionPanel';

interface SelectionListData {
    total: number;
    selections: Array<AuditlogNode>;
}

export interface FetchOptions {
    start?: number;
    count?: number;
    from?: string;
    to?: string;
    project?: string;
    type?: string;
    user?: string;
    fullText?: string;
    sort?: string;
}

export class SelectionList extends DivEl {
    private toolbar: Toolbar;
    private elementsCount: number = 0;
    private elementsStart: number = 0;
    private total: number = 0;

    public scrollIntoView: Boolean = false;

    constructor(toolbar: Toolbar, classes?: string, prefix?: string) {
        super(classes, prefix);
        this.toolbar = toolbar;

        this.onSelectionClick();
    }

    /**
     * Removes all children from the list
     */
    clearAll() {
        this.removeChildren();
        this.elementsCount = 0;
        this.elementsStart = 0;
        this.total = 0;
    }

    public clearActive() {
        this.getChildren().forEach(element => {
            if (element.hasClass('active')) {
                element.removeClass('active');
            }
        });
    }

    private async fetchSelectionData(success: CallableFunction, options?: FetchOptions | null) {
        const data = {
            selection: true,
            options,
        };


        return await fetch(CONFIG.auditServiceUrl, {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(data),
        })
            .then((res: Response) => res.json())
            .then(jsonData => {
                success(jsonData);
            })
            .catch(error => {
                throw new Exception(`SelectionList fetch error:\n ${error}`);
            });
    }

    createSelectionList(data: SelectionListData) {
        this.toolbar.getEl().setText(`Total: ${data.total}`);

        this.total = data.total;
        data.selections.forEach(element => {
            this.appendChild(new SelectionEl(element));
        });
    }

    private onSelectionClick() {
        this.getHTMLElement().addEventListener('SelectionClick', event => {
            if (this.scrollIntoView) {
                (<HTMLElement>event.target).scrollIntoView(true);
            }
        });
    }

    /**
     * Tries to fetch new selections from the service url
     *
     * @param {Boolean} clear Clean the selection list
     * @param {Number} amount The amount of selections
     * @param {FetchOptions} options options to add to the fetch body
     * @returns {Promise | null} returns the promise if sucess or null on failure
     */
    async loadMoreSelections(clear?: boolean, amount: number = 50, options: FetchOptions = {}) {
        if (clear) {
            this.clearAll();
        }
        const context = this;
        this.elementsCount += amount;
        const passDown: FetchOptions = {
            start: this.elementsStart,
            count: amount,
            ...options,
        };
        if (this.total === 0 || this.elementsCount <= this.total) {
            return await this.fetchSelectionData(function (data: SelectionListData) {
                context.createSelectionList(data);
            }, passDown);
        }
        return null;
    }
}
