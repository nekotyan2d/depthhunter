import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
    const fatalError = ref({
        occurred: false,
        message: ""
    })

    const isLoading = ref(true);
    const initData = ref("");

    const backendUrl = ref(import.meta.env.VITE_APP_BACKEND_URL);
    const settings = JSON.parse(localStorage.getItem("settings") || "{}");
    if ("backendUrl" in settings) {
        backendUrl.value = settings.backendUrl;
    }
    const url = new URL(backendUrl.value);
    const backendHost = url.host;
    const backendProtocol = url.protocol;

    const showFatalError = (error: Error, hide?: boolean) => {
        if (hide) {
            fatalError.value.occurred = false;
            fatalError.value.message = "";
            return;
        }

        fatalError.value.occurred = true;
        fatalError.value.message = error.message;
    };

    return {
        fatalError,
        showFatalError,
        isLoading,
        initData,
        backendHost,
        backendProtocol,
    };
})