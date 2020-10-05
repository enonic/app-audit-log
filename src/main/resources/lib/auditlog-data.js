const auth = require("/lib/xp/auth");
const auditlog = require("/lib/xp/auditlog");
const moment = require("/lib/moment.min.js");

function entryData(id) {
    const auditlog = require("/lib/xp/auditlog");

    let entry = auditlog.get({
        id: id,
    });

    //let objects = [].concat(entry.objects);

    return entry;

    /* return {
        id: entry._id,
        user: entry.user,
        timestamp: entry.time,
        type: entry.type,
        objects,
    }; */

    /* if (entry.data.result.pendingContents) {
        data.formatted.type = "Marked as deleted";
    } */
}

function displayData(id) {
    let entry = auditlog.get({
        id: id,
    });

    //Might want to filter out all system changes
    let username = getUsername(entry.user);

    let simpleDate = new moment(entry.time).format("YYYY-MM-DD");

    return {
        id: id,
        user: username,
        type: getAuditType(entry.type),
        timestamp: simpleDate,
    };
}

function getUsername(key) {
    let profile = auth.getPrincipal(key);

    return profile.displayName;
}

/* Delete shows when marked as deleted */
function getAuditType(type) {
    switch (type) {
        case "system.content.update":
            return "Update";
        case "system.content.unpublishContent":
            return "Unpublish";
        case "system.content.publish":
            return "Publish";
        case "system.content.rename":
            return "Rename";
        case "system.content.moved":
            return "Move";
        case "system.content.create":
            return "Create";
        case "system.content.delete":
            return "Delete";
        default:
            return type;
    }
}

exports.getDisplayData = displayData;
exports.getEntryData = entryData;
