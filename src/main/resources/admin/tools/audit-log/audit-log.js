const thymeleaf = require("/lib/thymeleaf");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
const adminLib = require('/lib/xp/admin');

const view = resolve("audit-log.html");

exports.get = function () {
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
        assetsUrl,
        serviceUrl,
        typeAutoComplete,
        launcherPath: adminLib.getLauncherPath(),
        launcherUrl: adminLib.getLauncherUrl(),
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

