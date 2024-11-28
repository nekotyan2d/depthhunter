<template>
    <!-- <template v-if="app.$state.fatalError.occurred">
        <ErrorPage :error="{message: app.$state.fatalError.message}"/>
    </template>
    <template v-else> -->
        <main>
            <RouterView/>
        </main>
        <BottomBar/>
    <!-- </template> -->
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import BottomBar from './components/BottomBar.vue';

import { useSocketsStore } from './stores/sockets';
import { useAppStore } from './stores/app';
import { useGameStore } from './stores/game';

import { useLogger } from './composables/useLogger';
import ErrorPage from './pages/error.vue';

const sockets = useSocketsStore();
const app = useAppStore();
const game = useGameStore();

const logger = useLogger();
const router = useRouter();

async function initTelegramApp() {
    try {
        const tg = window.Telegram.WebApp;
        tg.SettingsButton.isVisible = true;
        tg.onEvent("settingsButtonClicked", () => {
            router.push('/settings');
        });
        tg.ready();

        const initData = tg.initData || '';
        const initDataUnsafe = tg.initDataUnsafe || {};

        const token = await verifyWithServer(initData);
        sockets.connect(token)
    } catch (error: any) {
        app.showFatalError(error);
    }
}

async function verifyWithServer(initData: string) {
    try {
        const response = await fetch(`https://${APP_BACKEND_URL}/api/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(data.response?.description || 'Authentication failed');
        }

        return data.response?.token;
    } catch (error: any) {
        app.showFatalError(error);
    }
}

logger.info('Начало загрузки текстур');
game.loadTextures().then(() => logger.info('Текстуры загружены'));

window.onload = () => initTelegramApp();
</script>

<style scoped>
main {
	height: 100vh;
	height: 100dvh;
	padding-bottom: 50px;
}
</style>
