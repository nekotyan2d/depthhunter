<template>
    <div class="page">
        <h2>Новое сообщение</h2>
        <Input maxlength="50" placeholder="Начни вводить сообщение..." v-model="message" />
        <h3>Правила</h3>
        <ul>
            <li>50 символов в сообщении, не более!</li>
            <li>Не пиши ничего запрещенного, что может навредить людям</li>
            <li>Твое сообщение увидит каждый игрок</li>
        </ul>
        <Button :disabled="!canSend" @click="sendMessage">Отправить</Button>
        <div class="info">
            <Icon icon="pixelarticons:info-box" height="16" width="16"/>Обычно сообщение появляется через несколько минут после оплаты
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import Input from "../components/Input.vue";
import Button from "../components/Button.vue";
import { ofetch } from "ofetch";
import { useAppStore } from "../stores/app";
import { useLogger } from "../composables/useLogger";
import { Icon } from "@iconify/vue";

const app = useAppStore();
const logger = useLogger();

const message = ref("");

const canSend = computed(() => {
    if (message.value.length > 0 && message.value.length <= 50) return true;
    return false;
})

async function sendMessage() {
    if (!canSend.value) return;

    try {
        const data = await ofetch(`${app.backendProtocol}//${app.backendHost}/api/message`, {
            method: "POST",
            body: {
                text: message.value,
                initData: app.initData
            }
        })
        if (data.ok) {
            message.value = "";
            window.Telegram.WebApp.openTelegramLink(data.url);
        } else {
            throw new Error(data.response.description);
        }
    } catch (error: any) {
        logger.error("Произошла ошибка при отправке сообщения: ", error.data ? error.data.response.description : error.message)
    }
}
</script>
<style lang="scss" scoped>
@use "../assets/scss/page" as *;

input {
    width: 100%;
}

.info {
    color: var(--color-hint);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
}
</style>