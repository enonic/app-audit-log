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
        let enteries = auditData.getSelectionList({
            from: body.from,
            to: body.to,
        });

        return jsonResponse(enteries);
    }
};

function getEntryDetails(id) {
    let entry = auditData.getEntryData(id);
    return jsonResponse(entry);
}

function jsonResponse(data) {
    return {
        contentType: "application/json",
        body: JSON.stringify(data),
    };
}