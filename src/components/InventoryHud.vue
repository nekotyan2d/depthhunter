<template>
    <div class="inventory-hud">
        <div class="slot" @click="game.moveItem(-1)">
            <div v-if="hand" class="item">
                <Image :src="`/textures/items/${items[hand.id as keyof typeof items].name}.png`" draggable="false"/>
                <span class="count">{{ hand.count }}</span>
            </div>
        </div>
        <div class="slot" @click="showInventory = !showInventory">
            <Icon icon="pixelarticons:more-horizontal" height="1.1rem" width="1.1rem" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';

import { Icon } from "@iconify/vue";
import Image from './Image.vue';

import { items } from '../game/assets';

const game = useGameStore();

const { hand, showInventory } = storeToRefs(game);
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

        .item {
            width: inherit;
            height: inherit;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 80%;
                height: 80%;
                display: block;
                image-rendering: pixelated;
            }

            .count {
                position: absolute;
                bottom: 0;
                right: 0;
                font-size: 0.8rem;
            }
        }
    }
}
</style>