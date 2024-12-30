<template>
    <div>
        <!-- TODO добавить настройки -->
        <!-- <div>
            <label for="chunkBorders">Показывать границы чанков</label>
            <input id="chunkBorders" type="checkbox" v-model="showChunkBorders" />
        </div> -->
        <!-- <div>
            <label for="scaleSize">Изменять масштаб карты</label>
            <input id="scaleSize" type="checkbox" v-model="modifyScaleSize" />
        </div> -->
    </div>
</template>
<script lang="ts" setup>
import { watch } from 'vue';
import { useGameStore } from '../stores/game';
import { storeToRefs } from 'pinia';

const game = useGameStore();

const { showChunkBorders, modifyScaleSize } = storeToRefs(game);

watch([showChunkBorders, modifyScaleSize], () => {
    localStorage.setItem("settings", JSON.stringify({ showChunkBorders: showChunkBorders.value, modifyScaleSize: modifyScaleSize.value }));
})
</script>