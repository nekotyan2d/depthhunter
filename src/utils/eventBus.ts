import mitt from "mitt";

type Events = {
    serverMessage: ServerMessage,
    texturesLoaded: {
        total: number,
        loaded: number,
    },
    gameStarted: {
        timeElapsed: number, // в миллисекундах
    },
    platformCreated: {
        
    },
    accountCreated: {
        
    }
}

const eventBus = mitt<Events>();

export default eventBus;