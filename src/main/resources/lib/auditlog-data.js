const auth = require('/lib/xp/auth');
const auditlog = require('/lib/xp/auditlog');
const moment = require('/lib/moment');
//const content = require("/lib/xp/content");
const node = require('/lib/xp/node');

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

    entry.user = getDisplayName(entry.user);

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
    let result = doQuery('', null, {
        by_type: {
            terms: {
                field: 'type',
                order: '_term ASC',
                size: 100,
            },
        },
    });

    return result.aggregations.by_type.buckets;
}

function getAllUsers() {
    let result = auth.findUsers({
        count: -1,
        query: '',
    });

    let data = [];
    result.hits
        .sort(function (a, b) {
            if (a.key > b.key) {
                return 1;
            } else if (a.key < b.key) {
                return -1;
            }
            return 0;
        })
        .forEach(function (user) {
            data.push({
                key: user.key,
                name: getDisplayName(user.key)
            });
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

    let result = doQuery('', options);

    let selections = [];
    result.hits.forEach(function (el) {
        let log = auditlog.get({ id: el.id });
        log.user = getDisplayName(log.user);
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
    let query = queryLine || '';
    let options = settings ? settings : {};

    const dateFormat = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;

    if (options.from) {
        let from;
        if (moment.isMoment(options.from)) {
            from = options.from;
        } else if (dateFormat.test(options.from)) {
            from = moment(options.from, 'YYYY-MM-DD').utc(true);
            from.startOf('day');
        }
        if (from != undefined) {
            query = emptyOrAdd(query);
            query += `time > dateTime('${from.toISOString()}') `;
        }
    }
    if (options.to) {
        let to;
        if (moment.isMoment(options.to)) {
            to = options.to;
        } else if (dateFormat.test(options.to)) {
            to = moment(options.to, 'YYYY-MM-DD').utc(true);
            to.endOf('day');
        }
        if (to != undefined) {
            query = emptyOrAdd(query);
            query += `time < dateTime('${to.toISOString()}')`;
        }
    }
    if (options.type) {
        query = emptyOrAdd(query);
        query += `type = '${options.type}'`;
    }
    if (options.user) {
        query = emptyOrAdd(query);
        query += `user = '${options.user}'`;
    }
    if (options.fullText) {
        query = emptyOrAdd(query);
        query += `fulltext("*", "'${options.fullText}'", "AND")`;
    }
    if (options.project) {
        query = emptyOrAdd(query);
        query += `objects LIKE 'com.enonic.cms.${options.project}:*'`;
    }

    if (options.count > 100) {
        log.error('Wrong params in query. Audit log');
        log.info(JSON.stringify(options, null, 4));
    }

    let queryParam = {
        start: options.start || 0,
        count: options.count || 100,
        query,
        sort: options.sort ? options.sort : '_ts DESC',
    };

    queryParam.aggregations = aggregations ? aggregations : undefined;

    let repoConnection = node.connect({
        repoId: 'system.auditlog', // Please never connect to a system repo manually. Ever.
        branch: 'master',
    });


    let result = repoConnection.query(queryParam);

    return result;
}

function emptyOrAdd(query) {
    if (query != '') query += ' AND ';
    return query;
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
        sort: 'DESC',
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
    let simpleTime = datetime.format('HH:mm:ss');

    return {
        id: entry._id,
        user: entry.user,
        type: entry.type,
        time: simpleTime,
        timestamp: entry.time,
    };
}

/** Single field methods */
function getDisplayName(name) {
    if (name.startsWith('user:system')) {
        const part = name.split(':');
        return `${part[1]}\\${part[2]}`;
    }
    return name;
}

/* function formatUser(userKey) {
    return userKey.replace('user:system:', '');
} */

function getAuditType(type) {
    switch (type) {
        case 'system.content.update':
            return 'Update';
        case 'system.content.unpublishContent':
            return 'Unpublish';
        case 'system.content.publish':
            return 'Publish';
        case 'system.content.rename':
            return 'Rename';
        case 'system.content.moved':
            return 'Move';
        case 'system.content.create':
            return 'Create';
        case 'system.content.delete':
            return 'Delete';
        default:
            return type;
    }
}
