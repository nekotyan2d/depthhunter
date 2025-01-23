/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_BACKEND_URL: string;
    readonly VITE_APP_STORAGE_URL: string;
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

            setHeaderColor: (color: string) => void;
            setBackgroundColor: (color: string) => void;
            setBottomBarColor: (color: string) => void;

            disableVerticalSwipes: () => void;

            onEvent: (event: string, callback: (data: any) => void) => void;
        };
    };
}
