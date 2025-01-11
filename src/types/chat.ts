declare global {
    interface ChatMessage {
        text: string;
        time: number;
        command: boolean;
    }
}