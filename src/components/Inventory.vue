<template>
    <div class="background" @click.self="onBackgroundClick">
        <div class="inventory">
            <header>
                <div class="title">Инвентарь</div>
                <button class="close" @click="game.openInventory(false)">
                    <Icon icon="pixelarticons:close" height="24px" width="24px"/>
                </button>
            </header>
            <div class="slot-grid">
                <Slot 
                    v-for="(slot, i) in inventory" 
                    :slot="slot" 
                    :key="`slot_${i}`" 
                    :selected="i === draggedItemIndex"
                    @click="game.moveItem(i)"/>
                
            </div>
            <Crafting/>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';
import Crafting from './Crafting.vue';
import Slot from './Slot.vue';
import { Icon } from "@iconify/vue";

const game = useGameStore();

const { inventory, draggedItemIndex } = storeToRefs(game);

function onBackgroundClick(){
    if(draggedItemIndex.value != null){
        
    }
}

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
    z-index: 99;

    .inventory {
        background-color: var(--color-bg);
        border-radius: 2px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        gap: 8px;
        width: 100vw;
        max-width: 400px;
        max-height: 100vh;
        max-height: 100dvh;

        header {
            display: flex;
            align-items: center;
            width: 100%;

            .title {
                font-size: 1.1rem;
                flex: 1;
            }

            .close {
                background-color: transparent;
                border: none;
                outline: none;
                color: var(--color-hint);
                cursor: pointer;
            }
        }

        .slot-grid{
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            grid-template-rows: repeat(3, 1fr);
            width: 100%;

            .slot {
                border: 1px solid var(--color-bg-secondary);
            }
        }
    }
}
</style>