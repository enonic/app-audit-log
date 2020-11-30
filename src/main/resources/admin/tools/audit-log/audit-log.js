const thymeleaf = require("/lib/thymeleaf");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
const adminLib = require('/lib/xp/admin');

const view = resolve("audit-log.html");

exports.get = function () {
    let types = JSON.stringify(auditData.getAllTypes());
    let users = JSON.stringify(auditData.getAllUsers());

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
        allUsers: users,
        allTypes: types,
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

