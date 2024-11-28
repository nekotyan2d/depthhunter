/// <reference types="vite/client" />
declare const APP_BACKEND_URL: string;

interface Window {
    Telegram: {
        WebApp: {
            ready: () => void;

            initData: string;
            initDataUnsafe: object;
            SettingsButton: {
                isVisible: boolean;
            };

            onEvent: (event: string, callback: (data: any) => void) => void;
        };
    };
}
