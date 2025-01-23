<template>
    <div class="chat">
        <div class="messages">
            <div ref="messageElements" v-for="message in messages" class="message" :class="message.command && 'command'" v-html="formatMessage(message.text)"></div>
        </div>
        <div class="input-box">
            <Input v-model="newMessage" @keydown.enter="sendMessage" @keydown.up.prevent="changeMessageIndex(1)" @keydown.down.prevent="changeMessageIndex(-1)" type="text" placeholder="Введите сообщение" />
            <Button class="send" :disabled="!canSendMessage">
                <Icon icon="pixelarticons:arrow-right" @click="sendMessage" height="30" width="30"/>
            </Button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import { useSocketsStore } from '../stores/sockets';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';

const chat = useChatStore();
const sockets = useSocketsStore();

const { messages, newMessage, myMessages, myMessagesIndex } = storeToRefs(chat);

const canSendMessage = ref(false);

const messageElements = ref<HTMLDivElement[]>([]);

function changeMessageIndex(direction: -1 | 1){
    if(myMessages.value.length == 0) return;

    const newIndex = myMessagesIndex.value + direction;
    if(newIndex < -1 || newIndex >= myMessages.value.length) return;

    if(newIndex == -1){
        newMessage.value = "";
    } else {
        newMessage.value = myMessages.value[newIndex];
    }

    myMessagesIndex.value = newIndex;
}

function formatMessage(message: string){
    let formattedText = message
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/§0/g, '<span class="color-0">')
        .replace(/§1/g, '<span class="color-1">')
        .replace(/§2/g, '<span class="color-2">')
        .replace(/§3/g, '<span class="color-3">')
        .replace(/§4/g, '<span class="color-4">')
        .replace(/§5/g, '<span class="color-5">')
        .replace(/§6/g, '<span class="color-6">')
        .replace(/§7/g, '<span class="color-7">')
        .replace(/§8/g, '<span class="color-8">')
        .replace(/§9/g, '<span class="color-9">')
        .replace(/§a/g, '<span class="color-a">')
        .replace(/§b/g, '<span class="color-b">')
        .replace(/§c/g, '<span class="color-c">')
        .replace(/§d/g, '<span class="color-d">')
        .replace(/§e/g, '<span class="color-e">')
        .replace(/§f/g, '<span class="color-f">')
        .replace(/§l/g, '<span class="bold">')
        .replace(/§o/g, '<span class="italic">')
        .replace(/§n/g, '<span class="underlined">')
        .replace(/§m/g, '<span class="strikethrough">')
        .replace(/§r/g, '</span>');

    // Close any unclosed spans
    formattedText += '</span>'.repeat((formattedText.match(/<span/g) || []).length - (formattedText.match(/<\/span>/g) || []).length);
    return formattedText;
}

watch(messages, () => {
    if (messageElements.value.length == 0) return;
    messageElements.value[messageElements.value.length - 1].scrollIntoView();
})

// проверка возможности отправки сообщения
setInterval(() => {
    if (newMessage.value.length > 0 && newMessage.value.length < 129 && Date.now() - lastMessageSent > 1000) {
        canSendMessage.value = true;
    } else {
        canSendMessage.value = false;
    }
}, 100);

let lastMessageSent = 0;
function sendMessage() {
    if (!newMessage.value || Date.now() - lastMessageSent < 1000) return;
    sockets.send({ type: "msg", data: { text: newMessage.value } })
    lastMessageSent = Date.now();

    myMessages.value.unshift(newMessage.value);
    if(myMessages.value.length > 20){
        myMessages.value.splice(myMessages.value.length - 1, 1);
    }
    
    myMessagesIndex.value = -1;
    newMessage.value = "";
}
</script>
<style lang="scss" scoped>
.chat {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: calc(100vh - 66px);
    height: calc(100dvh - 66px);
    padding: 8px;

    .messages {
        height: calc(100vh - 116px);
        height: calc(100dvh - 116px);
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        .message {
            border-left: 4px solid transparent;
            padding-left: 12px;
            word-break: break-word;
            white-space: pre-wrap;
        }

        .message.command {
            border-left-color: var(--color-text);
        }

        &:deep(){
            .color-0 { color: #000000; } /* Black */
            .color-1 { color: #0000AA; } /* Dark Blue */
            .color-2 { color: #00AA00; } /* Dark Green */
            .color-3 { color: #00AAAA; } /* Dark Aqua */
            .color-4 { color: #AA0000; } /* Dark Red */
            .color-5 { color: #AA00AA; } /* Dark Purple */
            .color-6 { color: #FFAA00; } /* Gold */
            .color-7 { color: #AAAAAA; } /* Gray */
            .color-8 { color: #555555; } /* Dark Gray */
            .color-9 { color: #5555FF; } /* Blue */
            .color-a { color: #55FF55; } /* Green */
            .color-b { color: #55FFFF; } /* Aqua */
            .color-c { color: #FF5555; } /* Red */
            .color-d { color: #FF55FF; } /* Light Purple */
            .color-e { color: #FFFF55; } /* Yellow */
            .color-f { color: #FFFFFF; } /* White */
            .bold { font-weight: bold; }
            .italic { font-style: italic; }
            .underlined { text-decoration: underline; }
            .strikethrough { text-decoration: line-through; }
        }
    }

    .input-box {
        display: flex;
        justify-content: center;
        min-height: 50px;
        border-radius: 2px;
        background-color: var(--color-bg-secondary);
        align-items: center;

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
        }
    }
}
</style>