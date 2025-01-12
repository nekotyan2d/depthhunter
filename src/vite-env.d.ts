/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_BACKEND_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

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
