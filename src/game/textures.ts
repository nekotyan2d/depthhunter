// текстуры блоков
export const blocks = {
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
    "12": { url: "texture/dirt.png" },
    "13": { url: "texture/gravel.png" },
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

// текстуры игроков
export const players = {
    alex: { url: "texture/alex.png" },
    steve: { url: "texture/steve.png" },
};

export function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

export default {
    blocks,
    players,
    loadImage
};