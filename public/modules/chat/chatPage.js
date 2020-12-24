export default class ChatPage {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.userId = null
    }

    set onMessageSend(handler) {
        this.appContainer.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            if (action && action === 'message') {
                const input = this.appContainer.querySelector('.chat__messages-footer-input');
                const message = input.value;
                if (message) {
                    input.value = '';
                    handler(message);
                }
            }
        });
    }

    set onAvatarClick(handler) {
        this.appContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('list-user__avatar-img') && target.dataset.userId === this.userId) {
                handler()
            }
        })
    }

    showUserLoggedIn(username, userId, avatarURL) {
        const usersList = this.appContainer.querySelector('.chat__users-list');
        usersList.appendChild(this._buildListUserElement(username, userId, avatarURL));
        this._addSystemMessage(`${username} вошёл в чат!`);
    }

    showUserLoggedOut(username, userId) {
        const usersList = this.appContainer.querySelector('.chat__users-list');
        const listUserElements = usersList.querySelectorAll(`[data-user-id="${userId}"]`);
        listUserElements.forEach((element) => {
            usersList.removeChild(element);
        });
        this._addSystemMessage(`${username} покинул чат!`);
    }

    showUserMessage(username, userId, avatarURL, text, timestamp) {
        const messagesList = this.appContainer.querySelector('.chat__messages-body-list');
        const lastBlock = messagesList.lastElementChild;
        let time = this.timeFromTimestamp(timestamp)

        if (!lastBlock ||
            lastBlock.classList.contains('message-block--system') ||
            lastBlock.dataset.userId !== userId) {
            // добавляем новый блок
            console.log('добавляем новый блок')
            let newBlock = document.createElement('li');
            newBlock.classList.add('chat__messages-body-list-item', 'message-block');
            newBlock.dataset.userId = userId
            if (userId === this.userId) {
                newBlock.classList.add('message-block--own');
            }
            newBlock.innerHTML = `
                <div class="message-block-avatar-col">
                  <img src="${avatarURL}" alt="${username}" class="message-block-avatar-img" data-user-id="${userId}"/>
                </div>
                <div class="message-block-text-col text-blocks">
                    <p class="text-blocks__author">${username}</p>
                    <ul class="text-blocks__list">
                        <li class="text-blocks__list-item message">
                            <p class="message__text">${text}</p>
                            <p class="message__time">${time}</p>
                        </li>
                    </ul>
                </div>
            `;
            messagesList.appendChild(newBlock);

        } else if (lastBlock.dataset.userId === userId) {
            //добавляем сообщение в существующий блок
            let currentBlock = lastBlock.querySelector('.text-blocks__list');
            let newMessage = document.createElement('li');
            newMessage.classList.add('text-blocks__list-item', 'message');
            newMessage.innerHTML = `
                <p class="message__text">${text}</p>
                <p class="message__time">${time}</p>
            `;
            currentBlock.appendChild(newMessage);
        }
        this.scrollToChatBottom()
    }

    reloadAvatar(userId, avatarURL) {
        const avatars = this.appContainer.querySelectorAll(`img[data-user-id="${userId}"]`);
        avatars.forEach(img => {
            img.src = avatarURL
        })
    }

    updateUsersCount(count) {
        let form;
        let reminder = count % 10;
        if (reminder === 1) {
            form = 'участник';
        } else if (reminder >= 2 && reminder <= 4) {
            form = 'участника';
        } else {
            form = 'участников';
        }
        const countLabel = this.appContainer.querySelector('.chat__messages-heading-members');
        countLabel.innerText = `${count} ${form}`;
    }

    timeFromTimestamp(timestamp) {
        let date = new Date(timestamp)
        return date.toTimeString().slice(0, 5)
    }

    scrollToChatBottom() {
        let scrollableView = this.appContainer.querySelector('.chat__messages-body')
        scrollableView.scrollTop = scrollableView.scrollHeight;
    }

    _buildListUserElement(username, userId, avatarURL) {
        let item = document.createElement('li');
        item.classList.add('chat__users-list-item', 'list-user');
        item.dataset.userId = userId;
        item.innerHTML = `
      <img
        class="list-user__avatar-img"
        src="${avatarURL}"
        alt=""
        data-user-id="${userId}"
      />
      <div class="list-user__info">
        <p class="list-user__info-nickname">${username}</p>
        <p class="list-user__info-last-message"></p>
      </div>
    `;
        return item
    }

    _addSystemMessage(text) {
        const messagesList = this.appContainer.querySelector('.chat__messages-body-list');
        let newMessage = document.createElement('li');
        newMessage.classList.add('chat__messages-body-list-item', 'message-block', 'message-block--system');
        newMessage.innerHTML = `<p>${text}</p>`;
        messagesList.appendChild(newMessage);
    }

}
