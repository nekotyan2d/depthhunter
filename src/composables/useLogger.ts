export const useLogger = () => {
    const log = (message: string) => {
        console.log(`[LOG] [${time()}]: ${message}`);
    };

    const error = (message: string) => {
        console.error("%c[ERROR]", "color: red", `[${time()}]: ${message}`);
    };

    const warn = (message: string) => {
        console.warn("%c[WARN]", "color: orange", `[${time()}]: ${message}`);
    };

    const info = (message: string) => {
        console.info("%c[INFO]", "color: #3f6fff", `[${time()}]: ${message}`);
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