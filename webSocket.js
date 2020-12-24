const WebSocket = require('ws');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({server});
        this.state = {
            usersCount: 0
        }
        this.handleIncomingMessage = this.handleIncomingMessage.bind(this)
    }

    start() {
        this.wss.on('connection', (connection) => {
            connection.on('message', this.handleIncomingMessage)
        });

    }

    handleIncomingMessage(message) {
        try {
            let messageObj = JSON.parse(message);
            console.log(`\nReceived message: ${message}\n`);
            switch (messageObj.type) {
                case 'userLogin':
                    this.state.usersCount++;
                    this.broadcast(messageObj)
                    this.broadcast(this.buildUsersCountChangedMessage())
                    break;
                case 'userLogout':
                    this.state.usersCount--;
                    this.broadcast(messageObj)
                    this.broadcast(this.buildUsersCountChangedMessage())
                    break;
                case 'userMessage':
                    this.broadcast(this.buildUserMessage(messageObj))
                    break;
                case 'userAvatarChange':
                    this.broadcast(messageObj)
                    break;
            }
        } catch (error) {
            console.log(`ERROR: ${error}`);
        }
    }

    buildUsersCountChangedMessage() {
        return {
            type: 'usersCountChanged',
            data: {
                usersCount: this.state.usersCount
            }
        }
    }

    buildUserMessage(incomingMessage) {
        incomingMessage.data.timestamp = Date.now()
        return incomingMessage
    }

    broadcast(data) {
        let message = JSON.stringify(data)
        console.log(`\nBroadcasting message: ${message}\n`);

        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        })
    }
}

module.exports = WebSocketServer