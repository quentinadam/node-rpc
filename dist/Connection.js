"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const net_1 = __importDefault(require("net"));
const tls_1 = __importDefault(require("tls"));
const ListenersHandler_1 = __importDefault(require("./ListenersHandler"));
const SmartBuffer_1 = __importDefault(require("./SmartBuffer"));
class Connection extends events_1.default {
    constructor(socket) {
        super();
        this.socket = socket;
        this.buffer = new SmartBuffer_1.default();
        this.socket.on('data', (buffer) => {
            this.handleData(buffer);
        });
        this.socket.on('error', (error) => {
            this.end(error);
        });
        this.socket.on('end', () => {
            this.end();
        });
        this.available = true;
        this.setTimeout();
        this.setHeartbeat();
    }
    clearHeartbeat() {
        clearInterval(this.heartbeat);
    }
    setHeartbeat() {
        this.clearHeartbeat();
        this.heartbeat = setInterval(() => {
            this.write();
        }, 5000);
    }
    clearTimeout() {
        clearTimeout(this.timeout);
    }
    setTimeout() {
        this.clearTimeout();
        this.timeout = setTimeout(() => {
            this.end();
        }, 10000);
    }
    end(error) {
        if (this.available === true) {
            this.available = false;
            this.clearTimeout();
            this.clearHeartbeat();
            this.socket.destroy();
            delete this.socket;
            this.emit('end', error);
        }
    }
    write(data = Buffer.allocUnsafe(0)) {
        if (this.available === true) {
            const length = data.length;
            const buffer = Buffer.concat([Buffer.allocUnsafe(4), data]);
            buffer.writeUInt32LE(length, 0);
            this.socket.write(buffer);
        }
    }
    handleData(buffer) {
        if (this.available === true) {
            this.setTimeout();
            this.buffer.add(buffer);
            while (this.buffer.length >= 4) {
                const length = this.buffer.readUInt32LE(0);
                if (this.buffer.length < length + 4)
                    break;
                if (length > 0)
                    this.emit('data', this.buffer.slice(4, length));
                this.buffer.discard(4 + length);
            }
        }
    }
    static create({ secure = false, port, host = 'localhost' }) {
        return new Promise((resolve, reject) => {
            try {
                const socket = secure ? tls_1.default.connect({ host, port }) : net_1.default.connect({ host, port });
                const event = secure === true ? 'secureConnect' : 'connect';
                const handler = new ListenersHandler_1.default();
                handler.addListener(socket, event, () => {
                    handler.removeListeners();
                    resolve(new Connection(socket));
                });
                handler.addListener(socket, 'error', (error) => {
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
exports.default = Connection;
//# sourceMappingURL=Connection.js.map