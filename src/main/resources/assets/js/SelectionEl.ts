import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Element, NewElementBuilder } from 'lib-admin-ui/dom/Element';
import { H6El } from 'lib-admin-ui/dom/H6El';
import { ImgEl } from 'lib-admin-ui/dom/ImgEl';
import { sendXMLHttpRequest, formatDate } from './util';

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
    constructor(node?: AuditlogNode) {
        super('entry');

        const icon = new ImgEl(CONFIG.icon);
        const leftSide = new DivEl('left');
        const rightSide = new DivEl('right');
        this.appendChildren(
            icon,
            leftSide,
            rightSide,
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

            leftSide.appendChildren(type, time, user);
        }

        this.addEvents();
    }

    private addEvents() {
        this.onKeyDown(event => {
            if (event.key === 'Enter' || event.key === 'Space') {
                this.handleSelect(event);
            }
        });

        this.onClicked(this.handleSelect);
    }

    private handleSelect(event: Event) {
        //TODO
    }
}

/* function createSelectionElement(data: any = null) {
    let selectItem = document.createElement('li');

    let entryClasses = ['entry'];
    if (data == null || data === undefined) {
        entryClasses.push('tombstone');
    }
    const button = shortCreate('', entryClasses, 'div');
    selectItem.appendChild(button);

    let icon = document.createElement('img');
    icon.src = CONFIG.icon;
    let leftD = document.createElement('div');
    let rightD = document.createElement('div');

    button.appendChild(icon);
    button.appendChild(leftD);
    button.appendChild(rightD);

    if (data) {
        const time = formatDate(new Date(data.time));
        leftD.appendChild(shortCreate(`${data.type}`, 'h6'));
        leftD.appendChild(shortCreate(`${time}`, '', 'time'));
        rightD.appendChild(shortCreate(`${data.user}`, 'user', 'div'));
        // eslint-disable-next-line no-underscore-dangle
        button.dataset.a = data._id;
    } else {
        leftD.appendChild(document.createElement('h6'));
        leftD.appendChild(document.createElement('time'));
        rightD.appendChild(shortCreate(null, 'user', 'div'));
    }

    return selectItem;
} */
