import { defineStore } from "pinia";
import { ref } from "vue";

import { useLogger } from "../composables/useLogger";
import { useSocketsStore } from "./sockets";

import eventBus from "../utils/eventBus";

const logger = useLogger();

export const useGameStore = defineStore("game", () => {
    const { send } = useSocketsStore();

    const textures = ref<{ [key: string]: HTMLImageElement }>({});

    const chunks = ref<{[key: string]: Chunk}>({});
    const players = ref<{[key: string]: Player}>({});

    const currentPlayer = ref<Player | null>(null);
    let broken = ref<any>(null); // TODO заменить any на Block

    const chunkSize = 5;
    const mapSize = ref(initialMapSize());
    const scaleSize = ref(7);

    const showChunkBorders = ref(false);
    

    eventBus.on('serverMessage', async (data: ServerMessage) => {
        await handleServerMessage(data);
    });

    async function loadTextures() {
        logger.info("Начало загрузки текстур");
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
        const promises = Object.entries(blocks).map(async ([key, value]) => {
            try {
                textures.value[key] = await loadImage(value.url);
            } catch (error) {
                logger.error(`Не удалось загрузить текстуру: ${value.url}`);
            }
        });

        const results = await Promise.allSettled(promises);
        const successfulPromises = results.filter(p => p.status === "fulfilled")

        logger.info(`Загружено ${successfulPromises.length} (${(successfulPromises.length / promises.length) * 100}%) текстур`);
        eventBus.emit('texturesLoaded', {
            total: promises.length,
            loaded: successfulPromises.length 
        });

        return results;
    }

    function loadImage(url: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    let firstRender = true;
    const handleServerMessage = async (data: ServerMessage) => {
        if (data.type === 'start') {
            currentPlayer.value = data.result.my_self;
    
            const players = data.result.players;
            for (const key in players) {
                if (players.hasOwnProperty(key)) {
                    updatePlayer(players[key]);
                }
            }
    
            const chunks = data.result.chunks;
            for (const key in chunks) {
                if (chunks.hasOwnProperty(key)) {
                    addChunk(chunks[key]);
                }
            }
        } else if (data.type === 'move') {
            const movedPlayer = data.result.player;
            if (currentPlayer.value && currentPlayer.value.uuid === movedPlayer.uuid) {
                broken.value = null;
    
                currentPlayer.value = movedPlayer;
    
                const players = data.result.players;
                for (const key in players) {
                    if (players.hasOwnProperty(key)) {
                        updatePlayer(players[key]);
                    }
                }
    
                const escape_players = data.result.escape_players;
                for (const key in escape_players) {
                    if (escape_players.hasOwnProperty(key)) {
                        deletePlayer(escape_players[key].uuid);
                    }
                }
    
                const chunks = data.result.chunks;
                for (const key in chunks) {
                    if (chunks.hasOwnProperty(key)) {
                        addChunk(chunks[key]);
                    }
                }

                const playerChunk = getPlayerChunk(movedPlayer);
                removeOutOfViewChunks(playerChunk);

                draw();
            } else {
                if (data.result.escape) {
                    deletePlayer(movedPlayer.uuid);
                } else {
                    updatePlayer(movedPlayer);
                }
            }
        } else if (data.type === 'break') {
            broken.value = data.result;
    
            if (broken.value.broken) {
                await editBlock(broken.value.block.x, broken.value.block.z, 0);
    
                broken.value = null;
            }
    
            await draw();
        } else if (data.type === 'broken') {
            const block = data.result.block;
    
            if (broken.value.block == block) {
                broken.value = null;
            }
    
            await editBlock(block.x, block.z, 0);
        } else if (data.type === 'msg') {
            logger.log(data.result.text);
        } else if (data.type === 'connect_player') {
            updatePlayer(data.result.player);
        } else if (data.type === 'disconnect_player') {
            deletePlayer(data.result.player);
        } else if(data.type == "error"){
            logger.error(data.result.description);
        }
    };

    function removeOutOfViewChunks(playerChunk: Pick<Chunk, 'x' | 'z'>) {
        const visibleChunks = new Set<string>();
    
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                const chunkX = playerChunk.x + x;
                const chunkZ = playerChunk.z + z;
                visibleChunks.add(`${chunkX}:${chunkZ}`);
            }
        }
    
        for (const key in chunks.value) {
            if (chunks.value.hasOwnProperty(key) && !visibleChunks.has(key)) {
                delete chunks.value[key];
            }
        }
    }

    function getPlayerChunk(player: Player): {x: number, z: number} {
        const x = player.x;
        const z = player.z;
    
        const chunkX = Math.floor(x / chunkSize);
        const chunkZ = Math.floor(z / chunkSize);
    
        return {x: chunkX, z: chunkZ};
    }

    async function addChunk(chunk: Chunk) {
        chunks.value[`${chunk.x}:${chunk.z}`] = chunk;
        await draw();
    }
    
    async function updatePlayer(player: Player) {
        players.value[player.uuid] = player;
        await draw();
    }
    
    async function deletePlayer(uuid: string) {
        delete players.value[uuid];
        await draw();
    }
    
    async function editBlock(x: number, z: number, block: number) {
        const chunkX = Math.floor(x / 5);
        const chunkZ = Math.floor(z / 5);
    
        const key = `${chunkX}:${chunkZ}`;
        const chunk = chunks.value[key];
    
        const blockX = ((x % 5) + 5) % 5;
        const blockZ = ((z % 5) + 5) % 5;
    
        chunk.chunk[blockX][blockZ] = block;
    
        await draw();
    }

    async function getBlock(block: number) {
        const id = block.toString();
        if (!(id in textures.value)) {
            textures.value[id] = await loadImage(`texture/${id}.png`);
        }
        return textures.value[id];
    }
    
    function getBreakingStage(maxValue: number, currentValue: number) {
        if (currentValue >= maxValue) return 9;
        if (currentValue <= 0) return 0;
        return Math.floor((currentValue / maxValue) * 9);
    }

    function onCanvasClick(event: MouseEvent) {
        const canvas = getCanvas();
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const blockCoordinates = getBlockCoordinatesFromClick(x, y);
        if (blockCoordinates) {
            const { blockX, blockZ } = blockCoordinates;

            const playerX = currentPlayer.value!.x;
            const playerZ = currentPlayer.value!.z;
    
            if (getBlockMaterial(blockX, blockZ) !== 0 && ((blockX === playerX && Math.abs(blockZ - playerZ) === 1) || 
                (blockZ === playerZ && Math.abs(blockX - playerX) === 1))) {
                const side = getBlockSideFromPlayer(playerX, playerZ, blockX, blockZ);

                send({ type: 'break', data: { side } });
            }
        }
    }

    function getBlockSideFromPlayer(playerX: number, playerZ: number, blockX: number, blockZ: number): string {
        if (blockX === playerX) {
            if (blockZ > playerZ) {
                return 'down';
            } else {
                return 'up';
            }
        } else if (blockZ === playerZ) {
            if (blockX > playerX) {
                return 'right';
            } else {
                return 'left';
            }
        }
        return 'unknown';
    }

    function getBlockMaterial(blockX: number, blockZ: number): number {
        const chunkX = Math.floor(blockX / chunkSize);
        const chunkZ = Math.floor(blockZ / chunkSize);
        const key = `${chunkX}:${chunkZ}`;
        const chunk = chunks.value[key];
    
        if (!chunk) return 0;
    
        const localBlockX = ((blockX % chunkSize) + chunkSize) % chunkSize;
        const localBlockZ = ((blockZ % chunkSize) + chunkSize) % chunkSize;
        return chunk.chunk[localBlockX][localBlockZ];
    }

    function getBlockCoordinatesFromClick(clickX: number, clickY: number) {
        const player = currentPlayer.value;
        if (!player) return null;
    
        const x = player.x;
        const z = player.z;
    
        const totalBlocks = (2 * scaleSize.value + 1);
        const squareSize = mapSize.value / totalBlocks;
    
        const blockX = Math.floor(clickX / squareSize) - scaleSize.value + x;
        const blockZ = Math.floor(clickY / squareSize) - scaleSize.value + z;
    
        return { blockX, blockZ };
    }

    function initialMapSize(): number{
        const bottomBarHeight = 60;
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = window.innerHeight;
        return Math.min(clientWidth, clientHeight - bottomBarHeight);
    }

    const steve = loadImage(`texture/steve.png`);
    const alex = loadImage(`texture/alex.png`);

    function getCanvas() {
        const canvas = document.querySelector<HTMLCanvasElement>('#map');
        if(!canvas) {
            logger.error('Не удалось найти canvas карты');
            return;
        }
        return canvas;
    }

    let lastSentTime = 0;
    const delay = 200;

    let action = 'move';

    document.addEventListener('keydown', (event) => {
        const currentTime = Date.now();
        if (currentTime - lastSentTime < delay) {
            return;
        }

        let side;
        switch (event.code) {
            case 'KeyW':
                side = 'up';
                break;
            case 'KeyA':
                side = 'left';
                break;
            case 'KeyS':
                side = 'down';
                break;
            case 'KeyD':
                side = 'right';
                break;
            case 'KeyQ':
                action = action == 'move' ? 'break' : 'move'
                break;
            default:
                return;
        }

        lastSentTime = currentTime;
        if (side) {
            const data = { type: action, data: { side } };
            send(data);
        } 
    });
    
    async function draw() {
        const renderStartedAt = Date.now();

        const canvas = getCanvas();
        if(!canvas) return;

        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        ctx.clearRect(0, 0, 800, 800);
        ctx.imageSmoothingEnabled = false;
    
        const player = currentPlayer.value;

        if (!player) return;
    
        const x = player.x;
        const z = player.z;


    
        const totalBlocks = (2 * scaleSize.value + 1);
        const squareSize = mapSize.value / totalBlocks;
    
        for (let i = -scaleSize.value; i <= scaleSize.value; i++) {
            for (let j = -scaleSize.value; j <= scaleSize.value; j++) {
                const _x = x + i;
                const _z = z + j;
    
                const chunkX = Math.floor(_x / 5);
                const chunkZ = Math.floor(_z / 5);
    
                const key = `${chunkX}:${chunkZ}`;
                const chunk = chunks.value[key];
    
                if (!chunk) continue;
    
                const blockX = ((_x % chunkSize) + chunkSize) % chunkSize;
                const blockZ = ((_z % chunkSize) + chunkSize) % chunkSize;
    
                const number = chunk.chunk[blockX][blockZ];
    
                if (number === 0) continue;
    
                const img = await getBlock(number);
    
                ctx.drawImage(
                    img,
                    (i + scaleSize.value) * squareSize,
                    (j + scaleSize.value) * squareSize,
                    squareSize,
                    squareSize
                );
            }
        }

        if(showChunkBorders.value){
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;

            for (let i = -scaleSize.value; i <= scaleSize.value; i++) {
                for (let j = -scaleSize.value; j <= scaleSize.value; j++) {
                    const _x = x + i;
                    const _z = z + j;

                    const chunkX = Math.floor(_x / chunkSize);
                    const chunkZ = Math.floor(_z / chunkSize);

                    const chunkStartX = (chunkX * chunkSize - x + scaleSize.value) * squareSize;
                    const chunkStartZ = (chunkZ * chunkSize - z + scaleSize.value) * squareSize;

                    ctx.strokeRect(chunkStartX, chunkStartZ, chunkSize * squareSize, chunkSize * squareSize);
                }
            }
        }
    
        for (const uuid in players.value) {
            const otherPlayer = players.value[uuid];
            const dx = otherPlayer.x - x;
            const dz = otherPlayer.z - z;
    
            const _x = dx + scaleSize.value;
            const _z = dz + scaleSize.value;
    
            if (Math.abs(dx) > scaleSize.value || Math.abs(dz) > scaleSize.value) continue;
            
            ctx.drawImage(
                await alex,
                _x * squareSize + squareSize / 4,
                _z * squareSize + squareSize / 4,
                squareSize / 2,
                squareSize / 2
            );
        }
    
        if (broken.value) {
            const dx = broken.value.block.x - x;
            const dz = broken.value.block.z - z;
    
            const _x = dx + scaleSize.value;
            const _z = dz + scaleSize.value;
            
            const n = getBreakingStage(broken.value.stability, broken.value.progress);
    
            const img = textures.value[`destroy_stage_${n}`];
    
            ctx.drawImage(
                img,
                _x * squareSize,
                _z * squareSize,
                squareSize,
                squareSize
            );
        }
    
        //if (self_show) {
            ctx.drawImage(
                await steve,
                scaleSize.value * squareSize + squareSize / 4,
                scaleSize.value * squareSize + squareSize / 4,
                squareSize / 2,
                squareSize / 2
            );
        //}

        if(firstRender){
            firstRender = false;

            const renderTime = Date.now() - renderStartedAt;
            logger.info(`firstRender: ${renderTime} мс`);
            eventBus.emit("gameStarted", { timeElapsed: renderTime });
        }
    }

    return {
        loadTextures,
        loadImage,
        handleServerMessage,
        draw,
        onCanvasClick,
        currentPlayer,
        scaleSize,
        mapSize,
        showChunkBorders,
    };
});
