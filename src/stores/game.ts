import { defineStore } from "pinia";
import { ref } from "vue";

import { useLogger } from "../composables/useLogger";
const logger = useLogger();

export const useGameStore = defineStore("game", () => {
    const textures = ref<{ [key: string]: HTMLImageElement }>({});

    async function loadTextures() {
        const blocks = {
            "1": { url: "texture/stone.png" },
            "2": { url: "texture/coal_ore.png" },
            "3": { url: "texture/iron_ore.png" },
            "4": { url: "texture/redstone_ore.png" },
            "5": { url: "texture/gold_ore.png" },
            "6": { url: "texture/lapis_ore.png" },
            "7": { url: "texture/diamond_ore.png" },
            "8": { url: "texture/emerald_ore.png" },
            "9": { url: "texture/oak_log_top.png" },
            "10": { url: "texture/cobblestone.png" },
            "11": { url: "texture/oak_planks.png" },
            destroy_stage_0: { url: "texture/destroy_stage_0.png" },
            destroy_stage_1: { url: "texture/destroy_stage_1.png" },
            destroy_stage_2: { url: "texture/destroy_stage_2.png" },
            destroy_stage_3: { url: "texture/destroy_stage_3.png" },
            destroy_stage_4: { url: "texture/destroy_stage_4.png" },
            destroy_stage_5: { url: "texture/destroy_stage_5.png" },
            destroy_stage_6: { url: "texture/destroy_stage_6.png" },
            destroy_stage_7: { url: "texture/destroy_stage_7.png" },
            destroy_stage_8: { url: "texture/destroy_stage_8.png" },
            destroy_stage_9: { url: "texture/destroy_stage_9.png" },
        };
        const promises = Object.entries(blocks).map(async ([key, value]) => {
            try {
                textures.value[key] = await loadImage(value.url);
            } catch (error) {
                logger.error(`Не удалось загрузить текстуру: ${value.url}`);
            }
        });

        return Promise.all(promises);
    }

    function loadImage(url: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    return {
        loadTextures,
        loadImage,
    };
});
