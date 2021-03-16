import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { AuditlogNode, SelectionEl } from './SelectionEl';

export class SelectionListEl extends DivEl {
    constructor(classes?: string, prefix?: string) {
        super(classes, prefix);
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

    /**
     * Also appends to the child list
     *
     * @param {Array<AuditlogNode>} list
     */
    createList(list: Array<AuditlogNode>): void {
        list.forEach(data => {
            this.appendChild(new SelectionEl(data));
        });
    }
}
