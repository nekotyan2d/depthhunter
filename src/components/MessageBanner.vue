<template>
    <div class="message">
        <div class="messages" @click="router.replace('/messages')">
            <div ref="text" class="text-slider">
                <div v-for="message in messages" class="text"><span class="nick">{{ message.nick }}</span> {{ message.text }}</div>
                <div v-if="messages.length == 0" class="text">Попади сюда первым! Отправь сообщение в бегущую строку за
                    25
                    Stars!</div>
            </div>
        </div>
        <div class="send" @click.self="router.replace('/new-message')">Отправить</div>
    </div>
</template>
<script lang="ts" setup>
import { ofetch } from 'ofetch';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { useMessagesStore } from '../stores/messages';
import { storeToRefs } from 'pinia';

const text = ref<HTMLDivElement | null>(null);
const currentOffset = ref(window.innerWidth / 4);

const app = useAppStore();
const messagesStore = useMessagesStore();

const { messages } = storeToRefs(messagesStore);

const router = useRouter();

onMounted(async () => {
    await refreshMessages();
    setInterval(() => {
        refreshMessages();
    }, 120000); // 2 минуты
    slideText();
})

async function refreshMessages() {
    const data = await ofetch<MessageResponse>(`${app.backendProtocol}//${app.backendHost}/api/message`);
    messages.value = data.message;
}

function slideText() {
    if (!text.value) return;
    const textWidth = text.value.clientWidth;
    const windowWidth = window.innerWidth;
    if (currentOffset.value > -textWidth) {
        currentOffset.value -= 1.4; 
    } else if (currentOffset.value <= -textWidth) {
        currentOffset.value = windowWidth;
    }
    text.value.style.transform = `translate3d(${currentOffset.value}px, 0px, 0px)`;
    requestAnimationFrame(slideText)
}
</script>
<style lang="scss" scoped>
.message {
    position: fixed;
    top: calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top));
    left: 0;
    right: 0;
    height: 2rem;
    background-color: var(--color-text-accent);
    color: white;
    z-index: 100;
    display: flex;
    font-size: 0.9rem;
    cursor: pointer;

    .messages {
        width: calc(100% - 100px);
    }

    .text-slider {
        display: flex;
        gap: 100vw;
        width: fit-content;
    }

    .nick {
        border-radius: 20px;
        border: 1px solid white;
        padding: 4px;
    }

    .text {
        line-height: 2rem;
        white-space: nowrap;
    }

    .send {
        position: absolute;
        right: 0;
        background-color: inherit;
        line-height: 2rem;
        padding: 0 4px 0 8px;
        color: inherit;
        width: 100px;
        text-decoration: none;

        &::before{
            content: "";
            position: absolute;
            height: 2rem;
            width: 16px;
            left: -16px;
            background: linear-gradient(270deg, var(--color-text-accent), rgba(0, 0, 0, 0))
        }
    }
}
</style>