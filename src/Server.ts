import net from 'net';
import Connection from './Connection';
import ListenersHandler from './ListenersHandler';

export default class Server {

  private readonly server: net.Server;
  private address?: net.AddressInfo;

  constructor(handler: (connection: Connection) => void) {
    this.server = net.createServer((socket) => {
      const connection = new Connection(socket);
      handler(connection);
    });
  }

  listen({host, port}: {host?: string, port: number}): Promise<net.AddressInfo> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, host);
        const handler = new ListenersHandler();
        handler.addListener(this.server, 'listening', () => {
          handler.removeListeners();
          this.address = <net.AddressInfo>this.server.address();
          resolve(this.address);
        });
        handler.addListener(this.server, 'error', (error: Error) => {
          handler.removeListeners();
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
