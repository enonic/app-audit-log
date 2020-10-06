const thymeleaf = require("/lib/thymeleaf");
const auditlog = require("/lib/xp/auditlog");
const nodeLib = require("/lib/xp/node");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
// const moment = require("/lib/moment.min.js");

const view = resolve("audit-log.html");

exports.get = function () {
    let repoConnection = nodeLib.connect({
        repoId: "system.auditlog", // Please never connect to a system repo. Ever.
        branch: "master",
    });


    let result = repoConnection.query({
        start: 0,
        count: 1000, // OPEN THE FLOOD GATE! Don't do this unless you know what you are doing.
        query: '',
        sort: "time DESC",
        /*aggregation: {
            by_day: {
                dateHistogram: {
                    field: "time",
                    interval: "1d",
                    minDocCount: 1,
                    format: "YYYY-MM-DD"
                }
            }
        }*/
    }); 

    /* let result = auditlog.find({
        start: 0,
        count: 1000, 
    }); */

    if (result.total == 0) {
        return errorMessage("No audit log found");
    }

    let dayGroupedEntries = [];
    let dayGroup = [];
    let lastUsedDate;

    //If more then 100 (query.size) happend on a day it will be incomplete
    result.hits.forEach(function (hit) {
        let data = auditData.getDisplayData(hit.id);

        let getDate = data.timestamp.split("T")[0];

        if (lastUsedDate == undefined || lastUsedDate == getDate) {
            dayGroup.push(data);
        } else {
            dayGroupedEntries.push(dayGroup);
            dayGroup = [data]; //new array
        }
        lastUsedDate = getDate;

    });

    //This last day is likely to be incomplete
    dayGroupedEntries.push(dayGroup);

    let serviceUrl = portal.serviceUrl({
        service: "get-audit",
        type: "absolute",
    })

    let assetsUrl = portal.assetUrl({
        path: "",
    });

    let model = {
        dayGroupedEntries,
        assetsUrl,
        serviceUrl,
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
