const WebSocket = require('ws');

const state = {
    usersList: [],
    get usersCount() {
        return this.usersList.length
    },
    addUser(data) {
        this.usersList.push(data)
    },
    removeUser(data) {
        this.usersList = this.usersList.filter(this.getUsersExcept.bind(this, data.userId))
    },
    getUsersExcept(userId) {
        return this.usersList.filter(userData => userData.userId !== userId)
    }
}

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({server});
        this.handleIncomingMessage = this.handleIncomingMessage.bind(this)
    }

    start() {
        this.wss.on('connection', (connection) => {
            connection.on('message', (message) => {
                this.handleIncomingMessage(connection, message)
            })
        });

    }

    handleIncomingMessage(connection, message) {
        try {
            let messageObj = JSON.parse(message);
            console.log(`\nReceived message: ${message}\n`);
            switch (messageObj.type) {
                case 'userLogin':
                    state.addUser(messageObj.data)
                    this.broadcast(messageObj)
                    this.broadcast(this.buildUsersCountChangedMessage())
                    break;
                case 'userLogout':
                    state.removeUser(messageObj.data)
                    this.broadcast(messageObj)
                    this.broadcast(this.buildUsersCountChangedMessage())
                    break;
                case 'userMessage':
                    this.broadcast(this.buildUserMessage(messageObj))
                    break;
                case 'userAvatarChange':
                    this.broadcast(messageObj)
                    break;
                case 'getUsersList':
                    this.send(connection, this.buildUsersListMessage(messageObj))
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
                usersCount: state.usersCount
            }
        }
    }

    buildUserMessage(incomingMessage) {
        incomingMessage.data.timestamp = Date.now()
        return incomingMessage
    }

    buildUsersListMessage(incomingMessage) {
        return {
            type: 'usersList',
            data: {
                from: incomingMessage.data,
                usersList: state.getUsersExcept(incomingMessage.data.userId)
            }
        }
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

    send(connection, data) {
        let message = JSON.stringify(data)
        console.log(`\nSending direct message: ${message}\n`);
        connection.send(message)
    }
}

module.exports = WebSocketServer