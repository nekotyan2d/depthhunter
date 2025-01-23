import { defineStore } from "pinia";

import { computed, ref } from "vue";

export const useChatStore = defineStore("chat", () => {
    const messages = ref<ChatMessage[]>([]);
    const newMessage = ref("");

    const myMessages = ref<string[]>([]);
    const myMessagesIndex = ref(-1);

    const readMessages = ref(0);

    const unreadMessages = computed(() => {
        return messages.value.length - readMessages.value;
    });

    return {
        messages,
        newMessage,
        myMessages,
        myMessagesIndex,
        readMessages,
        unreadMessages,
    };
});