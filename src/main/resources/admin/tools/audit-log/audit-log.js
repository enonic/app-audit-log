const thymeleaf = require("/lib/thymeleaf");
const auditData = require("/lib/auditlog-data");
const portal = require("/lib/xp/portal");
const adminLib = require("/lib/xp/admin");
const licenseManager = require("/lib/license-manager");

const view = resolve("audit-log.html");
const licenseView = resolve("license.html");

exports.get = function () {
    const types = JSON.stringify(auditData.getAllTypes());
    const users = JSON.stringify(auditData.getAllUsers());
    const licenseValid = licenseManager.isCurrentLicenseValid();

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
