const thymeleaf = require("/lib/thymeleaf");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
const adminLib = require("/lib/xp/admin");
const license = require("/lib/license");
const project = require("/lib/xp/project");

const view = resolve("audit-log.html");
const licenseView = resolve("license.html");

exports.get = function () {
    const types = auditData.getAllTypes();
    const users = auditData.getAllUsers();
    const projects = getAllProjects();
    const licenseDetail = license.validateLicense({
        appKey: app.name,
    });

    const serviceUrl = portal.serviceUrl({
        service: "get-audit",
        type: "absolute",
    });

    const licenseUrl = portal.serviceUrl({
        service: "license",
        type: "absolute",
    })

    const assetsUrl = portal.assetUrl({
        path: "",
    });

    const model = {
        assetsUrl,
        serviceUrl,
        licenseUrl,
        allUsers: users,
        allTypes: types,
        projects,
        launcherPath: adminLib.getLauncherPath(),
        launcherUrl: adminLib.getLauncherUrl(),
        licenseText: licenseDetail ? `Licensed to ${licenseDetail.issuedTo}` : "Error",
    };

    if (licenseDetail == null || licenseDetail.expired) {
        return {
            body: thymeleaf.render(licenseView, model),
        };
    } else {
        return {
            body: thymeleaf.render(view, model),
        };
    }
};

function getAllProjects() {
    return project.list().map(function(element) {
        return { 
            id: element.id,
            name: element.displayName,
        }
    });
}