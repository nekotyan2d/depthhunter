<template>
    <div class="page">
        <h2>Все сообщения</h2>
        <div class="messages">
            <div
                v-for="message in messages"
                class="message">
                <div class="content">
                    <div class="nick">{{ message.nick == currentPlayer?.nick ? "Вы" : message.nick }}</div>
                    <div class="text">{{ message.text }}</div>
                </div>
                <div class="date">{{ getTimeAgo(message.end_date) }}</div>
            </div>
            <div v-if="messages.length == 0" class="no-messages">
                Пока нет сообщений. Будь первым!
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useMessagesStore } from "../stores/messages";
import { useGameStore } from "../stores/game";

const messagesStore = useMessagesStore();
const game = useGameStore();

const { messages } = storeToRefs(messagesStore);
const { currentPlayer } = storeToRefs(game);

const timer = ref<NodeJS.Timeout | null>(null);
const now = ref(new Date());

onMounted(() => {
    timer.value = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    if (timer.value) clearInterval(timer.value);
})

const getTimeAgo = (date: string) => {
    const future = new Date(date);
    const diff = future.getTime() - now.value.getTime();

    const dates: string[] = [];

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) dates.push(`${hours} ч`);

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes > 0) dates.push(`${minutes} м`);

    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    dates.push(`${seconds} с`);

    return dates.length == 1 ? dates[0] : [dates[0], dates[1]].join(" ");
};
</script>
<style lang="scss" scoped>
@use "../assets/scss/page" as *;

.messages {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .message {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background-color: var(--color-bg-secondary);
        padding: 8px;
        border-radius: 2px;

        .content {
            flex: 1;

            .nick {
                font-size: 0.9rem;
                color: var(--color-text-accent);
            }
        }

        .date {
            font-size: 0.8rem;
            color: var(--color-text-accent);
        }
    }
}
</style>
