import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
    const fatalError = ref({
        occurred: false,
        message: ""
    })

    const showFatalError = (error: Error, hide?: boolean) => {
        if(hide){
            fatalError.value.occurred = false;
            fatalError.value.message = "";
            return;
        }

        fatalError.value.occurred = true;
        fatalError.value.message = error.message;
    }

    return {
        fatalError,
        showFatalError
    }
})