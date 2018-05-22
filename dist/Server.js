"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const Connection_1 = __importDefault(require("./Connection"));
const ListenersHandler_1 = __importDefault(require("./ListenersHandler"));
class Server {
    constructor(handler) {
        this.server = net_1.default.createServer((socket) => {
            const connection = new Connection_1.default(socket);
            handler(connection);
        });
    }
    listen({ host, port }) {
        return new Promise((resolve, reject) => {
            try {
                this.server.listen(port, host);
                const handler = new ListenersHandler_1.default();
                handler.addListener(this.server, 'listening', () => {
                    handler.removeListeners();
                    this.address = this.server.address();
                    resolve(this.address);
                });
                handler.addListener(this.server, 'error', (error) => {
                    handler.removeListeners();
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map