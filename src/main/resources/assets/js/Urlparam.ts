
// Adds a param with key and value to the url bar
export function addUrlParam(name: string, value: string | boolean) {
    const location = window.location;
    const params = new URLSearchParams(location.search);
    params.set(name, value.toString());
    const cleanUrl = location.href.substring(0, location.href.length - location.search.length);
    window.history.pushState('added param', 'Audit log', cleanUrl + '?' + params.toString());
}

// Gets an object with all key value pairs of the url params
export function getUrlParams() {
    const location = document.location;
    const searchParams = new URLSearchParams(location.search);
    const store: any = {};

    searchParams.forEach((value, key) => {
        store[key] = value;
    });

    return store;
}

export function removeUrlParam(name: string) {
    const location = window.location;
    const params = new URLSearchParams(location.search);
    if (params.get(name)) {
        params.delete(name);
        const paramString = params.toString();
        const cleanUrl = location.href.substring(0, location.href.length - location.search.length);
        const addition = paramString.length > 1 ? '?' + paramString : '';
        window.history.pushState('remove param', 'Audit log', cleanUrl.concat(addition));
    }
}
