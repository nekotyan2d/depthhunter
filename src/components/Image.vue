<template>
    <img v-show="!loading" ref="image">
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Assets from '../game/assets';

const props = defineProps<{
    src: string
}>();

const image = ref<HTMLImageElement | null>(null);
const loading = ref(true);

onMounted(async () => load())

watch(() => props.src, () => load());

async function load(){
    loading.value = true;
    if (!image.value) return;

    const blob = await Assets.loadAsset(props.src);

    const url = URL.createObjectURL(blob);
    image.value.src = url;

    loading.value = false;
}

</script>