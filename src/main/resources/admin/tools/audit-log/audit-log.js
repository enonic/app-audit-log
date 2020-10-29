const thymeleaf = require("/lib/thymeleaf");
const auditlog = require("/lib/xp/auditlog");
const nodeLib = require("/lib/xp/node");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
// const moment = require("/lib/moment.min.js");

const view = resolve("audit-log.html");

exports.get = function () {
    let selection = auditData.getSelection();
    let types = auditData.getAllTypes();

    let typeAutoComplete = JSON.stringify(types);

    let serviceUrl = portal.serviceUrl({
        service: "get-audit",
        type: "absolute",
    });

    let assetsUrl = portal.assetUrl({
        path: "",
    });

    let model = {
        selection,
        assetsUrl,
        serviceUrl,
        typeAutoComplete,
    };

    return {
        body: thymeleaf.render(view, model),
    };
};

// Content studio built in error message
function errorMessage(message) {
    return {
        contentType: "text/html",
        body: `<div class="error">${message}</div>`,
    };
}
