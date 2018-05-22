import EventEmitter from 'events';
import net from 'net';
import tls from 'tls';
import ListenersHandler from './ListenersHandler';
import SmartBuffer from './SmartBuffer';

export default class Connection extends EventEmitter {

  private socket: any;
  private buffer: SmartBuffer;
  private available: boolean;
  private heartbeat!: NodeJS.Timer;
  private timeout!: NodeJS.Timer;

  constructor(socket: any) {
    super();
    this.socket = socket;
    this.buffer = new SmartBuffer();
    this.socket.on('data', (buffer: Buffer) => {
      this.handleData(buffer);
    });
    this.socket.on('error', (error: Error) => {
      this.end(error);
    });
    this.socket.on('end', () => {
      this.end();
    });
    this.available = true;
    this.setTimeout();
    this.setHeartbeat();
  }

  private clearHeartbeat(): void {
    clearInterval(this.heartbeat);
  }

  private setHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeat = setInterval(() => {
      this.write();
    }, 5000);
  }

  private clearTimeout(): void {
    clearTimeout(this.timeout);
  }

  private setTimeout(): void {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.end();
    }, 10000);
  }

  end(error?: Error): void {
    if (this.available === true) {
      this.available = false;
      this.clearTimeout();
      this.clearHeartbeat();
      this.socket.destroy();
      delete this.socket;
      this.emit('end', error);
    }
  }

  write(data: Buffer = Buffer.allocUnsafe(0)): void {
    if (this.available === true) {
      const length = data.length;
      const buffer = Buffer.concat([Buffer.allocUnsafe(4), data]);
      buffer.writeUInt32LE(length, 0);
      this.socket.write(buffer);
    }
  }

  private handleData(buffer: Buffer): void {
    if (this.available === true) {
      this.setTimeout();
      this.buffer.add(buffer);
      while (this.buffer.length >= 4) {
        const length = this.buffer.readUInt32LE(0);
        if (this.buffer.length < length + 4) break;
        if (length > 0) this.emit('data', this.buffer.slice(4, length));
        this.buffer.discard(4 + length);
      }
    }
  }

  static create({secure = false, port, host = 'localhost'}: {secure?: boolean, host?: string, port: number}): Promise<Connection> {
    return new Promise((resolve, reject) => {
      try {
        const socket: net.Socket = secure ? tls.connect({host, port}) : net.connect({host, port})
        const event = secure === true ? 'secureConnect' : 'connect';
        const handler = new ListenersHandler();
        handler.addListener(socket, event, () => {
          handler.removeListeners();
          resolve(new Connection(socket));
        });
        handler.addListener(socket, 'error', (error: Error) => {
          handler.removeListeners();
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

}
