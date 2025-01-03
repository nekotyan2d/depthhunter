<template>
    <nav>
        <RouterLink class="link" to="/chat" active-class="active">
            <Icon icon="material-symbols:chat-outline-rounded" height="1.1rem" width="1.1rem"/>
            <span>Чат</span>
        </RouterLink>
        <RouterLink class="link" to="/" active-class="active">
            <Icon icon="material-symbols:gamepad-outline-rounded" height="1.1rem" width="1.1rem"/>
            <span>Игра</span>
        </RouterLink>
        <RouterLink class="link" to="/settings" active-class="active">
            <Icon icon="material-symbols:settings-outline-rounded" height="1.1rem" width="1.1rem"/>
            <span>Настройки</span>
        </RouterLink>
    </nav>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
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

    &.active {
        color: var(--color-text-accent);
    }
}

.link span {
    font-size: 0.9rem;
}
</style>