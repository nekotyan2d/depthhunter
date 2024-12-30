<template>
    <div class="inventory">
        <div class="slot" v-for="i in 9">
            <div v-if="inventory[i]" class="item" :key="i">
                <img :alt="`item_${i}`" ref="itemElements" />
                <span class="count">{{ inventory[i].count }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { watch, ref } from 'vue';

import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';

import Textures from '../game/textures';

const game = useGameStore();

const { inventory } = storeToRefs(game);

const itemElements = ref<HTMLImageElement[]>([]);

watch(inventory, () => {
    for (let i = 0; i < 9; i++) {
        if (!inventory.value[i]) continue;
        getItemTexture(inventory.value[i]!.id).then((texture) => {
            console.log(texture);
            itemElements.value[i].src = texture;
        });
    }
});

async function getItemTexture(item: number) {
    //@ts-ignore
    const texture: {url: string} = Textures.blocks[item.toString()];

    if (!texture) {
        return '';
    }

    const image: HTMLImageElement = await Textures.loadImage(texture.url);
    return convertImageToBase64(image);
}

function convertImageToBase64(img: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }
    return '';
}

</script>
<style lang="scss" scoped>
.inventory{
    display: flex;
    position: fixed;
    bottom: 60px;
    background-color: rgba(0, 0, 0, 0.5);
    height: 40px;
    width: fit-content;
    z-index: 100;
    left: 0;
    right: 0;

    .slot {
        height: 40px;
        width: 40px;
        background-color: red;
        border: 1px solid black;

        .item {
            width: inherit;
            height: inherit;
            position: relative;

            img {
                width: 100%;
                height: 100%;
                display: block;
            }

            .count {
                position: absolute;
                bottom: 0;
                right: 0;
            }
        }
    }
}
</style>