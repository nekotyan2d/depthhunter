import { defineStore, storeToRefs } from "pinia";
import { ref, toRaw } from "vue";

import * as THREE from "three";

import { useLogger } from "../composables/useLogger";
import { useSocketsStore } from "./sockets";
import { useAppStore } from "./app";
import { useChatStore } from "./chat";

import eventBus from "../utils/eventBus";
import Textures from "../game/textures";

const logger = useLogger();

export const useGameStore = defineStore("game", () => {
    const { send } = useSocketsStore();
    const { fatalError } = storeToRefs(useAppStore());

    const chat = useChatStore();
    const { messages } = storeToRefs(chat);

    const textures = ref<{ [key: string]: THREE.Texture }>({});

    const chunks = ref<{ [key: string]: Chunk }>({});
    const players = ref<{ [key: string]: Player }>({});
    const drops: { [key: string]: Slot[] } = {};
    const inventory = ref<(Slot | null)[]>([]);

    const showInventory = ref(false);

    const scene = ref<THREE.Scene | null>(null);
    const camera = ref<THREE.PerspectiveCamera | null>(null);
    const renderer = ref<THREE.Renderer | null>(null);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const textureLoader = new THREE.TextureLoader();

    const dropsGroup = new THREE.Group();
    dropsGroup.name = "drops";
    const playersGroup = new THREE.Group();
    playersGroup.name = "players";

    const currentPlayer = ref<Player | null>(null);
    const broken = ref<ServerMessageBreak["result"] | null>(null);

    const CHUNK_SIZE = 5;

    const assetsLoaded = ref(false);

    const inGame = ref(false);

    const settings = getSettings();
    const showChunkBorders = ref(settings.showChunkBorders);
    const modifyScaleSize = ref(settings.modifyScaleSize);

    eventBus.on("serverMessage", async (data: ServerMessage) => {
        await handleServerMessage(data);
    });

    async function loadAssets() {
        logger.info("Начало загрузки текстур");

        const promises = Object.entries({ ...Textures.blocks, ...Textures.players }).map(async ([key, value]) => {
            try {
                textures.value[key] = await textureLoader.loadAsync(value.url);
                // фильтры для улучшения текстур
                textures.value[key].magFilter = THREE.NearestFilter;
                textures.value[key].minFilter = THREE.NearestFilter;

                textures.value[key].name = key;
            } catch (error) {
                logger.error(`Не удалось загрузить текстуру: ${value.url}`);
                throw error;
            }
        });

        const results = await Promise.allSettled(promises);
        const successfulPromises = results.filter((p) => p.status === "fulfilled");

        logger.info(
            `Загружено ${successfulPromises.length} (${(successfulPromises.length / promises.length) * 100}%) текстур`
        );

        // замена отсутствующих текстур на пурпурно-черную текстуру
        Object.entries({ ...Textures.blocks, ...Textures.players }).map(async ([key]) => {
            if (textures.value[key]) return;
            textures.value[key] = generateBrokenTexture();
        });

        logger.info(
            `Исправлено ${promises.length - successfulPromises.length} (${
                ((promises.length - successfulPromises.length) / promises.length) * 100
            }%) текстур`
        );

        eventBus.emit("assetsLoaded");

        assetsLoaded.value = true;

        return results;
    }

    let playerMesh: THREE.Mesh | null = null;
    async function createPlayer() {
        const playerTexture = textures.value["steve"];

        playerTexture.magFilter = THREE.NearestFilter;
        playerTexture.minFilter = THREE.NearestFilter;

        const playerMaterial = new THREE.MeshStandardMaterial({
            map: playerTexture,
            transparent: true,
        });
        const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.castShadow = true;
        playerMesh.receiveShadow = true;
        scene.value!.add(playerMesh);
    }

    function addDropsGroup() {
        scene.value!.add(dropsGroup);
    }

    function addPlayersGroup() {
        scene.value!.add(playersGroup);
    }

    const cubes = new Array<{
        x: number;
        z: number;
        block: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    }>();

    // создание чанка (5x5 блоков)
    function createPlatform(xChunk: number, zChunk: number) {
        const size = 2;

        for (let y = 0; y < 2; y++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const _z = zChunk * CHUNK_SIZE + z - size;
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    const _x = xChunk * CHUNK_SIZE + x - size;

                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({
                        map: textures.value["1"],
                        transparent: true,
                    });

                    const block = new THREE.Mesh(geometry, material);
                    block.name = `block_${_x}_${_z}`;

                    block.castShadow = true;
                    block.receiveShadow = true;

                    block.position.set(_x + size, y, _z + size);

                    scene.value!.add(block);

                    if (y === 1) cubes.push({ x: _x, z: _z, block });
                }
            }
        }
    }
    // создание платформы (3x3 чанка)
    function initPlatform() {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                createPlatform(i, j);
            }
        }
        createPlayer();
        // createChunkBorders(showChunkBorders.value);

        // добавление групп объектов
        addDropsGroup();
        addPlayersGroup();
    }

    let platformCreated = false;

    function updateTextures() {
        const player = currentPlayer.value;

        if (!player) return;

        const playerX = player.x;
        const playerZ = player.z;

        cubes.forEach((cube) => {
            const { x: cubeX, z: cubeZ, block } = cube;

            const x = playerX + cubeX;
            const z = playerZ + cubeZ;

            const chunkX = Math.floor(x / CHUNK_SIZE);
            const chunkZ = Math.floor(z / CHUNK_SIZE);

            const key = `${chunkX}:${chunkZ}`;
            const chunk = chunks.value[key];

            let texture = null;
            if (chunk) {
                const localBlockX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const localBlockZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const coordinates = chunk.chunk[localBlockX][localBlockZ];

                block.userData = { x, z };

                if (coordinates !== 0) {
                    texture = textures.value[coordinates];
                    if (!platformCreated) {
                        platformCreated = true;
                        eventBus.emit("platformCreated", {});
                        logger.info("Платформа собрана");
                    }
                }

                if (broken.value && broken.value.block.x === x && broken.value.block.z === z) {
                    const n = getBreakingStage(broken.value.hardness, broken.value.progress);

                    block.material.alphaMap = textures.value[`destroy_stage_${n}`];
                } else {
                    block.material.alphaMap = null;
                }
            }

            if (texture) {
                block.visible = true;
                block.material.map = texture;
            } else {
                block.visible = false;
            }

            block.material.needsUpdate = true;
        });
    }

    const dropMeshes: { [key: string]: THREE.Mesh } = {};

    function updateDrops() {
        const player = currentPlayer.value;
        if (!player) return;

        const playerX = player.x;
        const playerZ = player.z;

        const playerSceneX = playerMesh!.position.x;
        const playerSceneZ = playerMesh!.position.z;

        Object.entries(drops).forEach(([coordinates, chunkDrops]) => {
            const [x, z] = coordinates.split(":").map((i) => parseInt(i));

            const chunkX = Math.floor(x / CHUNK_SIZE);
            const chunkZ = Math.floor(z / CHUNK_SIZE);

            const chunkKey = `chunk_${chunkX}_${chunkZ}`;
            let chunkDropGroup = dropsGroup.getObjectByName(chunkKey) as THREE.Group;
            if (!chunkDropGroup) {
                chunkDropGroup = new THREE.Group();
                chunkDropGroup.name = chunkKey;
                dropsGroup.add(chunkDropGroup);
            }

            const dropX = playerSceneX - (playerX - x);
            const dropZ = playerSceneZ - (playerZ - z);

            chunkDrops.forEach((drop) => {
                const dropKey = `drop_${drop.id}_${x}_${z}`;
                let dropMesh = dropMeshes[dropKey];
                if (dropMesh) {
                    dropMesh.position.set(dropX, 0.8, dropZ);
                    return;
                }

                const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
                const material = new THREE.MeshStandardMaterial({
                    map: textures.value[drop.id.toString()],
                });

                dropMesh = new THREE.Mesh(geometry, material);
                dropMesh.position.set(dropX, 0.8, dropZ);
                dropMesh.name = dropKey;

                chunkDropGroup.add(dropMesh);
                dropMeshes[dropKey] = dropMesh;
            });
        });

        Object.values(dropMeshes).forEach((drop) => {
            drop.rotateY(0.01);
        });
    }

    const playerMeshes: { [key: string]: THREE.Mesh } = {};

    function createTextLabel(text: string) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const fontSize = 16;
    
        canvas.width = 256;
        canvas.height = 64;
    
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${fontSize}px Monocraft`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
    
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2.4, 0.6, 1.2);
    
        return sprite;
    }

    function updateTextLabelPosition(player: THREE.Mesh, textLabel: THREE.Sprite) {
        const playerPosition = player.position;
        const currentPlayerPosition = playerMesh!.position;

        // рассчитываем расстояние между текущим игроком и игроком
        const distance = currentPlayerPosition.distanceTo(playerPosition);

        // смещаем текст по Y в зависимости от расстояния
        textLabel.position.y = 1 - distance * 0.05;

        // рассчитываем угол между текущим игроком и игроком
        const angle = Math.atan2(
            currentPlayerPosition.z - playerPosition.z,
            currentPlayerPosition.x - playerPosition.x
        );
        // смещаем лейбл чтобы он всегда был над игроком
        textLabel.position.z = Math.sin(angle) * 0.4;
    }

    function updatePlayers() {
        const player = currentPlayer.value;
        if (!player) return;

        const playerX = player.x;
        const playerZ = player.z;

        const playerSceneX = playerMesh!.position.x;
        const playerSceneZ = playerMesh!.position.z;

        Object.entries(players.value).forEach(([nick, player]) => {
            if (
                currentPlayer.value!.x == player.x &&
                currentPlayer.value!.z == player.z
            ) {
                playersGroup.remove(playerMeshes[nick]);
                delete playerMeshes[nick];
                return;
            }
            const x = player.x;
            const z = player.z;

            const otherPlayerX = playerSceneX - (playerX - x);
            const otherPlayerZ = playerSceneZ - (playerZ - z);

            let playerMesh = playerMeshes[nick];
            if (playerMesh) {
                playerMesh.position.set(otherPlayerX, 0.75, otherPlayerZ);
                const textLabel = playerMesh.children.find((child) => child instanceof THREE.Sprite) as THREE.Sprite;
                if (textLabel) {
                    updateTextLabelPosition(playerMesh, textLabel);
                }
                return;
            }

            const playerTexture = textures.value["alex"];

            playerTexture.magFilter = THREE.NearestFilter;
            playerTexture.minFilter = THREE.NearestFilter;

            const playerMaterial = new THREE.MeshStandardMaterial({
                map: playerTexture,
                transparent: true,
            });
            const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

            playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
            playerMesh.castShadow = true;
            playerMesh.receiveShadow = true;
            playerMesh.name = `player_${nick}`;
            playerMesh.position.set(otherPlayerX, 0.75, otherPlayerZ);

            playersGroup.add(playerMesh);
            playerMeshes[nick] = playerMesh;

            const textLabel = createTextLabel(nick);
            textLabel.position.set(0, 1.2, 0);
            playerMesh.add(textLabel);
            updateTextLabelPosition(playerMesh, textLabel);
        });
    }

    const handleServerMessage = async (data: ServerMessage) => {
        if (data.type === "start") {
            currentPlayer.value = data.result.my_self;

            inventory.value = data.result.inventory;

            const players = data.result.players;
            for (const key in players) {
                if (players.hasOwnProperty(key)) {
                    updatePlayer(players[key]);
                }
            }

            const serverChunks = data.result.chunks;
            const drops = data.result.drops;

            addChunks(serverChunks, drops);
        } else if (data.type === "position") {
            const movedPlayer = data.result.player;
            if (currentPlayer.value && currentPlayer.value.nick === movedPlayer.nick) {
                broken.value = null;

                currentPlayer.value = movedPlayer;

                const players = data.result.players;
                for (const key in players) {
                    if (players.hasOwnProperty(key)) {
                        updatePlayer(players[key]);
                    }
                }

                const escapePlayers = data.result.escape_players;
                for (const key in escapePlayers) {
                    if (escapePlayers.hasOwnProperty(key)) {
                        deletePlayer(escapePlayers[key].nick);
                    }
                }

                if (data.result.escape) {
                    deletePlayer(movedPlayer.nick);
                }

                Object.entries(playerMeshes).forEach(([, player]) => {
                    const nick = player.name.split("_")[1];
                    if ((data.result.escape && nick === movedPlayer.nick) || players.find(p => p.nick === nick)) {
                        playersGroup.remove(player);
                        delete playerMeshes[nick];
                    }
                })

                const serverChunks = data.result.chunks;
                const drops = data.result.drops;

                addChunks(serverChunks, drops);

                const playerChunk = getPlayerChunk(movedPlayer);
                removeOutOfViewChunks(playerChunk);
            } else {
                if (data.result.escape) {
                    deletePlayer(movedPlayer.nick);
                } else {
                    updatePlayer(movedPlayer);
                }
            }
        } else if (data.type === "break") {
            broken.value = data.result;

            if (broken.value.broken) {
                const x = broken.value.block.x;
                const z = broken.value.block.z;

                if (broken.value.dropped) {
                    if (drops[`${x}:${z}`] == undefined) {
                        drops[`${x}:${z}`] = [];
                    }
                    drops[`${x}:${z}`].push({ id: broken.value.dropped, count: 1 });
                }

                await editBlock(broken.value.block.x, broken.value.block.z, 0);

                broken.value = null;
            }
        } else if (data.type === "broken") {
            const block = data.result.block;

            if (broken.value && broken.value.block == block) {
                broken.value = null;
            }

            const x = block.x;
            const z = block.z;

            if (data.result.dropped) {
                if (drops[`${x}:${z}`] == undefined) {
                    drops[`${x}:${z}`] = [];
                }
                drops[`${x}:${z}`].push({ id: data.result.dropped, count: 1 });
            }

            await editBlock(block.x, block.z, 0);
        } else if (data.type === "drop") {
            const x = data.result.block.x;
            const z = data.result.block.z;

            const items = data.result.items;

            const chunkX = Math.floor(x / CHUNK_SIZE);
            const chunkZ = Math.floor(z / CHUNK_SIZE);

            if (items.length > 0) {
                drops[`${x}:${z}`] = items;
            } else {
                delete drops[`${x}:${z}`];
            }

            const chunkDropGroup = dropsGroup.getObjectByName(`chunk_${chunkX}_${chunkZ}`)!;
            chunkDropGroup.children.forEach((drop) => {
                if (!(drop instanceof THREE.Mesh)) return;
                const [id, x, z] = drop.name
                    .split("_")
                    .slice(1)
                    .map((i) => parseInt(i));

                if (
                    !drops[`${x}:${z}`] ||
                    (drops[`${x}:${z}`] && drops[`${x}:${z}`].find((d) => d.id == id) == undefined)
                ) {
                    chunkDropGroup.remove(drop);
                    delete dropMeshes[drop.name];
                }
            });
        } else if (data.type === "msg") {
            const chatMessage = {
                text: data.result.text,
                time: Date.now()
            }
            messages.value.push(chatMessage);
        } else if (data.type === "inventory") {
            inventory.value = data.result.inventory;
        } else if (data.type === "connect_player") {
            updatePlayer(data.result.player);
        } else if (data.type === "disconnect_player") {
            deletePlayer(data.result.player);
        } else if (data.type == "error") {
            logger.error(data.result.description);
            switch (data.result.error_code) {
                case "ERR_SESSION_CONFLICT":
                    fatalError.value.occurred = true;
                    fatalError.value.message = "Ошибка авторизации: сессия уже используется";
                    break;
            }
        }
    };

    function removeOutOfViewChunks(playerChunk: Pick<Chunk, "x" | "z">) {
        const visibleChunks = new Set<string>();

        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                const chunkX = playerChunk.x + x;
                const chunkZ = playerChunk.z + z;
                visibleChunks.add(`${chunkX}:${chunkZ}`);
            }
        }

        for (const key in chunks.value) {
            if (chunks.value.hasOwnProperty(key) && !visibleChunks.has(key)) {
                const dropChunk = scene.value!.getObjectByName(`chunk_${chunks.value[key].x}_${chunks.value[key].z}`);
                if (dropChunk) scene.value!.remove(dropChunk);

                delete chunks.value[key];
            }
        }
    }

    function getPlayerChunk(player: Player): { x: number; z: number } {
        const x = player.x;
        const z = player.z;

        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);

        return { x: chunkX, z: chunkZ };
    }

    async function addChunks(
        serverChunks: { [key: string]: Chunk },
        serverDrops: ServerMessageStart["result"]["drops"]
    ) {
        for (const key in serverChunks) {
            if (serverChunks.hasOwnProperty(key)) {
                const chunk = serverChunks[key];

                await addChunk(chunk);
            }
        }

        for (const drop of serverDrops) {
            const { x, z, items } = drop;
            if (drops[`${x}:${z}`]) {
                drops[`${x}:${z}`].push(...items);
            } else {
                drops[`${x}:${z}`] = items;
            }
        }
    }

    async function addChunk(chunk: Chunk) {
        chunks.value[`${chunk.x}:${chunk.z}`] = chunk;
    }

    async function updatePlayer(player: Player) {
        players.value[player.nick] = player;
    }

    async function deletePlayer(nick: string) {
        delete players.value[nick];
        const playerMesh = playerMeshes[nick];
        if (playerMesh) {
            playersGroup.remove(playerMesh);
            delete playerMeshes[nick];
        }
    }

    async function editBlock(x: number, z: number, block: number) {
        const chunkX = Math.floor(x / 5);
        const chunkZ = Math.floor(z / 5);

        const key = `${chunkX}:${chunkZ}`;
        const chunk = chunks.value[key];

        const blockX = ((x % 5) + 5) % 5;
        const blockZ = ((z % 5) + 5) % 5;

        chunk.chunk[blockX][blockZ] = block;
    }

    // async function getBlock(block: number) {
    //     const id = block.toString();
    //     if (!(id in textures.value)) {
    //         textures.value[id] = await textureLoader.loadAsync(`texture/${id}.png`);
    //     }
    //     return textures.value[id];
    // }

    function getBreakingStage(maxValue: number, currentValue: number) {
        if (currentValue >= maxValue) return 9;
        if (currentValue <= 0) return 0;
        return Math.floor((currentValue / maxValue) * 9);
    }

    function onBlockClick(event: PointerEvent) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / (window.innerHeight - 60)) * 2 + 1;

        raycaster.setFromCamera(mouse, camera.value!);

        const intersects = raycaster.intersectObjects(scene.value!.children, true);

        const player = currentPlayer.value;
        if (!player) return;

        const playerX = player.x;
        const playerZ = player.z;

        if (intersects.length > 0) {
            const drop = intersects.find((i) => i.object.name.startsWith("drop"));
            if (drop) {
                const dropMesh = drop.object;
                const [, x, z] = dropMesh.name
                    .split("_")
                    .slice(1)
                    .map((i) => parseInt(i));

                const isNeighbor =
                    (Math.abs(playerX - x) === 1 && playerZ === z) || (Math.abs(playerZ - z) === 1 && playerX === x);
                if (isNeighbor) {
                    const side = getBlockSideFromPlayer(playerX, playerZ, x, z);
                    send({ type: "take", data: { side } });
                }
                return;
            }

            const mesh = intersects[0].object;
            const blockX = mesh.userData.x;
            const blockZ = mesh.userData.z;
            
            const isNeighbor =
                (Math.abs(playerX - blockX) === 1 && playerZ === blockZ) || (Math.abs(playerZ - blockZ) === 1 && playerX === blockX);
            if(isNeighbor) return;

            const side = getBlockSideFromPlayer(playerX, playerZ, blockX, blockZ);

            if (side != "unknown" && getBlockBySide(side) == 0) {
                send({ type: "move", data: { side } });
            }

            // const intersectedObject = solidBlock.object;
            // const { x, z } = intersectedObject.userData;
            // if (x == undefined || z == undefined) return;

            // if (!currentPlayer.value) return;

            // const blockX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            // const blockZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

            // const chunkX = Math.floor(x / CHUNK_SIZE);
            // const chunkZ = Math.floor(z / CHUNK_SIZE);

            // TODO реализовать размещение блока
        }
    }

    function onBlockPress(event: PointerEvent) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / (window.innerHeight - 60)) * 2 + 1;

        raycaster.setFromCamera(mouse, camera.value!);

        const intersects = raycaster.intersectObjects(scene.value!.children, true);

        if (intersects.length > 0) {
            // находим ближайший видимый блок
            const solidBlock = intersects.find((i) => i.object.visible);
            if (!solidBlock) return;

            const intersectedObject = solidBlock.object;
            const { x, z } = intersectedObject.userData;
            if (x == undefined || z == undefined) return;

            if (!currentPlayer.value) return;

            const playerX = currentPlayer.value.x;
            const playerZ = currentPlayer.value.z;

            const blockX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            const blockZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

            const chunkX = Math.floor(x / CHUNK_SIZE);
            const chunkZ = Math.floor(z / CHUNK_SIZE);

            const clickedBlock = chunks.value[`${chunkX}:${chunkZ}`].chunk[blockX][blockZ];
            if (clickedBlock === 0) return;

            const isNeighbor =
                (Math.abs(playerX - x) === 1 && playerZ === z) || (Math.abs(playerZ - z) === 1 && playerX === x);
            if (isNeighbor) {
                const side = getBlockSideFromPlayer(playerX, playerZ, x, z);
                send({ type: "break", data: { side } });
            }
        }
    }

    let actionInterval: NodeJS.Timeout | null = null;

    function onPointerDown(event: PointerEvent) {
        if (!(event.target instanceof HTMLCanvasElement)) return;

        actionInterval = setInterval(() => {
            onBlockPress(event);
        }, 250);
        // если игрок кликнул на блок, то ждем 200 мс и если он не отпустил кнопку мыши, то считаем это за удержание (может это можно лучше сделать?)
        setTimeout(() => {
            if (actionInterval != null) return;
            onBlockClick(event);
        }, 200);
    }

    function onPointerUp(event: PointerEvent) {
        if (!(event.target instanceof HTMLCanvasElement)) return;

        if (actionInterval != null) {
            clearInterval(actionInterval);
            actionInterval = null;
        }
    }

    function getBlockSideFromPlayer(playerX: number, playerZ: number, blockX: number, blockZ: number): string {
        if (blockX === playerX) {
            if (blockZ > playerZ) {
                return "down";
            } else {
                return "up";
            }
        } else if (blockZ === playerZ) {
            if (blockX > playerX) {
                return "right";
            } else {
                return "left";
            }
        }
        return "unknown";
    }

    let lastSentTime = 0;
    const delay = 200;

    let action = "move";

    function getBlockBySide(side: string): number {
        const player = currentPlayer.value!;

        //if(!player) return -1; //TODO правильно добавить проверку на наличие игрока

        const x = player.x;
        const z = player.z;

        let blockX = x;
        let blockZ = z;

        switch (side) {
            case "up":
                blockZ -= 1;
                break;
            case "down":
                blockZ += 1;
                break;
            case "left":
                blockX -= 1;
                break;
            case "right":
                blockX += 1;
                break;
            default:
                return 0;
        }

        // берем координаты чанка с блоком
        const chunkX = Math.floor(blockX / CHUNK_SIZE);
        const chunkZ = Math.floor(blockZ / CHUNK_SIZE);

        // получаем координаты блока относительно массива чанка
        const localBlockX = ((blockX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localBlockZ = ((blockZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        return chunks.value[`${chunkX}:${chunkZ}`].chunk[localBlockX][localBlockZ];
    }

    document.addEventListener("keydown", (event) => {
        if(!inGame.value) return;

        if (!currentPlayer.value) return;

        const currentTime = Date.now();
        if (currentTime - lastSentTime < delay) {
            return;
        }

        let side;
        switch (event.code) {
            case "KeyW":
                side = "up";
                break;
            case "KeyA":
                side = "left";
                break;
            case "KeyS":
                side = "down";
                break;
            case "KeyD":
                side = "right";
                break;
            case "KeyQ":
                action = action == "move" ? "break" : "move";
                break;
            case "KeyE":
                showInventory.value = !showInventory.value;
                break;
            default:
                return;
        }

        lastSentTime = currentTime;
        if (side && getBlockBySide(side) == 0) {
            const data = { type: action, data: { side } };
            send(data);
        }
    });

    function getSettings() {
        const settings = JSON.parse(localStorage.getItem("settings") || "{}");
        return {
            showChunkBorders: settings.showChunkBorders || false,
            modifyScaleSize: settings.modifyScaleSize || false,
        };
    }
    //TODO добавить отрисовку границ чанков
    // watch(showChunkBorders, createChunkBorders);

    // function createChunkBorders(enable: boolean) {
    //     if(enable){
    //         const chunkBorders = new THREE.Group();
    //         const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    //         const player = currentPlayer.value;
    //         if(!player) return;
    //         const x = player.x;
    //         const z = player.z;
    //         for(let i = -2; i <= 2; i++){
    //             for(let j = -2; j <= 2; j++){
    //                 const x = i * CHUNK_SIZE;
    //                 const z = j * CHUNK_SIZE;
    //                 const geometry = new THREE.BufferGeometry().setFromPoints([
    //                     new THREE.Vector3(x, 2, z),
    //                     new THREE.Vector3(x + CHUNK_SIZE, 2, z),
    //                     new THREE.Vector3(x + CHUNK_SIZE, 2, z + CHUNK_SIZE),
    //                     new THREE.Vector3(x, 2, z + CHUNK_SIZE),
    //                     new THREE.Vector3(x, 2, z)
    //                 ]);
    //                 const line = new THREE.Line(geometry, material);
    //                 chunkBorders.add(line);
    //             }
    //         }
    //         chunkBorders.name = 'chunkBorders';
    //         scene.value!.add(chunkBorders);
    //     }else{
    //         const chunkBorders = scene.value!.getObjectByName('chunkBorders');
    //         if (chunkBorders) {
    //             scene.value!.remove(chunkBorders);
    //         }
    //     }
    // }

    function generateBrokenTexture() {
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

        const texture = new THREE.CanvasTexture(canvas) as THREE.Texture;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        return texture;
    }

    let firstRender = true;

    async function render() {
        if (!inGame.value) return;
        
        const renderStartedAt = Date.now();

        updateDrops();
        updateTextures();
        updatePlayers();

        playerMesh?.position.set(2, 0.75, 2);

        renderer.value!.render(toRaw(scene.value!), toRaw(camera.value!));

        if (firstRender) {
            firstRender = false;

            const renderTime = Date.now() - renderStartedAt;
            logger.info(`firstRender: ${renderTime} мс`);
            eventBus.emit("gameStarted", { timeElapsed: renderTime });
        }

        requestAnimationFrame(render);
    }

    return {
        loadAssets,
        handleServerMessage,
        chunks,
        inGame,

        currentPlayer,
        assetsLoaded,
        inventory,
        showInventory,

        // threejs
        scene,
        camera,
        renderer,
        render,
        initPlatform,
        onPointerDown,
        onPointerUp,

        // настройки
        showChunkBorders,
        modifyScaleSize,
    };
});
