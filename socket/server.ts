import { stdoutLog as log } from "../utils";
import { createServer } from 'http';

const http = createServer();
import socketio = require('socket.io');

export function listen(port: number) {
    http.listen(port, function () {        
        log('listening on port:', port);
    });
    return socketio(http);
}
