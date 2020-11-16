var sass = require("sass");
var fs = require("fs");

let outFile = "build/resources/main/assets/styles/style.min.css"

sass.render({
    file: "src/main/resources/assets/styles/styles.scss",
    includePaths: [
        "src/main/resources/assets/styles/"
    ],
    omitSourceMapUrl: true,
    outFile: outFile,
    outputStyle: "compressed",
    //outputStyle: "expanded", //Debug only
}, function handleResult(error, result) {
    if (error) {
        console.log(error);
        throw new Error("Sass build error");
    }
    fs.writeFile(outFile, result.css, function(err) {
        if (err) {
            console.log(err);
            throw new Error("Could not write the output file");
        }
        console.log("styles.min.css created");
    });
});