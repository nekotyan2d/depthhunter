import { defineStore } from "pinia";
import { ref } from "vue";

import { useLogger } from "../composables/useLogger";
import eventBus from "../utils/eventBus";
import { useAppStore } from "./app";

const logger = useLogger();

export const useSocketsStore = defineStore("sockets", () => {
    const app = useAppStore();

    const connection = ref<WebSocket | null>(null);

    const connect = (token: string) => {
        const proto = app.backendProtocol === "https:" ? "wss:" : "ws:";
        connection.value = new WebSocket(`${proto}//${app.backendHost}?token=${token}`);

        connection.value.onopen = () => {
            logger.info("Подключено");
        };
        connection.value.onmessage = async (event) => {
            logger.info(event.data);
            eventBus.emit("serverMessage", JSON.parse(event.data));
        };
        connection.value.onclose = () => {
            logger.info("Отключено");
            connection.value = null;
        };
    };

    const close = () => {
        connection.value?.close();
        connection.value = null;
    };

    const send = (message: any) => {
        if (!connection.value) {
            logger.error("Данные не отправлены: нет подключения");
            return;
        }
        connection.value.send(JSON.stringify(message));
    };

    return {
        connection,
        connect,
        close,
        send,
    };
});