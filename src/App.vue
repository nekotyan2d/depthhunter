<template>
    <main>
		<RouterView/>
	</main>
	<BottomBar/>
    <Error v-if="app.$state.fatalError.occurred" :error="{message: app.$state.fatalError.message}"/>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import BottomBar from './components/BottomBar.vue';

import { useSocketsStore } from './stores/sockets';
import { useAppStore } from './stores/app.ts';

import { useLogger } from './composables/useLogger';
import Error from './components/App/Error.vue';

const sockets = useSocketsStore();
const app = useAppStore();

const logger = useLogger();

async function initTelegramApp() {
    try {
        const tg = window.Telegram.WebApp;
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

function loadTextures(){
    const blocks = {
        '1': { url: 'texture/stone.png' },
        '2': { url: 'texture/coal_ore.png' },
        '3': { url: 'texture/iron_ore.png' },
        '4': { url: 'texture/redstone_ore.png' },
        '5': { url: 'texture/gold_ore.png' },
        '6': { url: 'texture/lapis_ore.png' },
        '7': { url: 'texture/diamond_ore.png' },
        '8': { url: 'texture/emerald_ore.png' },
        '9': { url: 'texture/oak_log_top.png' },
        '10': { url: 'texture/cobblestone.png' },
        '11': { url: 'texture/oak_planks.png' },
        'destroy_stage_0': { url: 'texture/destroy_stage_0.png' },
        'destroy_stage_1': { url: 'texture/destroy_stage_1.png' },
        'destroy_stage_2': { url: 'texture/destroy_stage_2.png' },
        'destroy_stage_3': { url: 'texture/destroy_stage_3.png' },
        'destroy_stage_4': { url: 'texture/destroy_stage_4.png' },
        'destroy_stage_5': { url: 'texture/destroy_stage_5.png' },
        'destroy_stage_6': { url: 'texture/destroy_stage_6.png' },
        'destroy_stage_7': { url: 'texture/destroy_stage_7.png' },
        'destroy_stage_8': { url: 'texture/destroy_stage_8.png' },
        'destroy_stage_9': { url: 'texture/destroy_stage_9.png' }
    };

}

window.onload = () => initTelegramApp();
</script>

<style scoped>
main {
	height: 100vh;
	height: 100dvh;
	padding-bottom: 50px;
}
</style>
