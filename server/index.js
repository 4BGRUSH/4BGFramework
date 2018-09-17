const createServer = require('../socket').server.listen;
const config = require('../config.js');

const log = require('../utils').stdoutLog;

let server = createServer(config.ports.server);

server.on('connection', function (socket) {
    log('a user connected');
    socket.on('disconnect', function () {
        log('a user disconnected');
    });
});
