<template>
    <img v-show="!loading" ref="image">
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useAssetsStore } from '../stores/assets';

const { loadAsset } = useAssetsStore();

const props = defineProps<{
    src: string
}>();

const image = ref<HTMLImageElement | null>(null);
const loading = ref(true);

onMounted(async () => load())

watch(() => props.src, () => load());

async function load(){
    loading.value = true;
    let src;
    try {
        new URL(props.src);
        src = props.src;
    } catch (error) {
        src = `${window.location.protocol}//${window.location.host}/${props.src}`;
    }
    if (!image.value) return;

    const blob = await loadAsset(src);

    const url = URL.createObjectURL(blob);
    image.value.src = url;

    loading.value = false;
}

</script>