/* import { shortCreate, sendXMLHttpRequest, formatDate } from './util';

interface Entry {
    type: string;
    time: Date;
    props: any;
    data: any;
} */

/**
 * Request and show an log entry in the preview panel
 *
 * @param {String} id
 */
/* export function getEntry(id: string) {
    let data = JSON.stringify({
        entryId: id,
    });
    let request = sendXMLHttpRequest(handleResponse, data);

    //Service retrieving a audit log entry
    function handleResponse(): void {
        let response = request.response;
        if (request.status === 200 && response) {
            let entry = response;
            let placeholder = document.querySelector('#preview .placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            let show = document.querySelector('#preview .show-wrapper');
            while (show.childNodes.length > 0) {
                show.firstChild.remove();
            }
            show.appendChild(createEntry(entry));
        } else {
            console.error(request);
        }
    }
} */

//Does all the dom manipulation to show a single log entry
/**
 * Creates a log entry in the preview panel
 *
 * @param entry The entry to preview
 * @returns {HTMLElement} The finished preview tab element
 */
/* function createEntry(entry: Entry): HTMLElement {
    let showEntry = document.createElement('div');
    showEntry.id = 'entry-show';
    showEntry.classList.add('item-statistics-panel');
    let header = shortCreate(null, 'header');
    header.id = 'previewHeader';

    // header
    let icon = document.createElement('img');
    icon.src = CONFIG.icon;
    let title = shortCreate(`${entry.type}`, 'title', 'h1');
    const time = formatDate(new Date(entry.time));
    let timestamp = shortCreate(`${time}`, 'path', 'h4');
    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(timestamp);
    showEntry.appendChild(header);

    let propPanel = shortCreate(null, 'properties-panel');
    showEntry.appendChild(propPanel);

    // top property list
    let itemGroup = shortCreate(null, 'item-data-group');
    propPanel.appendChild(itemGroup);

    for (const prop in entry) {
        if (prop !== 'data' && prop !== 'type' && prop !== 'time') {
            let propList = shortCreate(null, 'data-list', 'ul');
            itemGroup.appendChild(propList);
            let listheader = shortCreate(`${prop}`, 'list-header', 'li');
            propList.appendChild(listheader);
            let valueEl = shortCreate(null, null, 'li');

            if (Array.isArray(entry[prop])) {
                createListStructure(entry[prop], propList, 'li');
            } else {
                valueEl.textContent = `${entry[prop]}`;
                propList.appendChild(valueEl);
            }
        }
    }

    // Data section
    let dataBlock = shortCreate(null, 'item-data-group');
    propPanel.appendChild(dataBlock);

    let dataHeader = shortCreate('Data', '', 'h2');
    dataBlock.appendChild(dataHeader);

    let data = entry.data;

    createObjectStructure(data, dataBlock);

    return showEntry;
} */

// Recusive function that handles all data structures
// function createObjectStructure(data: any, parent: HTMLElement) {
//     // eslint-disable-next-line guard-for-in
//     for (const prop in data) {
//         let propList = shortCreate(null, 'data-list', 'ul');

//         if (typeof data[prop] == 'object') {

//             let header = shortCreate(`${prop}`, 'list-header', 'li');
//             parent.appendChild(header);

//             if (Array.isArray(data[prop])) {
//                 createListStructure(data[prop], propList, 'li');
//             } else {
//                 propList.classList.add('align-top');
//                 propList.classList.add('nested');
//                 let item = shortCreate(null, null, 'li');
//                 propList.appendChild(item);
//                 createObjectStructure(data[prop], item);
//             }
//         } else {
//             propList.appendChild(shortCreate(`${prop}`, 'list-header', 'li'));
//             propList.appendChild(shortCreate(`${data[prop]}`, '', 'li'));
//         }
//         parent.appendChild(propList);
//     }
// }

// Creates a list out of an array value
// function createListStructure(list: string[], parent: HTMLElement, tag: string) {
//     list.forEach(function (item: string) {
//         parent.appendChild(shortCreate(`${item}`, null, tag));
//     });
// }
