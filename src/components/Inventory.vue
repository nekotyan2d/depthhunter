<template>
    <div class="background">
        <div class="inventory">
            <header>
                <div class="title">Инвентарь</div>
                <button @click="showInventory = !showInventory">x</button>
            </header>
            <div class="slot-grid">
                <div class="slot" v-for="(slot, i) in inventory" :key="`slot_${i}`">
                    <div class="item" v-if="slot">
                        <Image :src="`/textures/items/${items[slot.id as keyof typeof items].name}.png`" />
                        <div class="count">{{ slot.count }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';
import Image from './Image.vue';
import { items } from '../game/assets';

const game = useGameStore();

const { inventory, showInventory } = storeToRefs(game);
</script>
<style lang="scss" scoped>
.background {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 100;

    .inventory {
        background-color: var(--color-bg);
        border-radius: 2px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        gap: 8px;

        header {
            display: flex;
            align-items: center;
            width: 100%;

            .title {
                font-size: 1.1rem;
                flex: 1;
            }
        }

        .slot-grid{
            display: grid;
            grid-template-columns: repeat(9, 40px);
            grid-template-rows: repeat(3, 40px);

            .slot {
                border: 1px solid var(--color-bg-secondary);

                .item {
                    position: relative;
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    img {
                        height: 80%;
                        width: 80%;
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
    }
}
</style>