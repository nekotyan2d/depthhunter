<template>
    <input v-model="model">
</template>

<script lang="ts" setup>
const model = defineModel<string>();
</script>

<style lang="scss" scoped>
input {
    outline: none;
    border-radius: 2px;
    border: none;
    background-color: var(--color-bg-secondary);
    height: 40px;
    padding: 0 16px;
    font-size: 1rem;
    font-family: inherit;
}
</style>