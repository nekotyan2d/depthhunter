<template>
    <div class="background">
        <div class="inventory">
            <div v-for="chunk in chunks">
                <div v-for="row in chunk.chunk">
                    <div v-for="column in row">
                        {{ column.drops }}
                    </div>
                </div>
            </div>
            <!-- <div class="slot-grid">
                <div class="slot" v-for="i in inventory.length">
                    <div class="item" :key="i" v-if="inventory[i]">
                        {{ inventory[i] }}
                    </div>
                </div>
            </div> -->
        </div>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';

const game = useGameStore();

const { inventory, chunks } = storeToRefs(game);
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
        width: 400px;
        height: 300px;
        overflow: auto;

        .slot-grid{
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            grid-template-rows: repeat(3, 1fr);

            .slot {
                border: 1px solid var(--color-bg-secondary);
            }
        }
    }
}
</style>