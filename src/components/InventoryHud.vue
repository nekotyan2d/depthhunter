<template>
    <div class="inventory-hud">
        <div class="slot">
            <div v-if="hand" class="item">
                <img />
                <span class="count">{{ hand.count }}</span>
            </div>
        </div>
        <div class="slot" @click="showInventory = !showInventory">
            <Icon icon="pixelarticons:more-horizontal" height="1.1rem" width="1.1rem" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';

import { Icon } from "@iconify/vue";

const game = useGameStore();

const { hand, showInventory } = storeToRefs(game);

// watch(inventory, () => {
//     for (let i = 0; i < 9; i++) {
//         if (!inventory.value[i]) continue;
//         getItemTexture(inventory.value[i]!.id).then((texture) => {
//             console.log(texture);
//             itemElements.value[i].src = texture;
//         });
//     }
// });

// async function getItemTexture(item: number) {
//     //@ts-ignore
//     const texture: {url: string} = Textures.blocks[item.toString()];

//     if (!texture) {
//         return '';
//     }

//     const image: HTMLImageElement = await Textures.loadImage(texture.url);
//     return convertImageToBase64(image);
// }

// function convertImageToBase64(img: HTMLImageElement): string {
//     const canvas = document.createElement('canvas');
//     canvas.width = img.width;
//     canvas.height = img.height;
//     const ctx = canvas.getContext('2d');
//     if (ctx) {
//         ctx.drawImage(img, 0, 0);
//         return canvas.toDataURL('image/png');
//     }
//     return '';
// }

</script>
<style lang="scss" scoped>
.inventory-hud{
    display: flex;
    position: fixed;
    bottom: 60px;
    height: 40px;
    width: fit-content;
    z-index: 100;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);

    .slot {
        height: 40px;
        width: 40px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: center;

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