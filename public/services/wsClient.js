export default class WsClient {
    constructor(url) {
        this.url = url;
        this.webSocket = new WebSocket(url);
        this.registerErrorHandlers();
        this.webSocket.onopen = this.main.bind(this);

        this.onUserLoggedIn = null;
        this.onUserLoggedOut = null;
        this.onUserCountChanged = null;
        this.onUserMessageReceived = null;
        this.onAvatarLoaded = null;
        this.onUsersList = null
    }

    main() {
        this.webSocket.onmessage = (event) => {
            try {
                console.log(`\nReceived message: ${event.data}\n`);
                let message = JSON.parse(event.data);
                console.log(message);

                switch (message.type) {
                    case 'userLogin':
                        if (this.onUserLoggedIn) {
                            this.onUserLoggedIn(message.data);
                        }
                        break;
                    case 'userLogout':
                        if (this.onUserLoggedOut) {
                            this.onUserLoggedOut(message.data);
                        }
                        break;
                    case 'usersCountChanged':
                        if (this.onUserCountChanged) {
                            this.onUserCountChanged(message.data);
                        }
                        break;
                    case 'userMessage':
                        if (this.onUserMessageReceived) {
                            this.onUserMessageReceived(message.data);
                        }
                        break;
                    case 'userAvatarChange':
                        if (this.onAvatarLoaded) {
                            this.onAvatarLoaded(message.data);
                        }
                        break;
                    case 'usersList':
                        if (this.onUsersList) {
                            this.onUsersList(message.data);
                        }
                        break;
                }
            } catch (error) {
                console.log(error);
            }
        };
    }

    userLogin(state) {
        this.sendBaseMessage('userLogin', state);
    }

    userLogout(state) {
        if (!state) {
            return;
        }
        this.sendBaseMessage('userLogout', state);
    }

    userMessageSent(state, text) {
        this.send({
            type: 'userMessage',
            data: {
                username: state.username,
                userId: state.userId,
                text: text
            }
        });
    }

    userAvatarChange(state) {
        this.sendBaseMessage('userAvatarChange', state);
    }

    getUsersList(state) {
        this.sendBaseMessage('getUsersList', state)
    }

    sendBaseMessage(type, state) {
        this.send({
            type: type,
            data: {
                username: state.username,
                userId: state.userId
            }
        });
    }

    send(message) {
        this.webSocket.send(JSON.stringify(message));
    }

    waitForConnection() {
        const timeout = 1000;
        const waitingLimit = 5000;
        let waitingFor = 0;

        return new Promise((resolve, reject) => {
            let timer = setInterval(() => {
                if (this.webSocket.readyState === 1) {
                    clearInterval(timer);
                    resolve();
                } else {
                    waitingFor += timeout;
                }

                if (waitingFor >= waitingLimit) {
                    clearInterval(timer);
                    reject();
                }
            }, timeout);
        });
    }

    registerErrorHandlers() {
        this.webSocket.onerror = (event) => {
            console.log(`ERROR: ${event}`);
        };

        this.webSocket.close = () => {
            console.log('Connection closed!');
        };
    }

}