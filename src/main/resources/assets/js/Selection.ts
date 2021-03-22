/* eslint-disable no-underscore-dangle */
import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Element, NewElementBuilder } from 'lib-admin-ui/dom/Element';
import { H6El } from 'lib-admin-ui/dom/H6El';
import { ImgEl } from 'lib-admin-ui/dom/ImgEl';
import { KeyHelper } from 'lib-admin-ui/ui/KeyHelper';
import { SelectionList } from './SelectionList';
import { formatDate } from './util';

// Might need to move this to a datafile if more data structures are created.
// Full audit-log data node
export interface AuditlogNode {
    _id: string;
    type: string;
    user: string;
    time: string;
}

/**
 * Trying to write this class in the style of Lib-admin-ui
 *
 * @param {string} [classes] css class to add to the element
 * @param {string} [prefix]
 */
export class SelectionEl extends DivEl {
    id: string;

    constructor(node?: AuditlogNode) {
        super('selection');
        this.id = node._id;
        this.getEl().setTabIndex(0);

        const icon = new ImgEl(CONFIG.icon);
        const info = new DivEl('info');
        const info2 = new DivEl('info');
        this.appendChildren(
            icon,
            info,
            info2,
        );

        if (node == null || node === undefined) {
            this.addClass('tombstone');
        } else {
            const type = new H6El();
            type.getEl().setText(`${node.type}`);
            const time = new Element(new NewElementBuilder().setTagName('time'));
            time.getEl().setText(formatDate(new Date(node.time)));
            const user = new DivEl();
            user.getEl().setText(`${node.user}`);

            info.appendChildren(type, time);
            info2.appendChild(user);
        }

        this.onKeyDown(event => {
            if (KeyHelper.isEnterKey(event) || KeyHelper.isSpace(event)) {
                this.toggle();
            }
        });
        this.onClicked(() => {
            this.getHTMLElement().dispatchEvent(
                new CustomEvent('SelectionClick', { detail: { id: this.id }, bubbles: true, cancelable: true })
            );
            this.toggle();
        });
    }

    private toggle() {
        // Is there a way we force this on build time? constructor?
        (<SelectionList>this.getParentElement()).clearActive();
        this.toggleClass('active');
    }
}
