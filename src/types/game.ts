declare global {
    interface Player {
        nick: string;
        x: number;
        z: number;
    }

    interface Chunk {
        chunk: number[][];
        x: number;
        z: number;
    }

    interface Block {
        x: number;
        z: number;
    }

    interface Slot {
        id: number;
        count: number;
        tool?: {
            initialDurability: number;
            damage: number;
        };
    }

    interface Drop extends Slot {
        x: number;
        z: number;
    }

    interface BlockParams {
        id: number;
        name: string;
        drop: number; // id предмета, который выпадает при разрушении
        properties?: {
            hardness: number;
            harvestTool?: "pickaxe" | "axe" | "shovel";
            minLevel?: number;
        };
    }

    interface BaseItem {
        id: number;
        name: string;
        count: number;
    }

    interface BlockItem extends BaseItem {
        place: number; // id блока, который появляется при размещении
    }

    interface ToolItem extends BaseItem {
        tool: {
            type: "pickaxe" | "axe" | "shovel";
            level: number;
            damage: number;
        };
    }

    type Item = BaseItem | BlockItem | ToolItem;
    interface Recipe {
        craftingTable: boolean;
        ingredients: Slot[];
        result: Slot;
    }

    interface SmeltingRecipe {
        fuelCount: number; // количество угля
        input: number; // id переплавляемого предмета
        output: number; // id результата
    }

    interface ServerMessageStart {
        type: "start";
        result: {
            my_self: Player;
            players: Record<string, Player>;
            chunks: Record<string, Chunk>;
            inventory: (Slot | null)[];
            drops: { x: number; z: number; items: Slot[] }[];
            hand: Slot | null;
        };
    }
    interface ServerMessagePosition {
        type: "position";
        req_id: string;
        result: {
            player: Player;
            players: Player[];
            escape_players: Player[];
            chunks: Record<string, Chunk>;
            escape: boolean;
            drops: { x: number; z: number; items: Drop[] }[];
            available_after: number;
            current_time: number;
        };
    }
    interface ServerMessageBreak {
        type: "break";
        result: {
            block: Block;
            hardness: number;
            progress: number;
            broken: boolean;
            dropped: number | null; // TODO здесь бы задать union идов предметов
            hand: Slot | null;
            available_after: number;
            current_time: number;
        };
    }
    interface ServerMessageBroken {
        type: "broken";
        result: {
            block: Block;
            dropped: number | null; // TODO здесь бы задать union идов предметов
        };
    }
    interface ServerMessagePut {
        type: "put";
        result: {
            coordinates: { x: number; z: number };
            block: number; // TODO здесь бы задать union идов предметов
            hand: Slot | null;
        };
    }
    interface ServerMessageMsg {
        type: "msg";
        result: {
            text: string;
            command: boolean;
        };
    }
    interface ServerMessageInventory {
        type: "inventory";
        req_id: string;
        result: {
            inventory: (Slot | null)[];
            hand: Slot | null;
        };
    }
    interface ServerMessageDrop {
        type: "drop";
        result: {
            block: Block;
            items: Drop[];
        };
    }
    interface ServerMessageConnectPlayer {
        type: "connect_player";
        result: {
            player: Player;
        };
    }
    interface ServerMessageDisconnectPlayer {
        type: "disconnect_player";
        result: {
            player: string;
        };
    }
    interface ServerMessageError {
        type: "error";
        result: {
            error_code: string; // TODO здесь бы задать union кодов
            description: string;
        };
    }
    type ServerMessage =
        | ServerMessageStart
        | ServerMessagePosition
        | ServerMessageBreak
        | ServerMessageBroken
        | ServerMessageDrop
        | ServerMessagePut
        | ServerMessageMsg
        | ServerMessageInventory
        | ServerMessageConnectPlayer
        | ServerMessageDisconnectPlayer
        | ServerMessageError;

    type Direction = "left" | "up" | "right" | "down";
}