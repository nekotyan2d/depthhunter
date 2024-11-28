import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import "./assets/scss/app.scss";

import App from "./App.vue";

import { createPinia } from "pinia";
const pinia = createPinia();

import IndexPage from "./pages/index.vue";
import ChatPage from "./pages/chat.vue";
import GamePage from "./pages/game.vue";
import SettingsPage from "./pages/settings.vue";

const routes = [
    { path: '/', component: IndexPage},
    { path: '/chat', component: ChatPage},
    { path: '/game', component: GamePage},
    { path: '/settings', component: SettingsPage},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App)
    .use(router)
    .use(pinia)
    .mount("#app");
