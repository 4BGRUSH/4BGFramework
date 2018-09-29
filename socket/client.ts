import io = require('socket.io-client');

export function connect(url: string, port: number) {
    const urlFull = `${url}:${port}`;
    const socket = io(urlFull);

    return socket;
}
