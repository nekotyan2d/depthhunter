import eventBus from "../utils/eventBus";
import { useLogger } from "../composables/useLogger";

const logger = useLogger();

const request = indexedDB.open("assetsCacheDB", 1);
let db: IDBDatabase;

const waitDBInitialization = new Promise<void>((resolve, reject) => { 
    request.onupgradeneeded = () => {
        db = request.result;
        db.createObjectStore("assets", { keyPath: "path" });
    };

    request.onsuccess = () => {
        db = request.result;
        resolve();
    };

    request.onerror = () => {
        reject();
    };
});

let blockAssets: Record<string, BlockAssetSides> = {};
let playerAssets: Record<string, Blob> = {};
let itemAssets: Record<string, Blob> = {};

async function loadAssets() {
    logger.info("Начало загрузки ассетов");

    // загрузка шрифта
    new FontFace("Monocraft", "url(fonts/Monocraft.otf)").load().then((font) => {
        document.fonts.add(font);
        eventBus.emit("fontLoaded");
    });

    await waitDBInitialization;
    const promises: Promise<void>[] = [];
    // загрузка текстур блоков
    Object.entries(blocks).forEach(([id, sidePaths]) => {
        const sides: Partial<BlockAssetSides> = {};
        // проходим по всем сторонам блока
        const sidePromises = Object.entries(sidePaths).map(async ([side, path]) => {
            loadAsset(`textures/blocks/${path}.png`)
                .then((asset) => {
                    sides[side as keyof BlockAssetSides] = asset;
                })
                .catch(async () => {
                    sides[side as keyof BlockAssetSides] = await generateBrokenTexture();
                });
        });
        promises.push(
            Promise.all(sidePromises).then(() => {
                blockAssets[id] = sides as BlockAssetSides;
            })
        );
    });

    // загрузка текстур игроков
    Object.entries(players).forEach(async ([id, { url }]) => {
        const promise = loadAsset(`textures/other/${url}.png`)
            .then((asset) => {
                playerAssets[id] = asset;
            })
            .catch(async () => {
                playerAssets[id] = await generateBrokenTexture();
            });
        promises.push(promise);
    });

    // загрузка текстур предметов
    Object.entries(items).forEach(async ([id, { name }]) => {
        const promise = loadAsset(`textures/items/${name}.png`)
            .then((asset) => {
                itemAssets[id] = asset;
            })
            .catch(async () => {
                itemAssets[id] = await generateBrokenTexture();
            });
        promises.push(promise);
    });

    await Promise.all(promises);

    logger.info("Ассеты загружены");

    eventBus.emit("assetsLoaded");
}

function saveAsset(path: string, asset: Blob) {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").put({ path, asset });
}

function getAsset(path: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("assets", "readonly");
        const store = transaction.objectStore("assets").get(path);
        store.onsuccess = () => {
            if (store.result) {
                resolve(store.result.asset);
            } else {
                reject();
            }
        };
        store.onerror = () => reject;
    });
}

export async function loadAsset(path: string) {
    try {
        // пробуем взять файл из кэша
        const asset = await getAsset(path);
        return asset;
    } catch {
        // если файл не найден в кэше, загружаем его
        const response = await fetch(`${location.protocol}//${location.host}/${path}`);
        const asset = await response.blob();
        saveAsset(path, asset);
        return asset;
    }
}

function generateBrokenTexture(): Promise<Blob> {
    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d")!;

    const scale = 50;

    canvas.width = 8 * scale;
    canvas.height = 8 * scale;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0 * scale, 0 * scale, 4 * scale, 4 * scale);
    ctx.fillStyle = "#f800f8";
    ctx.fillRect(4 * scale, 0 * scale, 4 * scale, 4 * scale);
    ctx.fillStyle = "#f800f8";
    ctx.fillRect(0 * scale, 4 * scale, 4 * scale, 4 * scale);
    ctx.fillStyle = "#000000";
    ctx.fillRect(4 * scale, 4 * scale, 4 * scale, 4 * scale);
    
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => { 
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Ошибка создания текстуры"));
            }
        });
    })
}

// текстуры блоков
export const blocks = {
    "1": { main: "stone" },
    "2": { main: "coal_ore" },
    "3": { main: "iron_ore" },
    "4": { main: "redstone_ore" },
    "5": { main: "gold_ore" },
    "6": { main: "lapis_ore" },
    "7": { main: "diamond_ore" },
    "8": { main: "emerald_ore" },
    "9": { main: "oak_log_top" },
    "10": { main: "cobblestone" },
    "11": { main: "oak_planks" },
    "12": { main: "dirt" },
    "13": { main: "gravel" },
    destroy_stage_0: { main: "destroy_stage_0" },
    destroy_stage_1: { main: "destroy_stage_1" },
    destroy_stage_2: { main: "destroy_stage_2" },
    destroy_stage_3: { main: "destroy_stage_3" },
    destroy_stage_4: { main: "destroy_stage_4" },
    destroy_stage_5: { main: "destroy_stage_5" },
    destroy_stage_6: { main: "destroy_stage_6" },
    destroy_stage_7: { main: "destroy_stage_7" },
    destroy_stage_8: { main: "destroy_stage_8" },
    destroy_stage_9: { main: "destroy_stage_9" },
};

// текстуры игроков
export const players = {
    alex: { url: "alex" },
    steve: { url: "steve" },
};

// текстуры предметов
export const items = {
    1: { name: "cobblestone" },
    2: { name: "coal" },
    3: { name: "iron_ingot" },
    4: { name: "redstone" },
    5: { name: "gold_ingot"},
    6: { name: "lapis_lazuli" },
    7: { name: "diamond" },
    8: { name: "emerald" },
    9: { name: "oak_log" },
    10: { name: "stone" },
    11: { name: "oak_plank" },
    12: { name: "dirt" },
    13: { name: "gravel" },
    14: { name: "crafting_table" },
    15: { name: "furnace" },
    16: { name: "stick" },
    17: { name: "raw_iron" },
    18: { name: "raw_gold" },
    19: { name: "wooden_pickaxe" },
    20: { name: "wooden_axe" },
    21: { name: "wooden_shovel" },
    22: { name: "stone_pickaxe" },
    23: { name: "stone_axe" },
    24: { name: "stone_shovel" },
    25: { name: "iron_pickaxe" },
    26: { name: "iron_axe" },
    27: { name: "iron_shovel" },
    28: { name: "diamond_pickaxe" },
    29: { name: "diamond_axe" },
    30: { name: "diamond_shovel" },
};

export default {
    blockAssets,
    playerAssets,
    itemAssets,
    loadAssets,
    loadAsset
};
