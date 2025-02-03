<template>
    <div class="join-channel">
        <template v-if="!clicked">
            <p>Присоединяйтесь к нашему телеграм-каналу, чтобы играть в DepthHunter! Поддержите разработчиков и первыми узнавайте о всех новостях и обновлениях.</p>
            <Button class="subscribe-button"><a @click="clicked = true" href="https://t.me/DepthHunter" target="_blank">Подписаться</a></Button>
        </template>
        <template v-else>
            <p>Спасибо за подписку! Перезагрузите игру и погружайтесь в мир DepthHunter!</p>
            <Button @click="reload">Перезагрузить</Button>
        </template>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import Button from "../components/Button.vue";

const clicked = ref(false);

function reload() {
    window.location.pathname = "/";
}
</script>
<style lang="scss" scoped>
.join-channel {
    padding: 16px;
    height: calc(100vh - 60px);
    height: calc(100dvh - 60px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .subscribe-button {
        padding: 0;

        a {
            padding: 8px 16px;
            text-decoration: none;
            color: inherit;
        }
    }
}
</style>