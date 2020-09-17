const thymeleaf = require("/lib/thymeleaf");
const auditlog = require("/lib/xp/auditlog");
const nodeLib = require("/lib/xp/node");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");

const view = resolve("change-viewer.html");

exports.get = function (req) {
    if (req.params == undefined || req.params.contentId == undefined) {
        return errorMessage("No content selected");
    }

    let contentId = req.params.contentId;

    let repoConnection = nodeLib.connect({
        repoId: "system.auditlog", // Please never connect to a system repo. Ever.
        branch: "master",
    });

    let result = repoConnection.query({
        start: 0,
        count: 50,
        query: `data.params.contentId = "${contentId}" OR 
            data.params.contentIds = "${contentId}"`,
        sort: "time ASC",
        /* filters: {
            exists: {
                field: "data.params.modifier",
            },
        }, */
        sort: "time DESC",
    });

    let logEntries = [];
    result.hits.forEach(function (hit) {
        let logEntry = auditlog.get({
            id: hit.id,
        });

        let data = auditData.processData(logEntry);

        logEntries.push(data);
    });

    let cssUrl = portal.assetUrl({
        path: "/change-viewer.css"
    });

    let model = {
        entries: logEntries,
        cssUrl
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
