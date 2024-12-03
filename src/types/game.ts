declare global {
    interface Player {
        uuid: string;
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

    interface ServerMessageStart {
        type: "start";
        result: {
            my_self: Player;
            players: {[key: string]: Player};
            chunks: {[key: string]: Chunk};
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
        };
    }
    interface ServerMessageBreak {
        type: "break";
        result: number;
    }
    interface ServerMessageBroken {
        type: "broken";
        result: {
            block: Block;
            stability: number;
            progress: number;
        };
    }
    interface ServerMessageMsg {
        type: "msg";
        result: {
            text: string;
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
        }
    }
    type ServerMessage =
        | ServerMessageStart
        | ServerMessageMove
        | ServerMessageBreak
        | ServerMessageBroken
        | ServerMessageMsg
        | ServerMessageConnectPlayer
        | ServerMessageDisconnectPlayer
        | ServerMessageError;
}