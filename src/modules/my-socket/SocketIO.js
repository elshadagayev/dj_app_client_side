import openSocket from 'socket.io-client'
import config from '../../config.json'

class MySocket {
    constructor () {
        
    }

    connect (callback) {
        return openSocket(config.socketIOServer);
        //socket.on('connection', callback);
    }

    request(event, data, callback) {
        const socket = this.connect();

        socket.on('connect', () => {
            socket.on(event, callback);
            socket.emit(event, data);
        })
        
        return socket;
    }

    listen (event, callback) {
        this.connect(client => {
            client.on(event, callback);
        })

        return this;
    }
}

export default MySocket