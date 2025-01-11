<template>
    <div class="map">
        <div class="fps" v-if="fps">{{ fps }}</div>
        <div class="coordinates" v-if="game.currentPlayer">{{ game.currentPlayer.x }}:{{ game.currentPlayer.z }}</div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import * as THREE from "three";

import { useGameStore } from '../stores/game';
import { storeToRefs } from 'pinia';

import eventBus from '../utils/eventBus';

const game = useGameStore();
const { scene, camera, renderer, fps, texturesLoaded } = storeToRefs(game);

const BOTTOM_BAR_HEIGHT = 50;

onMounted(() => {
    scene.value = new THREE.Scene();
    camera.value = new THREE.PerspectiveCamera(100, window.innerWidth / (window.innerHeight - BOTTOM_BAR_HEIGHT), 0.1, 1000);
    renderer.value = new THREE.WebGLRenderer();

    camera.value.position.set(2, 5, 2);
    camera.value.lookAt(2, 0, 2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    ambientLight.position.set(0, 1, 0);
    scene.value.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff9c4, 0.1); // Тёплый свет
    directionalLight.position.set(0, 1, 0); // Источник света сверху
    directionalLight.castShadow = true; // Источник света создаёт тени
    // directionalLight.shadow.mapSize.width = 1024; // Размер карты теней
    // directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;

    scene.value.add(directionalLight);

    renderer.value.setSize(window.innerWidth, window.innerHeight - BOTTOM_BAR_HEIGHT);
    const mapElement = document.querySelector(".map");

    if(mapElement){
        mapElement.appendChild(renderer.value.domElement);

        eventBus.on("texturesLoaded", () => {
            gameInit();
            eventBus.off("texturesLoaded");
        })

        if (texturesLoaded.value){
            gameInit();
        }
    }
    window.addEventListener("pointerdown", game.onPointerDown);
    window.addEventListener("pointerup", game.onPointerUp);
    window.addEventListener("resize", onWindowResize);
})

onUnmounted(() => {
    window.removeEventListener("pointerdown", game.onPointerDown);
    window.removeEventListener("pointerup", game.onPointerUp);
    window.removeEventListener("resize", onWindowResize);
})

function gameInit(){
    game.initPlatform();
    game.render();
}

function onWindowResize() {
    if(!(camera.value && renderer.value)) return;
    camera.value.aspect = window.innerWidth / (window.innerHeight - BOTTOM_BAR_HEIGHT);
    camera.value.updateProjectionMatrix();
    renderer.value.setSize(window.innerWidth, window.innerHeight - BOTTOM_BAR_HEIGHT);
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
    user-select: none;
    right: 0;
    bottom: 0;
}

.fps {
    position: absolute;
    user-select: none;
    left: 0;
    bottom: 0;
}
</style>