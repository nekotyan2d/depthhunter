<template>
    <div class="messages">
        <div v-for="message in messages" class="message">{{ message.text }}</div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { useChatStore } from '../stores/chat';
import { storeToRefs } from 'pinia';

const chat = useChatStore();
const { messages } = storeToRefs(chat);


</script>