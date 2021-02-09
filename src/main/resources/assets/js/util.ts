/* Util methods */
// Create elements but with class and text content params
export function shortCreate(
    text: string,
    className: string | string[] = null,
    tag: string = 'div'
): HTMLElement {
    let elem = document.createElement(tag);

    if (Array.isArray(className)) {
        className.forEach((singleClass) => {
            elem.classList.add(singleClass);
        });
    } else if (className) {
        elem.classList.add(className);
    }
    if (text != null) {
        elem.textContent = text;
    }
    return elem;
}

/**
 * Shorthand function for sending ajax request
 *
 * @param {function} handler
 * @param {*} data
 * @returns {request} The xml request object
 */
export function sendXMLHttpRequest(
    handler: CallableFunction,
    data: any,
    error: any = errorCallback
): XMLHttpRequest {
    let request = new XMLHttpRequest();
    request.open('POST', CONFIG.auditServiceUrl);
    request.setRequestHeader('Content-type', 'application/json');

    request.responseType = 'json';
    request.onload = () => {
        handler(request);
    };
    request.onerror = error;
    request.send(data);

    return request;
}


function errorCallback(): void {
    console.error('XMLHttpRequest failed');
}

export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}
