<template>
    <div class="slot" :class="{selected: props.selected}">
        <div class="item" v-if="props.slot">
            <img :src="imageUrl" draggable="false">
            <span v-if="props.slot.count > 1" class="count">{{ props.slot.count }}</span>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { useAssetsStore } from '../stores/assets';
import { storeToRefs } from 'pinia';
const assets = useAssetsStore();

const { items } = storeToRefs(assets);

const props = defineProps<{
    slot: Slot | null;
    selected?: boolean;
}>();

const imageUrl = ref<string>("");

watch(() => props.slot, async (newSlot) => {
    if (newSlot) {
        const base64 = URL.createObjectURL(await assets.loadAsset(`/models/${items.value[newSlot.id].name}.png`));
        imageUrl.value = base64;
    } else {
        imageUrl.value = "";
    }
}, { immediate: true });
</script>
<style lang="scss" scoped>
.slot {
    border: 1px solid var(--color-bg-secondary);
    aspect-ratio: 1;

    &.selected {
        border-color: #c1c1c1!important;
    }

    .item {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            height: 80%;
            width: 80%;
            display: block;
            image-rendering: pixelated;

            &[src=""] {
                visibility: hidden;
            }
        }

        .count {
            position: absolute;
            bottom: 0;
            right: 0;
            font-size: 0.8rem;
            line-height: 0.8rem;
        }
    }
}
</style>