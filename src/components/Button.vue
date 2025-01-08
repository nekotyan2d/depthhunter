<template>
    <button><slot/></button>
</template>

<style lang="scss" scoped>
button {
    outline: none;
    border: none;
    background-color: var(--color-btn);
    color: var(--color-btn-text);
    padding: 8px 16px;
    cursor: pointer;
    height: 40px;
    font-family: inherit;
    box-shadow: inset -4px 4px 0 0 rgba(255, 255, 255, 0.2);
    border-radius: 1px;

    &[disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>