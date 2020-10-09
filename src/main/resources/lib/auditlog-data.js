const auth = require("/lib/xp/auth");
const auditlog = require("/lib/xp/auditlog");
const moment = require("/lib/moment.min.js");
const content = require("/lib/xp/content");
const node = require("/lib/xp/node");

function entryData(id) {
    let entry = auditlog.get({
        id: id,
    });

    /* let changedContent = [];

    if (entry.objects) {
        entry.objects = [].concat(objects);
        entry.objects.forEach((element) => {
            // "objects": "com.enonic.cms.default:draft:b5c145d1-353c-43c5-85fb-35d02cbf7d89",
            
            let changed = content.get({
                key: element,
            }); 
        });
        entry.objects = changedContent;
    } */

    return entry;

    /* if (entry.data.result.pendingContents) {
        data.formatted.type = "Marked as deleted";
    } */
}

function getSelectionGroups(options) {
    if (!options) options = {}; //default param

    let repoConnection = node.connect({
        repoId: "system.auditlog", // Please never connect to a system repo. Ever.
        branch: "master",
    });

    let result = repoConnection.query({
        start: 0,
        count: 0, // OPEN THE FLOOD GATE? Don't do this unless you know what you are doing.
        query: "",
        sort: "_ts DESC",
        aggregations: {
            by_day: {
                dateHistogram: {
                    field: "time",
                    interval: "1D",
                    minDocCount: 1,
                    format: "yyyy-MM-dd",
                },
            },
        },
    });

    let findOptions = {
        start: 0,
        count: 100,
    };
    if (options.from) findOptions.from = options.from;
    if (options.to) findOptions.to = options.from;

    // Are the first or last entries returned?
    //let result = auditlog.find(findOptions);

    let groups = [];
    //"2020-10-01": [entryData]

    log.info(JSON.stringify(result.aggregations.by_day.buckets[5], null, 4));

    log.info(JSON.stringify(getSelectionForDate("2019-12-22T00:00.00Z"), null, 4));

    //let lastDate = "";
    result.hits.forEach(function (hit) {
        displayData(hit.id);

        /* let getDate = data.timestamp.split("T")[0];
        if (entries[getDate] != lastDate) {
            entries[getDate] = new Array();
        } */
        groups.push(data);
    });

    //Insert into an array and sort each day group.
    /* let dayGroups = [];
    for (const prop in entries) {
        dayGroups.push(
            entries[prop].sort(function (a, b) {
                if (a.timestamp < b.timestamp) return -1;
                if (a.timestamp > b.timestamp) return 1;
                return 0;
            })
        );
    } */

    return groups;
}

function displayData(id) {
    let entry = auditlog.get({
        id: id,
    });

    //Might want to filter out all system changes
    //let username = getUsername(entry.user);

    let datetime = new moment(entry.time);

    let simpleDate = datetime.format("YYYY-MM-DD");
    let simpleTime = datetime.format("HH:mm:ss");

    return {
        id: entry.id,
        user: entry.user,
        type: entry.type,
        date: simpleDate,
        time: simpleTime,
        timestamp: entry.time,
    };
}

function getSelectionForDate(date) {
    let repoConnection = node.connect({
        repoId: "system.auditlog", // Please never connect to a system repo. Ever.
        branch: "master",
    });

    let datetime = moment(date, "YYYY-MM-DD");
    datetime.startOf("day");
    let next = moment(datetime.toISOString()).add(1, "days");

    log.info(datetime.toISOString());

    let result = repoConnection.query({
        start: 0,
        count: -1,
        query: `time > dateTime('${datetime.toISOString()}') AND time < dateTime('${next.toISOString()}')`,
        sort: "time DESC",
    });

    let entries = [];
    result.hits.forEach(function(entry) {
        entries.push(displayData(entry.id));
    })

    return entries;
}

/** Single flied methods */
function getUsername(key) {
    let profile = auth.getPrincipal(key);

    return profile.displayName;
}

/*  */
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

//exports.getDisplayData = displayData;
exports.getEntryData = entryData;
exports.getSelectionGroups = getSelectionGroups;
