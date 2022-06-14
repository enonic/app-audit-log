import { DivEl } from '@enonic/lib-admin-ui/dom/DivEl';
import { SpanEl } from '@enonic/lib-admin-ui/dom/SpanEl';
import { Action } from '@enonic/lib-admin-ui/ui/Action';
import { ActionButton } from '@enonic/lib-admin-ui/ui/button/ActionButton';

export class FilterActionButton extends ActionButton {
    private info: Map<string, string>;
    private static filterDefaultText: string = '<click here to apply filters>';

    constructor() {
        super(new Action(FilterActionButton.filterDefaultText));
        this.info = new Map();
    }

    addInfo(key: string, value: string, render: boolean = true) {
        this.info.set(key, value);
        if (render) {
            this.renderInfoText();
        }
    }

    removeInfo(key: string, render: boolean = true) {
        this.info.delete(key);
        if (render) {
            this.renderInfoText();
        }
    }

    renderInfoText() {
        this.removeChildren();
        if (this.info.size > 0) {
            const iter = this.info.entries();
            let next = iter.next();
            while (next.done !== true) {
                let text = next.value[0];
                text += `: ${next.value[1]}`;
                const span = new DivEl('filter-label');
                span.getEl().setText(text);
                this.appendChild(span);

                next = iter.next();
            }
        } else {
            const span = new DivEl();
            this.appendChild(span);
            span.getEl().setText(FilterActionButton.filterDefaultText);
        }
    }
}
