<template>
    <div class="slot" :class="{selected: props.selected}">
        <div class="item" v-if="props.slot">
            <Image :src="`/textures/${getFileName(props.slot.id)}.png`" draggable="false"/>
            <span v-if="props.slot.count > 1" class="count">{{ props.slot.count }}</span>
        </div>
    </div>
</template>
<script lang="ts" setup>
import Image from './Image.vue';

import { useAssetsStore } from '../stores/assets';
const assets = useAssetsStore();
const items = assets.items;

const props = defineProps<{
    slot: Slot | null;
    selected?: boolean;
}>();

function getFileName(id: number){
    if(id in items){
        return `items/${items[id as keyof typeof items].name}`;
    } else {
        return "other/broken_texture";
    }

}
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
        }

        .count {
            position: absolute;
            bottom: 0;
            right: 0;
            font-size: 0.8rem;
        }
    }
}
</style>