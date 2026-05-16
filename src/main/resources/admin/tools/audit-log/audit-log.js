const thymeleaf = require("/lib/thymeleaf");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
const assetLib = require("/lib/enonic/asset");
const adminLib = require("/lib/xp/admin");
const project = require("/lib/xp/project");
const licenseManager = require("/lib/license-manager");

const view = resolve("audit-log.html");
const licenseView = resolve("license.html");

exports.get = function () {
    const types = auditData.getAllTypes();
    const users = auditData.getAllUsers();
    const projects = getAllProjects();
    const licenseValid = licenseManager.isCurrentLicenseValid();

    const serviceUrl = portal.serviceUrl({
        service: "get-audit",
        type: "absolute",
    });

    const licenseUrl = portal.serviceUrl({
        service: "license",
        type: "absolute",
    })

    const model = {
        adminCommonCssUrl: assetLib.assetUrl({ path: "admin/common/styles/lib.css" }),
        adminCommonJsUrl: assetLib.assetUrl({ path: "admin/common/js/lib.js" }),
        stylesUrl: assetLib.assetUrl({ path: "styles/styles.css" }),
        mainJsUrl: assetLib.assetUrl({ path: "js/main.js" }),
        licenseJsUrl: assetLib.assetUrl({ path: "js/license.js" }),
        appIconUrl: assetLib.assetUrl({ path: "application.svg" }),
        iconUrl: assetLib.assetUrl({ path: "icons/entry.svg" }),
        serviceUrl,
        licenseUrl,
        allUsers: users,
        allTypes: types,
        projects,
        launcherPath: adminLib.getLauncherPath(),
        launcherUrl: adminLib.getLauncherUrl(),
        licenseText: licenseManager.getIssuedTo(),
    };

    if (!licenseValid) {
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
    }).sort(function (a, b) {
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
        }
        else if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
        }
        return 0;
    });
}
