import { defineStore } from "pinia";
import { ref } from "vue";

import { useLogger } from "../composables/useLogger";
const logger = useLogger();

export const useSocketsStore = defineStore("sockets", () => {
    const connection = ref<WebSocket | null>(null);

    const connect = (token: string) => {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        connection.value = new WebSocket(`${proto}://${APP_BACKEND_URL}/ws?token=${token}`);

        connection.value.onopen = () => {
            logger.log("Подключено");
        };

        connection.value.onclose = () => {
            logger.log("Отключено");
            connection.value = null;
        };
    }

    const close = () => {
        logger.log("Отключено");
        connection.value?.close();
        connection.value = null;
    }

    return {
        connection,
        connect,
        close
    }
})