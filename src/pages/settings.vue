<template>
    <div>
        <label for="chunkBorders">Показывать границы чанков</label>
        <input id="chunkBorders" type="checkbox" v-model="showChunkBorders" />
    </div>
</template>
<script lang="ts" setup>
import { useGameStore } from '../stores/game';
import { storeToRefs } from 'pinia';

const game = useGameStore();

const { showChunkBorders } = storeToRefs(game);
</script>