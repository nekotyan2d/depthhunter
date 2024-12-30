<template>
    <button><slot/></button>
</template>

<style lang="scss" scoped>
button {
    outline: none;
    border: none;
    border-radius: 16px;
    background-color: var(--color-btn);
    color: var(--color-btn-text);
    padding: 8px 16px;
    cursor: pointer;
    height: 40px;

    &[disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>