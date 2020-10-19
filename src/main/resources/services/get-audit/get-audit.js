const portal = require("/lib/xp/portal");
const auditData = require("/lib/auditlog-data");

exports.post = function (req) {
    if (req.body == "") {
        return {
            status: 404,
        };
    }

    let body = JSON.parse(req.body);
    let options = body.options || {};

    if (options.from && options.from.match(/^\d-\d-\d$/i) == false ||
        options.to && options.to.match(/^\d*-\d*-\d*$/i) == false ||
        options.type && options.type.match(/[ AND ]/i)) {
        //This looks fishy
        return {
            status: 500,
        }
    } 

    if (body.entryId) {
        let entry = auditData.getEntry(body.entryId);

        return jsonResponse(entry);
    }
    else if (body.singelDate) {
        let entries = auditData.getSelectionsForDate({
            from: body.singelDate,
            singleDay: true,
            type: options.type || null,
            to: options.to || null,
        });

        return jsonResponse(entries);
    }
    else if (body.selectionGroup) {
        let selectionGroup = auditData.getSelectionGroups(options);

        // The aggregation structure is located in getSelectionGroups auditlog-data 
        return jsonResponse(selectionGroup);
    } 

    /* let options = {};
    if (body.from) options.from = body.from;
    if (body.to) options.to = body.to;

    let enteries = auditData.getEntries(options);

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
