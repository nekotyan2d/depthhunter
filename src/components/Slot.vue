<template>
    <div class="slot" :class="{selected: props.selected}">
        <div class="item" v-if="props.slot">
            <img :src="imageUrl" draggable="false">
            <span v-if="props.slot.count > 1" class="count">{{ props.slot.count }}</span>
            <div v-if="props.slot.tool && durabilityPercent < 100" class="durability">
                <div class="progress" :class="durabilityStage" :style="{width: `${durabilityPercent}%`}"></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useAssetsStore } from '../stores/assets';
import { storeToRefs } from 'pinia';
const assets = useAssetsStore();

const { items } = storeToRefs(assets);

const props = defineProps<{
    slot: Slot | null;
    selected?: boolean;
}>();

const imageUrl = ref<string>("");

const durabilityPercent = computed(() => {
    if (props.slot && props.slot.tool) {
        return (props.slot.tool.damage / props.slot.tool.initialDurability) * 100;
    }
    return 100;
});

const durabilityStage = computed(() => {
    if (durabilityPercent.value > 75) {
        return "high";
    } else if (durabilityPercent.value > 50) {
        return "medium";
    } else if (durabilityPercent.value > 25) {
        return "low";
    }
    return "critical";
})

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

        .durability {
            position: absolute;
            left: 10%;
            right: 10%;
            bottom: 10%;
            height: 7%;
            width: 80%;
            background-color: var(--color-bg-secondary);

            .progress {
                height: 100%;

                &.high {
                    background-color: green;
                }

                &.medium {
                    background-color: yellow;
                }

                &.low {
                    background-color: orange;
                }

                &.critical {
                    background-color: red;
                }
            }
        }
    }
}
</style>