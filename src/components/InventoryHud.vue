<template>
    <div class="inventory-hud">
        <Slot :slot="hand" :selected="draggedItemIndex == -1" @click="showInventory && game.moveItem(-1)"/>
        <div class="slot" @click="game.openInventory(!showInventory)">
            <Icon icon="pixelarticons:more-horizontal" height="1.1rem" width="1.1rem" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';

import { Icon } from "@iconify/vue";
import Slot from './Slot.vue';

const game = useGameStore();

const { hand, showInventory, draggedItemIndex } = storeToRefs(game);
</script>
<style lang="scss" scoped>
.inventory-hud{
    display: flex;
    position: fixed;
    bottom: 60px;
    height: 40px;
    width: fit-content;
    z-index: 100;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);

    .slot {
        height: 40px;
        width: 40px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>