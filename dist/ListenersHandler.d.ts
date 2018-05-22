export default class ListenersHandler {
    private listeners;
    constructor();
    addListener(object: any, event: string, handler: (...args: any[]) => void): void;
    removeListeners(object?: any, event?: string): void;
}
