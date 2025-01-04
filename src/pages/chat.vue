<template>
    <div class="chat">
        <div class="messages">
            <div ref="messageElements" v-for="message in messages" class="message">{{ message.text }}</div>
        </div>
        <div class="input-box">
            <input v-model="newMessage" @keydown.enter="sendMessage" type="text" placeholder="Введите сообщение" />
            <div class="send" :disabled="!canSendMessage">
                <Icon icon="material-symbols:send-outline-rounded" @click="sendMessage" height="30" width="30"/>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import { useSocketsStore } from '../stores/sockets';

const chat = useChatStore();
const sockets = useSocketsStore();

const { messages } = storeToRefs(chat);

const newMessage = ref("");
const canSendMessage = ref(false);

const messageElements = ref<HTMLDivElement[]>([]);

watch(messages, () => {
    if (messageElements.value.length == 0) return;
    messageElements.value[messageElements.value.length - 1].scrollIntoView();
})

// проверка возможности отправки сообщения
setInterval(() => {
    if (newMessage.value.trim().length > 0 && Date.now() - lastMessageSent > 1000) {
        canSendMessage.value = true;
    } else {
        canSendMessage.value = false;
    }
}, 100);

let lastMessageSent = 0;
function sendMessage() {
    if (!newMessage.value || Date.now() - lastMessageSent < 1000) return;
    sockets.send({ type: "msg", data: { text: newMessage.value } })
    newMessage.value = "";
    lastMessageSent = Date.now();
}
</script>
<style lang="scss" scoped>
.chat {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: calc(var(--viewport-height) - 50px);
    padding: 8px;

    .messages {
        height: calc(var(--viewport-height) - 100px);
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .input-box {
        display: flex;
        justify-content: center;
        min-height: 50px;
        border-radius: 8px;
        border: 1px solid var(--color-hint);

        input {
            flex: 1;
            padding: 10px;
            border: none;
            outline: none;
            background-color: transparent;
        }

        .send {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 50px;
            width: 50px;
            color: var(--color-text-accent);

            &[disabled="true"] {
                color: var(--color-text);
            }
        }
    }
}
</style>