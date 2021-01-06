/* Util methods */
// Create elements but with class and text content params
export function shortCreate(text, className = null, tag = "div") {
    let elem = document.createElement(tag);

    if (Array.isArray(className)) {
        className.forEach((singleClass) => {
            elem.classList.add(singleClass);
        });
    } else if (className) {
        elem.classList.add(className);
    }
    if (text != null) elem.textContent = text;
    return elem;
}

/**
 * Shorthand function for sending ajax request
 * @param {function} handler
 * @param {*} data
 * @returns {request} The xml request object
 */
export function sendXMLHttpRequest(handler, data, error = XMLHttpError) {
    let request = new XMLHttpRequest();
    request.open("POST", CONFIG.auditServiceUrl);
    request.setRequestHeader("Content-type", "application/json");

    request.responseType = "application/json";
    request.onload = () => {
        handler(request);
    };
    request.onerror = error;
    request.send(data);

    return request;
}

/**
 * XMLHttpError
 */
function XMLHttpError() {
    console.error("XMLHttpRequest failed");
}

export function formatDate(date) {
    new Date().getDate
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}