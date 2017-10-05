const net = require('net');
const EventEmitter = require('events');
const Connection = require('./Connection');

class Server extends EventEmitter {

  constructor() {
    super();
    this.server = net.createServer((socket) => {
      let connection = new Connection(socket);
      this.emit('connection', connection);
      connection.on('data', (data) => {
        this.emit('request', data, connection);
      });
    }).on('error', (error) => {
      this.emit('error', error);
    });
  }

  handle(fn) {
    this.on('request', async (data, connection) => {
      try {
        let result = await fn(data);
        connection.write(result);
      } catch (error) {
        this.emit(error);
        connection.close();
      }
    });
  }

  listen(port, host, backlog, callback) {
    this.server.listen(port, host, backlog, callback);
  }

  address() {
    return this.server.address();
  }
}

module.exports = Server;
