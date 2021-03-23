const auditData = require('/lib/auditlog-data');

exports.post = function (req) {
    if (req.body === '') {
        return {
            status: 404,
        };
    }

    let body = JSON.parse(req.body);
    let options = body.options || {};

    if (body.id) {
        let entry = auditData.getEntry(body.id);

        return jsonResponse(entry);
    } else if (body.selection) {
        let selection = auditData.getSelection(options);

        // The aggregation structure is located in getSelectionGroups auditlog-data
        return jsonResponse(selection);
    }

    /* let enteries = auditData.getEntries(options);
    return jsonResponse(enteries); */

    return {
        status: 404,
    };
};

function jsonResponse(data) {
    return {
        contentType: "application/json",
        body: JSON.stringify(data),
    };
}
