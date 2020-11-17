const test = require('./test.es6');

document.addEventListener("DOMContentLoaded", () => {
    let e = test.a("foobar");
    console.log(e);
});