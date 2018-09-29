import { stdoutLog as log } from "../utils";

import { config } from '../config';
import { client } from "../socket";

const serverUrl = 'http://localhost';

let socket = client.connect(serverUrl, config.ports.server);

socket.on('connect', function () {
    log('connection established');
});
