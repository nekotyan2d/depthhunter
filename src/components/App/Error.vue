<template>
    <div>
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Cross%20Mark.webp" alt="Cross Mark" width="25" height="25" />
        <p>{{ error.message }}</p>
    </div>
</template>
<script lang="ts" setup>
defineProps<{
    error: {
        message: string,
        stack?: string
    }
}>()
</script>