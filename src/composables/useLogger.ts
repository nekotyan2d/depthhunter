export const useLogger = () => {
    const log = (message: string) => {
        console.log(`[LOG]: ${message}`);
    };

    const error = (message: string) => {
        console.error(`[ERROR]: ${message}`);
    };

    const warn = (message: string) => {
        console.warn(`[WARN]: ${message}`);
    };

    const info = (message: string) => {
        console.info(`[INFO]: ${message}`);
    };

    return {
        log,
        error,
        warn,
        info
    };
}