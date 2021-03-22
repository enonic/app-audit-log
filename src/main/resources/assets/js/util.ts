/* Util methods */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}
