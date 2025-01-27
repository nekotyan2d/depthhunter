export const useLogger = () => {
    const log = (message: string, ...optionalParams: any[]) => {
        console.log(`[LOG] [${time()}]: ${message}`, ...optionalParams);
    };

    const error = (message: string, ...optionalParams: any[]) => {
        console.error("%c[ERROR]", "color: red", `[${time()}]: ${message}`, ...optionalParams);
    };

    const warn = (message: string, ...optionalParams: any[]) => {
        console.warn("%c[WARN]", "color: orange", `[${time()}]: ${message}`, ...optionalParams);
    };

    const info = (message: string, ...optionalParams: any[]) => {
        console.info("%c[INFO]", "color: #3f6fff", `[${time()}]: ${message}`, ...optionalParams);
    };

    return {
        log,
        error,
        warn,
        info,
    };
};

const time = () => {
    return new Date().toISOString();
};