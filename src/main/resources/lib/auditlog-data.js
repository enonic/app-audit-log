const auth = require("/lib/xp/auth");
const auditlog = require("/lib/xp/auditlog");
const moment = require("/assets/lib/moment.min.js");
//const content = require("/lib/xp/content");
const node = require("/lib/xp/node");

//exports.getDisplayData = displayData;
exports.getEntry = getEntry;
exports.getSelection = getSelection;
exports.getEntriesForUser = getEntriesForUser;
//exports.getEntries = getEntries;
exports.getAllTypes = getAllTypes;
exports.getAllUsers = getAllUsers;

/**
 * Simple get the node from storrage call with the audit log
 * @param {String} id
 * @returns {Object} The node entry
 */
function getEntry(id) {
    let entry = auditlog.get({
        id: id,
    });

    return entry;

    /* if (entry.data.result.pendingContents) {
        data.formatted.type = "Marked as deleted";
    } */
}

/**
 * Get all types of log entries.
 * Aggregates all unique values sorted by the most used.
 */
function getAllTypes() {
    let result = doQuery("", null, {
        by_type: {
            terms: {
                field: "type",
                order: "_count desc",
                size: 100,
            },
        },
    });

    return result.aggregations.by_type.buckets;
}

function getAllUsers() {
    let result = auth.findUsers({
        count: -1,
        query: "",
    });

    let data = [];
    result.hits.forEach(function(user) {
        data.push(user.key);
    });

    return data;
}

/**
 * Gets log entries for each day in format day and amount of log entries.
 * Used to get all groups of log entries
 * @param {Object} options the options passed to doQuery
 */
function getSelection(options) {
    if (!options) options = {}; //default param

    let result = doQuery("", options);

    let selections = [];
    result.hits.forEach(function (el) {
        let log = auditlog.get({ id: el.id });
        log.user = formatUser(log.user);
        selections.push(log);
    });

    return {
        selections,
        total: result.total,
    };
}

/**
 * Combined search for other methods
 * Let you do decide how the search should be performed
 * @param {String} [queryLine=""] the query to run
 * @param {Object} [settings={}]
 * @param {string|Moment} [settings.from] date YYYY-MM-DD or moment object
 * @param {string|Moment} [settings.to] date YYYY-MM-DD or moment object
 * @param {string} [settings.type] The type of event to filter for
 * @param {string} [settings.sort] how to sort the query
 * @param {Object} [aggregations]
 */
function doQuery(queryLine, settings, aggregations) {
    let query = queryLine || "";
    let options = settings ? settings : {};

    if (options.from) {
        let from;
        if (moment.isMoment(options.from)) {
            from = options.from;
        } else {
            from = moment(options.from, "YYYY-MM-DD").utc(true);
            from.startOf("day");
        }

        if (query != "") query += " AND ";
        query += `time > dateTime('${from.toISOString()}') `;
    }
    if (options.to) {
        let to;
        if (moment.isMoment(options.to)) {
            to = options.to;
        } else {
            to = moment(options.to, "YYYY-MM-DD").utc(true);
            to.endOf("day");
        }

        if (query != "") query += " AND ";
        query += `time < dateTime('${to.toISOString()}')`;
    }
    if (options.type) {
        if (query != "") query += " AND ";
        query += `type = '${options.type}'`;
    }
    if (options.user) {
        if (query != "") query += " AND ";
        query += `user = '${options.user}'`;
    }
    if (options.fullText) {
        if (query != "") query += " AND ";
        // full text
        query += `fulltext("*", "'${options.fullText}'", "AND")`;
    }

    if (options.count > 100) {
        log.error("Wrong params in query. Audit log");
        log.info(JSON.stringify(options, null, 4));
    }

    let queryParam = {
        start: options.start || 0,
        count: options.count || 100,
        query: query,
        sort: options.sort ? options.sort : "_ts DESC",
    };

    queryParam.aggregations = aggregations ? aggregations : undefined;

    let repoConnection = node.connect({
        repoId: "system.auditlog", // Please never connect to a system repo manuallya. Ever.
        branch: "master",
    });

    let result = repoConnection.query(queryParam);

    return result;
}

/**
 *
 * @param {Object} options
 * @param {Object} options.from date formated like YYYY-MM-DD or moment object
 * @param {Object} [options.to] date fromated like YYYY-MM-DD or moment object
 * @param {Object} [options.singleDay] is true sets nextDay to options.from + 1
 * @returns {Array} log entries for the given time range
 */
function getEntriesForUser(options) {
    /* let datetime = moment(options.from, "YYYY-MM-DD");
    datetime.utc(true).startOf("day"); */

    /* let next;
    if (options.singleDay) {
        next = moment(datetime).utc(true);
        next.add(1, "days");
    } else {
        next = moment(options.to, "YYYY-MM-DD").utc(true);
    } */

    let result = doQuery(`user = '${options.user}'`, {
        from: options.from,
        to: options.to,
        count: -1,
        sort: "  DESC",
        fullText: options.fullText || null,
    });

    let entries = [];
    result.hits.forEach(function (entry) {
        entries.push(displayData(entry.id));
    });

    return entries;
}

/**
 * Gets the data needed for the frontend
 * @param {String} id
 * @returns {Object} processed data for the frontend
 */
function displayData(id) {
    let entry = auditlog.get({
        id: id,
    });

    //Might want to filter out all system changes
    //let username = getUsername(entry.user);

    let datetime = new moment(entry.time).utc(true);

    //let simpleDate = datetime.format("YYYY-MM-DD");
    let simpleTime = datetime.format("HH:mm:ss");

    return {
        id: entry._id,
        user: entry.user,
        type: entry.type,
        time: simpleTime,
        timestamp: entry.time,
    };
}

/** Single field methods */
function getUsername(key) {
    let profile = auth.getPrincipal(key);

    return profile.displayName;
}

function formatUser(userKey) {
    return userKey.replace("user:system:", "");
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