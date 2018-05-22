/// <reference types="node" />
import EventEmitter from 'events';
export default class Connection extends EventEmitter {
    private socket;
    private buffer;
    private available;
    private heartbeat;
    private timeout;
    constructor(socket: any);
    private clearHeartbeat();
    private setHeartbeat();
    private clearTimeout();
    private setTimeout();
    end(error?: Error): void;
    write(data?: Buffer): void;
    private handleData(buffer);
    static create({secure, port, host}: {
        secure?: boolean;
        host?: string;
        port: number;
    }): Promise<Connection>;
}
