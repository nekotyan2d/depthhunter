import mitt from "mitt";

type Events = {
    serverMessage: ServerMessage,
    texturesLoaded: {
        total: number,
        loaded: number,
    },
    gameStarted: {
        timeElapsed: number, // в миллисекундах
    }
}

const eventBus = mitt<Events>();

export default eventBus;