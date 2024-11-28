<template>
    <canvas ref="canvas" width="1000" height="1000"></canvas>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const isPressing = ref(false);
const startTime = ref(0); // время начала нажатия
const startBlock = ref<Block | null>(null); // начальный блок
const clampInterval = ref<NodeJS.Timeout | null>(null); // интервал для зажатия
const blockSize = 200; // размер блока

interface Block {
    x: number;
    y: number;
}

onMounted(() => {
    if (!canvas.value) return;

    ctx.value = canvas.value.getContext('2d');
    if (!ctx) return;

    canvas.value.addEventListener('mousedown', startPress);
    canvas.value.addEventListener('mousemove', movePress);
    canvas.value.addEventListener('mouseup', endPress);

    canvas.value.addEventListener('touchstart', (event) => {
        event.preventDefault();
        startPress(event);
    });
    canvas.value.addEventListener('touchmove', (event) => {
        event.preventDefault();
        movePress(event);
    });
    canvas.value.addEventListener('touchend', endPress);
})

function clicking(block: Block) {
    console.log(`Вызов функции clicking() на блоке: ${JSON.stringify(block)}`);
}

function clamping(block: Block) {
    console.log(`Вызов функции clamping() на блоке: ${JSON.stringify(block)}`);
}

function getCanvasCoordinates(event: TouchEvent | MouseEvent) {
    const rect = canvas.value!.getBoundingClientRect();
    const scaleX = canvas.value!.width / rect.width;
    const scaleY = canvas.value!.height / rect.height;

    let clientX, clientY;

    if(event instanceof TouchEvent) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
        x: Math.floor((clientX - rect.left) * scaleX),
        y: Math.floor((clientY - rect.top) * scaleY)
    }
}

function getBlockIndex(x: number, y: number) {
    return {
        x: Math.floor(x / blockSize),
        y: Math.floor(y / blockSize)
    }
}

function startPress(event: TouchEvent | MouseEvent){
    if(isPressing.value) return;

    isPressing.value = true;
    startTime.value = performance.now();
    const { x, y } = getCanvasCoordinates(event);
    startBlock.value = getBlockIndex(x, y);

    clampInterval.value = setInterval(() => {
        clampInterval.value = setInterval(() => clamping(startBlock.value!), 500)
        clamping(startBlock.value!);
    }, 500);
}

function movePress(event: TouchEvent | MouseEvent){
    if(!isPressing.value) return;

    const { x, y } = getCanvasCoordinates(event);
    const currentBlock = getBlockIndex(x, y);

    if(currentBlock.x !== startBlock.value!.x || currentBlock.y !== startBlock.value!.y) {
        finishPress(event);
    }
}

function finishPress(event: TouchEvent | MouseEvent){
    const duration = performance.now() - startTime.value;
    const pressType = duration > 500 ? 'clamping' : 'clicking';

    if(clampInterval.value) {
        clearInterval(clampInterval.value);
        clampInterval.value = null;
    }

    if(pressType === 'clicking') {
        clicking(startBlock.value!);
    }

    isPressing.value = false;
    startBlock.value = null;
}

function endPress(event: TouchEvent | MouseEvent){
    if(!isPressing.value) return;
    finishPress(event);
}

</script>