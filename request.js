const net = require('net');
const Connection = require('./Connection');

let connections = {};

function parseAddress(address) {
  let result;
  if (result = /^\[(.+)\]:(\d+)$/.exec(address)) {
    return {host: result[1], port: result[2]};
  } else if (result = /^(.+):(\d+)$/.exec(address)) {
    return {host: result[1], port: result[2]};
  } else {
    throw new Error(`Could not parse address ${address}`)
  }
}

async function getConnection(address) {
  if (!connections[address]) connections[address] = [];
  let connection = connections[address].shift();
  return await new Promise((resolve, reject) => {
    if (connection) {
      resolve(connection);
    } else {
      let {host, port} = parseAddress(address);
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

async function request(address, data, options) {
  options = Object.assign({timeout: 60000}, options);
  let connection = await getConnection(address);
  connection.setTimeout(timeout);
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
