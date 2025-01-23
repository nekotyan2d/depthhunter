import { defineStore } from "pinia";

import { ref } from "vue";

export const useChatStore = defineStore("chat", () => {
    const messages = ref<ChatMessage[]>([]);
    const newMessage = ref("");

    const myMessages = ref<string[]>([]);
    const myMessagesIndex = ref(-1);

    return {
        messages,
        newMessage,
        myMessages,
        myMessagesIndex,
    };
});