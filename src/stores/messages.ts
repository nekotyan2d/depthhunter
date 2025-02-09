import { defineStore } from "pinia";
import { ref } from "vue";

export const useMessagesStore = defineStore("messages", () => {
    const messages = ref<MessageResponse["message"]>([]);

    return {
        messages,
    };
});
