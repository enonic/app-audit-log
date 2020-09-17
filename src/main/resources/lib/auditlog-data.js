const auth = require("/lib/xp/auth");

function processData(entry) {
    let contentId = entry.data.params.contentId;
    
    //Might want to filter out all system changes
    let user = getUserName(entry.user)

    // let referance = [].concat(entry.objects); // Might be this can be more then 1 object?
    // let objects = [];
    /* referance.forEach(function(key) {
        let info = key.split(":");
        //let repo = refInfo[0]; //repo should always be the same
        //let objectId = refInfo[2];
        objects.push({
            branch: info[1],
        })
    }); */

    let formatedTime = entry.time.split('.')[0];
    formatedTime = formatedTime.replace('T', " ");

    //let time = `${entryTime.getFullYear()}-${entryTime.getMonth()+1}-${entryTime.getDate()} ${entryTime.getHours()}:${entryTime.getMinutes()}`;

    let data = {
        contentId,
        user,
        timestamp: formatedTime,
        type: entry.type,
    };

    return data;
}

function getUserName(key) {
    let profile = auth.getPrincipal(key);

    return profile.displayName;
}

/* function getAuditType(type) {
    switch (type) {
        case "system.content.update":
            return "Edit";
        case "system.content.unpublishContent":
            return "Unpublished";
        case "system.content.publish":
            return "Published";
        case "system.content.rename":
            return "Renamed";
        case "system.content.moved":
            return "Moved";
            default:
            return type;
    }
} */

exports.processData = processData;
