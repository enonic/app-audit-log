
function setup() {

}

function cleanDate() {
    let timetag = document.querySelectorAll("#audit-log .data time");
    timetag.forEach((entry) => {
        let utcTime = entry.getAttribute("datetime");
        let entryTime = new Date(utcTime);
        let localTime = entryTime.toLocaleString();
        entry.textContent = localTime;
    });
}

//setup();
cleanDate();