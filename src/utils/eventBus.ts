import mitt from "mitt";

type Events = {
    serverMessage: ServerMessage,
    assetsLoaded: any,
    fontLoaded: any,
    texturesLoaded: any,
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