const io = require('socket.io-client');

const log = require('../utils').stdoutLog;

/**
 * @param {string} url 
 * @param {number} port 
 */
function connect(url, port) {
    const urlFull = `${url}:${port}`;
    const socket = io(urlFull);

    return socket;
}

module.exports = {
    connect: connect
};
