"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ListenersHandler {
    constructor() {
        this.listeners = [];
    }
    addListener(object, event, handler) {
        object.addListener(event, handler);
        this.listeners.push({ object, event, handler });
    }
    removeListeners(object, event) {
        for (const listener of this.listeners) {
            if ((object === undefined || object === listener.object) && (event === undefined || event === listener.event)) {
                listener.object.removeListener(listener.event, listener.handler);
            }
        }
    }
}
exports.default = ListenersHandler;
//# sourceMappingURL=ListenersHandler.js.map