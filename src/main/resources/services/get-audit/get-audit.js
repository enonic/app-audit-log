const portal = require("/lib/xp/portal");
const auditData = require("/lib/auditlog-data");

exports.post = function (req) {
    if (req.body == "") {
        return {
            status: 404,
        };
    }

    let body = JSON.parse(req.body);

    if (body.entryId) {
        return getEntryDetails(body.logId);
    }
    if (body.from || body.to) {
        let options = {};
        if (body.from) options.from = body.from;
        if (body.to) options.to = body.to;
        if (body.displayData) options.displayData = true;

        let enteries = auditData.getEntries(options);

        return jsonResponse(enteries);
    }
};

function getEntryDetails(id) {
    let entry = auditData.getEntry(id);
    return jsonResponse(entry);
}

function jsonResponse(data) {
    return {
        contentType: "application/json",
        body: JSON.stringify(data),
    };
}
