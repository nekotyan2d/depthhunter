<template>
    <template v-if="app.$state.fatalError.occurred">
        <ErrorPage :error="{message: app.$state.fatalError.message}" />
    </template>
    <template v-else>
        <MessageBanner/>
        <div v-show="app.isLoading" class="loading">
            <div class="loader">
                <Image src="img/loading.webp" alt="Загрузка" width="100" height="100" />
            </div>
            <div v-if="showLoadingText" class="text">{{ stageLoadingTexts[currentStage] }}</div>
        </div>
        <main v-show="!app.isLoading">
            <RouterView />
            <BottomBar v-if="!['/registration', '/join-channel'].includes(route.path)"/>
        </main>
    </template>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import BottomBar from './components/BottomBar.vue';

import { useSocketsStore } from './stores/sockets';
import { useAppStore } from './stores/app';
import { useGameStore } from './stores/game';

import eventBus from './utils/eventBus';
import ErrorPage from './pages/error.vue';
import { storeToRefs } from 'pinia';
import Image from './components/Image.vue';
import MessageBanner from './components/MessageBanner.vue';

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

        tg.disableVerticalSwipes();
        tg.setHeaderColor("#212121");
        tg.setBackgroundColor("#212121");
        tg.setBottomBarColor("#212121");

        tg.requestFullscreen();
        
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
        const response = await fetch(`${app.backendProtocol}//${app.backendHost}/api/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            switch(data.response.exception){
                case "ERR_USER_NOT_IN_CHANNEL":
                    router.replace("/join-channel");
                    isLoading.value = false;
                    break;
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
        throw new Error(error.message || 'Authentication failed');
    }
}

const passedStages = ref({
    connection: false,
    assets: false,
    generationFinished: false,
    gameStarted: false,
});

const currentStage = computed(() => {
    const stages = passedStages.value;
    if(!stages.connection) return 0;
    if(!stages.assets) return 1;
    if(!stages.generationFinished) return 2;
    if(!stages.gameStarted) return 3;
    return 4;
})

const stageLoadingTexts = [
    "Подключение к серверу...",
    "Загрузка ресурсов...",
    "Генерация мира...",
    "Запуск...",
    "Почти готово"
];

eventBus.on("serverConnected", () => passedStages.value.connection = true);
eventBus.on("assetsLoaded", () => passedStages.value.assets = true);
eventBus.on("platformCreated", () => passedStages.value.generationFinished = true);
eventBus.on("gameStarted", () => passedStages.value.gameStarted = true);

eventBus.on("accountCreated", () => {
    initTelegramApp();
    router.replace("/");
});

eventBus.on("fontLoaded", () => {
    showLoadingText.value = true;
})

watch(() => passedStages.value, (value) => {
    // скрываем экран загрузки при всех пройденных стадиях на странице игры и при двух на других страницах
    if(route.path === "/"){
        if (value.connection && value.assets && value.generationFinished && value.gameStarted) {
            app.isLoading = false;
        }
    } else {
        if (value.connection && value.assets) {
            app.isLoading = false;
        }
    }
}, { deep: true });

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

if(isLoading.value && (window.location.pathname === "/registration" || window.location.pathname === "/join-channel")){
    window.location.pathname = "/";
}

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
