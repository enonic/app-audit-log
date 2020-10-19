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
    let from = options.from;
    let to = options.to;
    let type = options.type;

    let andReg = /\DAND\D/i;
    let dateReg = /\d*-\d*-\d*/i;

    if (
        (from && dateReg.test(from) == false) ||
        (to && dateReg.test(to) == false) ||
        (type && andReg.test(type))
    ) {
        return {
            status: 500,
        };
    }

    if (body.entryId) {
        let entry = auditData.getEntry(body.entryId);

        return jsonResponse(entry);
    } else if (body.singelDate) {
        let entries = auditData.getSelectionsForDate({
            from: body.singelDate,
            singleDay: true,
            type: options.type || null,
            to: options.to || null,
        });

        return jsonResponse(entries);
    } else if (body.selectionGroup) {
        let selectionGroup = auditData.getSelectionGroups(options);

        // The aggregation structure is located in getSelectionGroups auditlog-data
        return jsonResponse(selectionGroup);
    }

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
