const portal = require("/lib/xp/portal");
const auditData = require("/lib/auditlog-data");

exports.post = function (req) {
    if (req.body == "") {
        return {
            status: 404
        };
    }
    
    let body = JSON.parse(req.body);

    let entry = auditData.getEntryData(body.logId);

    return {
        contentType: "application/json",
        body: JSON.stringify(entry)
    }
};
