export function debounce(fn: Function, ms: number) {
    let timeout: NodeJS.Timeout;
    return function(...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), ms);
    }
}