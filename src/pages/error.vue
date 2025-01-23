<template>
    <div class="error">
        <Image src="/img/cross.webp" alt="Error occurred" width="150" height="150" />
        <p>{{ error.message }}</p>
        <Button @click="refresh">Перезагрузить</Button>
    </div>
</template>
<script lang="ts" setup>
import Image from '../components/Image.vue';
import Button from '../components/Button.vue';

function refresh(){
    window.location.reload();
}

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