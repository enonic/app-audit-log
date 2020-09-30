const thymeleaf = require("/lib/thymeleaf");
const auditlog = require("/lib/xp/auditlog");
const nodeLib = require("/lib/xp/node");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");

const view = resolve("audit-log.html");

exports.get = function () {
    let repoConnection = nodeLib.connect({
        repoId: "system.auditlog", // Please never connect to a system repo. Ever.
        branch: "master",
    });

    let result = repoConnection.query({
        start: 0,
        count: 100, // OPEN THE FLOOD GATE!
        /* query: `data.params.contentId = "${contentId}" OR 
            data.params.contentIds = "${contentId}" OR 
            data.result.id = "${contentId}" OR
            data.result.pendingContents = "${contentId}"`,  */
        sort: "time DESC",
        /* filters: {
            exists: {
                field: "data.params.modifier",
            },
        }, */
    });

    if (result.total == 0)  {
        return errorMessage("No audit log found");
    }

    let logEntries = [];
    result.hits.forEach(function (hit) {
        let logEntry = auditlog.get({
            id: hit.id,
        });

        let data = auditData.processData(logEntry);

        logEntries.push(data);
    });

    let cssUrl = portal.assetUrl({
        path: "/widget.css"
    });

    let jsUrl = portal.assetUrl({
        path: "/widget.js"
    });

    let model = {
        entries: logEntries,
        cssUrl,
        jsUrl,
    };

    return {
        body: thymeleaf.render(view, model),
    };
};

// Content studio built in error message
function errorMessage(message) {
    return {
        contentType: "text/html",
        body: `<widget class="error">${message}</widget>`,
    };
}
