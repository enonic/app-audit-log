const auth = require("/lib/xp/auth");

function processData(entry) {
    //let contentId = entry.data.params.contentId;

    //Might want to filter out all system changes
    let formattedUser = getUserName(entry.user);

    // let objects = [].concat(entry.objects); // Might be this can be more then 1 object?

    let data = {
        formatted: {
            user: formattedUser,
            type: getAuditType(entry.type),
        },
        user: entry.user,
        timestamp: entry.time,
        type: entry.type,
        // objects,
    };

    if (entry.data && entry.data.params) {
        let params = entry.data.params;

        if(params.newName) {
            data.newName = params.newName;
        }

        if (params.modifier) {
            data.modifier = params.modifier; 
        }
    }

    return data;
}

function getUserName(key) {
    let profile = auth.getPrincipal(key);

    return profile.displayName;
}

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
        default:
            return type;
    }
}

exports.processData = processData;
