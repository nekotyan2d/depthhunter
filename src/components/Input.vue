<template>
    <input v-model="model">
</template>

<script lang="ts" setup>
const model = defineModel<string>();
</script>

<style lang="scss" scoped>
input {
    outline: none;
    border: 1.5px solid var(--color-bg-secondary);
    border-radius: 16px;
    background-color: transparent;
    height: 40px;
    padding: 0 16px;
    font-size: 1rem;
}
</style>