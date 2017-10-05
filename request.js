const net = require('net');
const Connection = require('./Connection');

let connections = {};

async function getConnection(address) {
  if (!connections[address]) connections[address] = [];
  let connection = connections[address].shift();
  return await new Promise((resolve, reject) => {
    if (connection) {
      resolve(connection);
    } else {
      let host = address.split(':')[0];
      let port = address.split(':')[1];
      connection = new Connection(net.createConnection({host, port, timeout: 5000}));
      connection.on('connect', () => {
        resolve(connection);
      });
      connection.on('close', () => {
        let index = connections[address].indexOf(connection);
        if (index != -1) {
          connections[address].splice(index, 1);
        }
      })
    }
  });
}

async function request(address, data) {
  let connection = await getConnection(address);
  return await new Promise((resolve, reject) => {
    const handleClose = (error) => {
      if (error) {
        reject(error);
      } else {
        reject(new Error('Connection closed'));
      }
    }
    connection.addListener('close', handleClose);
    connection.once('data', (data) => {
      connection.removeListener('close', handleClose);
      connections[address].push(connection);
      resolve(data);
    });
    connection.write(data);
  });
}

module.exports = request;
