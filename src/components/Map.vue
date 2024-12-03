<template>
    <div class="map">
        <canvas ref="canvas" id="map" @mousedown="onCanvasClick"></canvas>
        <div class="coordinates" v-if="game.currentPlayer">{{ game.currentPlayer.x }}:{{ game.currentPlayer.z }}</div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { useGameStore } from '../stores/game';
import { storeToRefs } from 'pinia';

const game = useGameStore();
const { scaleSize, mapSize } = storeToRefs(game);
const { draw, onCanvasClick } = game;

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
    if (!canvas.value) return;

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("wheel", updateScale);
})

onUnmounted(() => {
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("wheel", updateScale);
})

function updateScale(event: WheelEvent){
    if(event.deltaY > 0) {
        scaleSize.value += 1;
    } else {
        scaleSize.value -= 1;
    }

    scaleSize.value = Math.max(2, Math.min(scaleSize.value, 8));

    draw();
}

function resizeCanvas() {
    if (canvas.value == null) return;

    const size = Math.min(document.documentElement.clientWidth, window.innerHeight - 60);
    canvas.value.width = size;
    canvas.value.height = size;

    mapSize.value = size;

    draw();
}

</script>

<style lang="scss" scoped>
.map {
    display: flex;
    position: relative;
}
canvas {
    border: 1.5px solid red;
    margin: 0 auto;
}

.coordinates {
    position: absolute;
    right: 0;
    top: 0;
}
</style>