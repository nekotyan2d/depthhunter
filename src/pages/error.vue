<template>
    <div class="error">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Cross%20Mark.webp" alt="Error occurred" width="150" height="150" />
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
<style lang="scss" scoped>
.error {
    height: 100vh;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    img {
        user-select: none;
    }
}
</style>