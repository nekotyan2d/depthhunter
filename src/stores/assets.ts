import { defineStore } from "pinia";
import eventBus from "../utils/eventBus";
import { useLogger } from "../composables/useLogger";
import { ofetch } from "ofetch";
import { ref } from "vue";
import { useAppStore } from "./app";

const logger = useLogger();

export const useAssetsStore = defineStore("assets", () => {
    const app = useAppStore();

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

    const playerAssets = ref<Record<string, Blob>>({});
    const objectAssets = ref<Record<string, BlockAssets>>({});

    const craftingRecipes = ref<Record<string, Recipe>>({});
    const smeltingRecipes = ref<Record<number, SmeltingRecipe>>({});
    const blocks = ref<Record<number, BlockParams>>({});
    const items = ref<Record<number, Item>>({});

    async function loadAssets() {
        logger.info("Начало загрузки ассетов");

        try {
            // загрузка шрифта
            new FontFace("Monocraft", "url(fonts/Monocraft.otf)").load().then((font) => {
                document.fonts.add(font);
                eventBus.emit("fontLoaded");
            });
            await waitDBInitialization;

            const response = await ofetch<AssetsResponse>(`${app.backendProtocol}//${app.backendHost}/api/assets`);
            if (!response || !response.ok) throw new Error("Ошибка загрузки ассетов");

            const { textures, assets } = response.response;

            const { blockTextures, itemTextures } = textures;

            blocks.value = assets.blocks;
            items.value = assets.items;
            craftingRecipes.value = assets.recipes;
            smeltingRecipes.value = assets.smelting;

            await fixCacheKeys(blockTextures, itemTextures);

            const promises: Promise<void>[] = [];

            // загрузка текстур блоков
            async function loadCubeAll(id: number, block: BlockTexturesAll) {
                const name = blocks.value[id].name;
                const all = await loadAsset(block.textures.all);
                objectAssets.value[name] = {
                    parent: "block/cube_all",
                    assets: { all },
                };
            }
            async function loadCubeSided(id: number, block: BlockTexturesSided) {
                const name = blocks.value[id].name;
                const up = await loadAsset(block.textures.up);
                const north = await loadAsset(block.textures.north);
                const west = await loadAsset(block.textures.west);
                const east = await loadAsset(block.textures.east);
                const south = await loadAsset(block.textures.south);
                objectAssets.value[name] = {
                    parent: "block/cube",
                    assets: { up, north, west, east, south },
                };
            }

            async function loadCubeColumn(id: number, block: BlockTexturesColumn) {
                const name = blocks.value[id].name;
                const end = await loadAsset(block.textures.end);
                const side = await loadAsset(block.textures.side);
                objectAssets.value[name] = {
                    parent: "block/cube_column",
                    assets: { end, side },
                };
            }

            Object.entries(blockTextures).forEach(async ([id, block]) => {
                switch (block.parent) {
                    case "block/cube_all":
                        promises.push(loadCubeAll(+id, block));
                        break;
                    case "block/cube":
                        promises.push(loadCubeSided(+id, block));
                        break;
                    case "block/cube_column":
                        promises.push(loadCubeColumn(+id, block));
                        break;
                }
            });

            // загрузка текстур игроков
            Object.entries(players).forEach(async ([id, { url }]) => {
                const promise = loadAsset(url).then((asset) => {
                    playerAssets.value[id] = asset;
                });
                promises.push(promise);
            });

            // загрузка текстур предметов
            async function loadItemHandheld(id: number, item: ItemsTextures) {
                const name = items.value[id].name;
                const layer0 = await loadAsset(item.textures.layer0);
                objectAssets.value[name] = {
                    parent: "item/handheld",
                    assets: { layer0 },
                };
            }

            async function generate3dModel(name: string, asset: BlockAssets) {
                const canvas = document.createElement("canvas");
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext("2d")!;
                ctx.imageSmoothingEnabled = false;

                const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
                    return new Promise<HTMLImageElement>((resolve) => {
                        const img = document.createElement("img");
                        img.src = URL.createObjectURL(blob);
                        img.onload = () => resolve(img);
                        img.onerror = async () => {
                            const brokenTexture = await generateBrokenTexture();
                            img.src = URL.createObjectURL(brokenTexture);
                        };
                    });
                };

                const drawCube = async (upBlob: Blob, leftBlob: Blob, rightBlob: Blob) => {
                    const up = await loadImage(upBlob);
                    const left = await loadImage(leftBlob);
                    const right = await loadImage(rightBlob);

                    // Draw top face
                    ctx.save();
                    ctx.transform(1, -0.5, 1, 0.5, 0, 8);
                    ctx.drawImage(up, 0, 0, 16, 16);
                    ctx.restore();

                    // Draw left face
                    ctx.save();
                    ctx.transform(1, 0.5, 0, 1, 0, 8);
                    ctx.filter = "brightness(70%)";
                    ctx.drawImage(left, 0, 0, 16, 16);
                    ctx.restore();

                    // Draw right face
                    ctx.save();
                    ctx.transform(1, -0.5, 0, 1, 16, 16);
                    ctx.filter = "brightness(50%)";
                    ctx.drawImage(right, 0, 0, 16, 16);
                    ctx.restore();
                };

                const drawItem = async (layer0: Blob) => {
                    const img = await loadImage(layer0);
                    ctx.drawImage(img, 0, 0, 32, 32);
                };
                switch (asset.parent) {
                    case "block/cube":
                        await drawCube(asset.assets.up, asset.assets.west, asset.assets.south);
                        break;
                    case "block/cube_column":
                        await drawCube(asset.assets.end, asset.assets.side, asset.assets.side);
                        break;
                    case "block/cube_all":
                        await drawCube(asset.assets.all, asset.assets.all, asset.assets.all);
                        break;
                    case "item/handheld":
                        await drawItem(asset.assets.layer0);
                        break;
                }
                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
                if (!blob) throw new Error("Failed to create blob from canvas");
                await saveAsset(`/models/${name}.png`, blob);
            }

            Object.entries(itemTextures).forEach(async ([id, item]) => {
                if (item.parent == "item/handheld") {
                    promises.push(loadItemHandheld(+id, item));
                }
            });

            await Promise.all(promises);

            async function generateAll3dModels() {
                const checkAsset = async (name: string, asset: BlockAssets) => {
                    try {
                        await getAsset(`/models/${name}.png`);
                    } catch (error) {
                        await generate3dModel(name, asset);
                    }
                };
                const generatePromises = Object.entries(objectAssets.value).map(([name, asset]) =>
                    checkAsset(name, asset)
                );
                await Promise.all(generatePromises);
            }

            await generateAll3dModels();

            async function loadDestroyStages() {
                const loadDestroyStage = async (n: number) => {
                    const name = `destroy_stage_${n}`;
                    objectAssets.value[name] = {
                        parent: "block/cube_all",
                        assets: { all: await loadAsset(`${import.meta.env.VITE_APP_STORAGE_URL}/${name}.png`) },
                    };
                };
                const promises: Promise<void>[] = [];
                for (let i = 0; i < 10; i++) {
                    promises.push(loadDestroyStage(i));
                }
                await Promise.all(promises);
            }

            await loadDestroyStages();

            logger.info("Ассеты загружены");

            eventBus.emit("assetsLoaded");
        } catch (error) {
            console.error(error);
            logger.error("Ошибка загрузки ассетов");
        }
    }

    async function fixCacheKeys(
        blockTextures: Record<number, BlockTextures>,
        itemTextures: Record<number, BlockTextures>
    ) {
        const totalTextures = Object.keys(blockTextures).length + Object.keys(itemTextures).length;

        const transaction = db.transaction("assets", "readwrite");
        const totalCacheRequest = transaction.objectStore("assets").count();

        const totalCache = await new Promise<number>(
            (resolve) => (totalCacheRequest.onsuccess = () => resolve(totalCacheRequest.result))
        );

        if (totalTextures != totalCache) {
            return clearAssets();
        }

        const keys = [
            ...Object.keys(blockTextures).map((id) => blocks.value[+id].name),
            ...Object.keys(itemTextures).map((id) => items.value[+id].name),
        ];

        const cacheKeys = await new Promise<string[]>((resolve) => {
            const transaction = db.transaction("assets", "readonly");
            const request = transaction.objectStore("assets").getAllKeys();
            request.onsuccess = () => resolve(request.result as string[]);
        });

        const hasInvalidKeys =
            keys.some((key) => !cacheKeys.includes(key)) || cacheKeys.some((key) => !keys.includes(key));

        if (hasInvalidKeys) {
            return clearAssets();
        }
    }

    function saveAsset(path: string, asset: Blob) {
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction("assets", "readwrite");
            const request = transaction.objectStore("assets").put({ path, asset });

            request.onsuccess = () => {
                transaction.oncomplete = () => resolve();
            };

            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        });
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

    function getAssetPath(url: string) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.replace(".png", "");
        } catch (error) {
            return url;
        }
    }

    async function loadAsset(url: string) {
        await waitDBInitialization;
        try {
            // пробуем взять файл из кэша
            const asset = await getAsset(getAssetPath(url));
            return asset;
        } catch {
            try {
                // если файл не найден в кэше, загружаем его
                const response = await fetch(url);
                const asset = await response.blob();
                await saveAsset(getAssetPath(url), asset);
                return asset;
            } catch (error) {
                return await generateBrokenTexture();
            }
        }
    }

    async function clearAssets() {
        const transaction = db.transaction("assets", "readwrite");
        const request = transaction.objectStore("assets").clear();

        return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
                transaction.oncomplete = () => resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    function generateBrokenTexture(): Promise<Blob> {
        const canvas = document.createElement("canvas");

        const ctx = canvas.getContext("2d")!;

        canvas.width = 8;
        canvas.height = 8;

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 4, 4);
        ctx.fillStyle = "#f800f8";
        ctx.fillRect(4, 0, 4, 4);
        ctx.fillStyle = "#f800f8";
        ctx.fillRect(0, 4, 4, 4);
        ctx.fillStyle = "#000000";
        ctx.fillRect(4, 4, 4, 4);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Ошибка создания текстуры"));
                }
            });
        });
    }

    // текстуры игроков
    const players = {
        alex: { url: `${import.meta.env.VITE_APP_STORAGE_URL}/other/alex.png` },
        steve: { url: `${import.meta.env.VITE_APP_STORAGE_URL}/other/steve.png` },
    };

    loadAssets();

    return {
        playerAssets,
        objectAssets,

        blocks,
        items,
        craftingRecipes,
        smeltingRecipes,

        loadAssets,
        loadAsset,
        clearAssets,
        generateBrokenTexture,
    };
});
