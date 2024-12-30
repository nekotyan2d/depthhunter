<template>
    <div class="game">
        <InventoryHud/>
        <Inventory v-show="showInventory"/>
        <Map/>
    </div>
</template>
<script lang="ts" setup>
import InventoryHud from '../components/InventoryHud.vue';
import Inventory from '../components/Inventory.vue';
import Map from '../components/Map.vue';

import { useGameStore } from '../stores/game';
import { storeToRefs } from 'pinia';
const game = useGameStore();

const { showInventory } = storeToRefs(game);
</script>
