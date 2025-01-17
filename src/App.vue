<template>
    <template v-if="app.$state.fatalError.occurred">
        <ErrorPage :error="{message: app.$state.fatalError.message}" />
    </template>
    <template v-else>
        <div v-show="app.isLoading" class="loading">
            <div class="loader">
                <Image src="/img/loading.webp" alt="Загрузка" width="100" height="100" />
            </div>
            <div v-if="showLoadingText" class="text">Загрузка...</div>
        </div>
        <main v-show="!app.isLoading">
            <RouterView />
            <BottomBar />
        </main>
    </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import BottomBar from './components/BottomBar.vue';

import { useSocketsStore } from './stores/sockets';
import { useAppStore } from './stores/app';
import { useGameStore } from './stores/game';

import eventBus from './utils/eventBus';
import ErrorPage from './pages/error.vue';
import { storeToRefs } from 'pinia';
import Image from './components/Image.vue';

const sockets = useSocketsStore();
const app = useAppStore();
const game = useGameStore();

const { isLoading } = storeToRefs(app);
const { inGame } = storeToRefs(game);

const router = useRouter();
const route = useRoute();

const showLoadingText = ref(false);

async function initTelegramApp() {
    try {
        const tg = window.Telegram.WebApp;
        tg.SettingsButton.isVisible = true;
        tg.onEvent("settingsButtonClicked", () => {
            router.push('/settings');
        });
        tg.ready();

        const initData = tg.initData || '';
        app.initData = initData;

        const token = await verifyWithServer(initData);
        sockets.connect(token)
    } catch (error: any) {
        app.showFatalError(error);
    }
}

async function verifyWithServer(initData: string) {
    try {
        const response = await fetch(`https://${app.backendUrl}/api/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            switch(data.response.exception){
                case "ERR_ACCOUNT_NOT_FOUND":
                    router.replace("/registration");
                    isLoading.value = false;
                    break;
                default:
                    throw new Error(data.response?.description || 'Authentication failed');
            }
        }

        return data.response?.token;
    } catch (error: any) {
        app.showFatalError(error);
    }
}

const passedStages = ref(0);

eventBus.on("assetsLoaded", () => {
    passedStages.value++;
});

eventBus.on("gameStarted", () => {
    passedStages.value++;
});

eventBus.on("platformCreated", () => {
    passedStages.value++;
});

eventBus.on("accountCreated", () => {
    initTelegramApp();
    router.replace("/");
});

eventBus.on("fontLoaded", () => {
    showLoadingText.value = true;
})

watch(() => passedStages.value, (value) => {
    // скрываем экран загрузки при 3-х пройденных стадиях на странице игры и при одной на других страницах
    if ((value === 3 && route.path === "/") || (value === 1 && route.path !== "/")) {
        app.isLoading = false;
    }
});

if (route.path === "/") {
    inGame.value = true;
}

watch(() => route.path, () => {
    if (route.path === "/") {
        inGame.value = true;
    } else {
        inGame.value = false;
    }
})

window.onload = () => initTelegramApp();
</script>

<style lang="scss" scoped>
main {
	height: 100vh;
	height: 100dvh;
	padding-bottom: 50px;
    overflow-y: auto;
}

.loading {
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    width: 100dvw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .loader {
        height: 100px;
    }

    .text {
        height: 30px;
    }
}
</style>
