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
        damage?: number;
    }

    interface Drop extends Slot {
        x: number;
        z: number;
    }

    interface ServerMessageStart {
        type: "start";
        result: {
            my_self: Player;
            players: {[key: string]: Player};
            chunks: {[key: string]: Chunk};
            inventory: (Slot | null)[];
            drops: {x: number, z: number, items: Slot[]}[];
            hand: Slot | null;
        };
    }
    interface ServerMessageMove {
        type: "move";
        result: {
            player: Player;
            players: {[key: string]: Player};
            escape_players: {[key: string]: Player};
            chunks: {[key: string]: Chunk};
            escape: boolean;
            drops: {x: number, z: number, items: Drop[]}[];
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
        };
    }
    interface ServerMessageBroken {
        type: "broken";
        result: {
            block: Block;
            hardness: number;
            progress: number;
        };
    }
    interface ServerMessageMsg {
        type: "msg";
        result: {
            text: string;
        };
    }
    interface ServerMessageInventory {
        type: "inventory";
        query_id: number;
        result: {
            inventory: (Slot | null)[];
            hand: Slot | null;
        }
    }
    interface ServerMessageDrop {
        type: "drop";
        result: {
            block: Block;
            items: Drop[];
        }
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
        }
    }
    type ServerMessage =
        | ServerMessageStart
        | ServerMessageMove
        | ServerMessageBreak
        | ServerMessageBroken
        | ServerMessageDrop
        | ServerMessageMsg
        | ServerMessageInventory
        | ServerMessageConnectPlayer
        | ServerMessageDisconnectPlayer
        | ServerMessageError;
}