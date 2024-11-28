import { defineStore } from "pinia";
import { ref } from "vue";

import { useLogger } from "../composables/useLogger";
const logger = useLogger();

export const useSocketsStore = defineStore("sockets", () => {
    const connection = ref<WebSocket | null>(null);

    const connect = (token: string) => {
        const proto = location.protocol === "https:" ? "wss" : "ws";
        connection.value = new WebSocket(`${proto}://${APP_BACKEND_URL}/ws?token=${token}`);

        connection.value.onopen = () => {
            logger.info("Подключено");
        };

        connection.value.onclose = () => {
            logger.info("Отключено");
            connection.value = null;
        };
    };

    const close = () => {
        logger.info("Отключено");
        connection.value?.close();
        connection.value = null;
    };

    const send = (message: any) => {
        if (!connection.value) {
            logger.error("Данные не отправлены: нет подключения");
            return;
        }
        connection.value.send(JSON.stringify(message));
        logger.info("Данные отправлены");
    };

    return {
        connection,
        connect,
        close,
        send,
    };
})