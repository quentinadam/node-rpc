/// <reference types="node" />
import net from 'net';
import Connection from './Connection';
export default class Server {
    private readonly server;
    private address?;
    constructor(handler: (connection: Connection) => void);
    listen({host, port}: {
        host?: string;
        port: number;
    }): Promise<net.AddressInfo>;
}
