<template>
    <nav>
        <RouterLink class="link" to="/chat" active-class="active">
            <Icon icon="pixelarticons:message-text" height="1.1rem" width="1.1rem" />
            <span>Чат</span>
            <span v-if="unreadMessages > 0" class="indicator">{{ unreadMessages < 100 ? unreadMessages : "99+" }}</span>
        </RouterLink>
        <RouterLink class="link" to="/" active-class="active">
            <Icon icon="pixelarticons:play" height="1.1rem" width="1.1rem" />
            <span>Игра</span>
        </RouterLink>
        <RouterLink class="link" to="/settings" active-class="active">
            <Icon icon="pixelarticons:menu" height="1.1rem" width="1.1rem" />
            <span>Настройки</span>
        </RouterLink>
    </nav>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";

import { useChatStore } from "../stores/chat";
import { storeToRefs } from "pinia";

const chat = useChatStore();
const { unreadMessages } = storeToRefs(chat);
</script>

<style lang="scss" scoped>
nav {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    justify-content: center;
    height: 50px;
    user-select: none;
    background-color: var(--color-bg);
}

.link {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    text-decoration: none;
    color: var(--color-hint);
    position: relative;

    &.active {
        color: var(--color-text-accent);
    }
}

.link span {
    font-size: 0.9rem;
}

.indicator {
    position: absolute;
    top: 0;
    left: 65%;
    height: 1rem;
    min-width: 1rem;
    padding: 0 4px;
    background-color: var(--color-text-destructive);
    color: var(--color-text);
    border-radius: 20px;
    line-height: 0.8rem;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>