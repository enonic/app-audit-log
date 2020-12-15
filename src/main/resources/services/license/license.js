const portalLib = require("/lib/xp/portal");
const ioLib = require("/lib/xp/io");
const licenseLib = require("/lib/license");

exports.post = function (req) {
    let licenseStream = portalLib.getMultipartStream("license");
    let license = ioLib.readText(licenseStream);

    const licenseDetails = licenseLib.validateLicense({
        license,
        appKey: app.name,
    });

    log.info(JSON.stringify(licenseDetails, null, 4));

    const isValid = licenseDetails && !licenseDetails.expired;

    if (isValid) {
        licenseLib.installLicense({
            license: license,
            appKey: app.name,
        });

        return {
            status: 200,
            contentType: "application/json",
            body: {
                licenseValid: isValid,
            },
        };
    } else {
        return {
            status: 500,
        };
    }
};
