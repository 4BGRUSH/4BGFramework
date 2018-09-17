const getconn = require('../socket').client.connect;
const config = require('../config.js');
const serverUrl = 'http://localhost'

const log = require('../utils').stdoutLog;

let socket = getconn(serverUrl, config.ports.server);

socket.on('connect', function () {
    log('connection established');
});
