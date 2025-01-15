import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import "./assets/scss/app.scss";

import App from "./App.vue";

import { createPinia } from "pinia";
const pinia = createPinia();

import ChatPage from "./pages/chat.vue";
import GamePage from "./pages/index.vue";
import SettingsPage from "./pages/settings.vue";
import RegistrationPage from "./pages/registration.vue";

const routes = [
    { path: "/chat", component: ChatPage },
    { path: "/", component: GamePage },
    { path: "/settings", component: SettingsPage },
    { path: "/registration", component: RegistrationPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).use(pinia).mount("#app");