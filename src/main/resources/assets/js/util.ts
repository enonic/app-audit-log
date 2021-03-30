
/* Util methods */
export function formatDate(date: Date, excludeHour: boolean = false): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();

    if (excludeHour === false) {
        return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    } else {
        return `${year}-${month}-${day}`;
    }
}

// FormatedDate shoud be yyyy-MM-DD f.ek 1990-02-10
export function dateFromFormatDate(formatedDate: string) {
    const parts = formatedDate.split('-');
    const year = parseInt(parts[0], 10);
    //JS month 😃
    const month = parseInt(parts[1], 10)-1;
    const day = parseInt(parts[2], 10);

    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month);
    date.setDate(day);

    return date;
}
