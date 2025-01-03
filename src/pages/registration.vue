<template>
    <div class="registration">
        <div class="welcome">Добро пожаловать в Depth Hunter! Придумай ник чтобы начать игру</div>
        <Input v-model="nick" placeholder="Ник"/>
        <div class="error-text" v-if="!saveAllowed && nick.length">Ник занят, придумай другой!</div>
        <div>Или выбери из предложенных:</div>
        <div class="proposals">
            <div class="item" v-for="proposal in proposals" @click="nick = proposal">{{ proposal }}</div>
        </div>
        <Button :disabled="!saveAllowed" @click="registerAccount">Сохранить</Button>
    </div>
</template>
<script lang="ts" setup>
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import { ref, watch } from "vue";

import { useLogger } from '../composables/useLogger';
import { useAppStore } from '../stores/app';
import { storeToRefs } from 'pinia';
import { ofetch } from 'ofetch';

import eventBus from '../utils/eventBus';

const logger = useLogger();
const app = useAppStore();

const { initData } = storeToRefs(app);

const nick = ref("");
const saveAllowed = ref(false);

const proposals = ref<string[]>([]);

if(initData.value) {
    getProposals();
}

watch(initData, () => initData.value && getProposals());

watch(nick, checkNick);

async function getProposals(){
    try {
        const data = await ofetch(`https://${import.meta.env.VITE_APP_BACKEND_URL}/api/nick/proposals`, {
            headers: { 'Content-Type': 'application/json' },
            query: {
                initData: initData.value
            }
        });

        proposals.value = data.response.proposal;

        if (!data || !data.ok) {
            throw new Error(data.response?.description || 'Registration failed');
        }

        return data.response?.token; 
    } catch (error) {
        logger.error(JSON.stringify(error));
    }
}

async function checkNick(){
    try {
        const response = await fetch(`https://${import.meta.env.VITE_APP_BACKEND_URL}/api/nick/check?nick=${nick.value}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if(data.response.available){
            saveAllowed.value = true;
        } else {
            saveAllowed.value = false;
        }

        if (!response.ok || !data.ok) {
            throw new Error(data.response?.description || 'Registration failed');
        }

        return data.response?.token; 
    } catch (error) {
        logger.error(JSON.stringify(error));
    }
}

async function registerAccount(){
    try {
        const data = await ofetch(`https://${import.meta.env.VITE_APP_BACKEND_URL}/api/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                nick: nick.value,
                initData: initData.value
            },
        });

        if (!data || !data.ok) {
            throw new Error(data.response?.description || 'Registration failed');
        }

        eventBus.emit("accountCreated", {});
    } catch (error) {
        logger.error(JSON.stringify(error));
    }
}

</script>

<style lang="scss" scoped>
.registration {
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .welcome {
        font-size: 1.1rem;
        margin-bottom: 8px;
    }

    .error-text {
        color: var(--color-text-destructive);
    }

    .proposals {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .item {
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid var(--color-text);
            cursor: pointer;
        }
    }
}
</style>