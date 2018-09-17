const http = require('http').createServer();
const socketio = require('socket.io');

const log = require('../utils').stdoutLog;

/**
 * @param {number} port 
 */
function listen(port) {
    http.listen(port, function () {
        log('listening on port:', port);
    });
    return socketio(http);
}

module.exports = {
    listen: listen
};
