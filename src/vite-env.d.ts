/// <reference types="vite/client" />
declare const APP_BACKEND_URL: string;

interface Window {
    Telegram: {
        WebApp: {
            ready: () => void;

            initData: string;
            initDataUnsafe: object;
        };
    };
}
