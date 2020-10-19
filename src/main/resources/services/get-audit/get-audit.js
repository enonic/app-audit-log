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

    let dateReg = /\d*-\d*-\d*/i;

    if (
        (from && dateReg.test(from) == false) ||
        (to && dateReg.test(to) == false)
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
            singleDay: true,
            from: body.singelDate,
            fullText: options.fullText || null,
            to: options.to || null,
        });

        return jsonResponse(entries);
    } else if (body.selectionGroup) {
        let selectionGroup = auditData.getSelectionGroups(options);

        // The aggregation structure is located in getSelectionGroups auditlog-data
        return jsonResponse(selectionGroup);
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
