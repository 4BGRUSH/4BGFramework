import { config } from '../config'
import { server as srv } from '../socket';

const log = require('../utils').stdoutLog;
let server = srv.listen(config.ports.server);

server.on('connection', function (socket) {
    log('a user connected');
    socket.on('disconnect', function () {
        log('a user disconnected');
    });
});
