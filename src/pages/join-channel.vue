<template>
    <div class="join-channel">
        <template v-if="!clicked">
            <p>Присоединяйтесь к нашему телеграм-каналу, чтобы играть в DepthHunter! Поддержите разработчиков и первыми узнавайте о всех новостях и обновлениях.</p>
            <Button @click="subscribe">Подписаться</Button>
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

function subscribe(){
    clicked.value = true;
    window.Telegram.WebApp.openTelegramLink("https://t.me/DepthHunter");
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
}
</style>