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

    let dayGroupedEntries = [];
    let dayGroup = [];
    let logEntries = [];
    let lastUsedDate;

    //If more then 100 (query.size) happend on a day it will be incomplete
    result.hits.forEach(function (hit) {
        let logEntry = auditlog.get({
            id: hit.id,
        });
        let data = auditData.processData(logEntry);

        let getDate = data.timestamp.split("T")[0];

        if (lastUsedDate == undefined || lastUsedDate == getDate) {
            dayGroup.push(data);
        } else {
            dayGroupedEntries.push(dayGroup);
            dayGroup = [data]; //new array
        }
        lastUsedDate = getDate;

        logEntries.push(data);
    });

    //This last day is likely to be incomplete
    dayGroupedEntries.push(dayGroup);

    let assetsUrl = portal.assetUrl({
        path: ''
    });

    let model = {
        dayGroupedEntries, 
        jsonEntries: JSON.stringify(logEntries),
        assetsUrl, 
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
