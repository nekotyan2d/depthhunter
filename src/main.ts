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
import JoinChannelPage from "./pages/join-channel.vue";
import NewMessagePage from "./pages/new-message.vue";
import MessagesPage from "./pages/messages.vue";

const routes = [
    { path: "/chat", component: ChatPage },
    { path: "/", component: GamePage },
    { path: "/settings", component: SettingsPage },
    { path: "/registration", component: RegistrationPage },
    { path: "/join-channel", component: JoinChannelPage },
    { path: "/new-message", component: NewMessagePage },
    { path: "/messages", component: MessagesPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).use(pinia).mount("#app");