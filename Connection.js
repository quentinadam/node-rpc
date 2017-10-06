const EventEmitter = require('events');
const zlib = require('zlib');

class Connection extends EventEmitter {

  constructor(socket) {
    super();
    this.socket = socket;
    this.closed = false;
    this.handleConnect();
    this.handleRead();
    this.handleEnd();
    this.handleTimeout();
    this.handleError();
  }

  write(data) {
    let buffer = Buffer.allocUnsafe(4);
    if (data) {
      data = Buffer.from(JSON.stringify(data), 'utf8');
      zlib.gzip(data, (error, data) => {
        if (error) return this.close(error);
        buffer.writeUInt32BE(data.length, 0);
        buffer = Buffer.concat([buffer, data]);
        this.socket.write(buffer);
      });
    } else {
      buffer.writeUInt32BE(0, 0);
      this.socket.write(buffer);
    }
  }

  handleRead() {
    let data = Buffer.alloc(0);
    let length = null;
    this.socket.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
      while (true) {
        if (length == null && data.length >= 4) {
          length = data.readUInt32BE(0);
        }
        if (length != null && data.length >= length + 4) {
          if (length > 0) {
            zlib.gunzip(data.slice(4, 4 + length), (error, data) => {
              if (error) return this.close(error);
              if (this.closed) return;
              this.emit('data', JSON.parse(data));
            });
          } else {
            if (this.closed) return;
            this.emit('data');
          }
          data = data.slice(4 + length);
          length = null;
        } else {
          break;
        }
      }
    });
  }

  setTimeout(timeout) {
    this.socket.setTimeout(timeout);
  }

  handleConnect() {
    this.socket.on('connect', () => {
      this.emit('connect');
    });
  }

  handleEnd() {
    this.socket.on('end', () => {
      this.close();
    });
  }

  handleTimeout() {
    this.socket.on('timeout', () => {
      this.close();
    });
  }

  handleError() {
    this.socket.on('error', (error) => {
      this.close(error);
    });
  }

  close(error) {
    if (!this.closed) {
      this.emit('close', error);
      this.closed = true;
      this.socket.end();
    }
  }
}

module.exports = Connection;
