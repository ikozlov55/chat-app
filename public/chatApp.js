import LoginPage from './modules/login/loginPage.js';
import ChatPage from './modules/chat/chatPage.js';
import PhotoUpload from './modules/photoUpload/photoUpload.js';
import PhotoSubmit from './modules/photoSubmit/photoSubmit.js';
import Router from './router.js';
import WsClient from './services/wsClient.js';
import {sha256hash} from './services/utils.js';
import FileUploader from './services/fileUpload.js';

const config = {
    wsURL: 'ws://localhost:3000',
    imagesURL: 'http://localhost:3000/photo',
    uploadURL: 'http://localhost:3000'
};

export default class ChatApp {
    constructor() {
        this.state = null;
        window.onload = this.main.bind(this);
    }

    async main() {
        const appContainer = document.querySelector('#app');
        const modalContainer = document.querySelector('#modal');
        const router = new Router(appContainer, modalContainer);
        const loginPage = new LoginPage(appContainer);
        const chatPage = new ChatPage(appContainer);
        const photoUpload = new PhotoUpload(modalContainer);
        const photoSubmit = new PhotoSubmit(modalContainer);

        const wsClient = new WsClient(config.wsURL);
        const fileUploader = new FileUploader(config.uploadURL)
        await wsClient.waitForConnection();

        loginPage.onSubmit = async (username) => {
            this.state = {
                username: username,
                userId: await sha256hash(username),
            };
            chatPage.userId = this.state.userId;
            await router.openChatPage();
            wsClient.userLogin(this.state);
            wsClient.getUsersList(this.state)
        };

        loginPage.onLogout = () => {
            wsClient.userLogout(this.state);
        };

        chatPage.onMessageSend = (text) => {
            wsClient.userMessageSent(this.state, text);
        };

        chatPage.onAvatarClick = async () => {
            await router.showPhotoUploadPopup();
        };

        photoUpload.onCloseButtonClick = () => {
            router.closeModal()
        }

        photoUpload.onFileDropped = async (file) => {
            router.closeModal()
            await router.showPhotoSubmitPopup()
            photoSubmit.showImage(file)
        }

        photoSubmit.onCloseButtonClick = async () => {
            router.closeModal()
            await router.showPhotoUploadPopup()
        }

        photoSubmit.onSubmitButtonClick = async (file) => {
            await fileUploader.upload(file, this.state.userId)
            router.closeModal()
            wsClient.userAvatarChange(this.state)
        }

        wsClient.onUserLoggedIn = (data) => {
            const {username, userId} = data;
            chatPage.showUserLoggedIn(username, userId, this.getAvatarURL(userId));
        };

        wsClient.onUsersList = (data) => {
            const {usersList} = data;
            if (usersList.length) {
                chatPage.showUsersList(usersList.map(userData => {
                    userData.avatarURL = this.getAvatarURL(userData.userId)
                    return userData
                }))
            }
        }

        wsClient.onUserLoggedOut = (data) => {
            const {username, userId} = data;
            chatPage.showUserLoggedOut(username, userId);
        };

        wsClient.onUserCountChanged = (data) => {
            chatPage.updateUsersCount(data.usersCount);
        };

        wsClient.onUserMessageReceived = (data) => {
            const {username, userId, text, timestamp} = data;
            chatPage.showUserMessage(username, userId, this.getAvatarURL(userId), text, timestamp);
        };

        wsClient.onAvatarLoaded = (data) => {
            const {userId} = data;
            chatPage.reloadAvatar(userId, this.getAvatarURL(userId))
        };

        await router.openLoginPage();
    }

    getAvatarURL(userId) {
        return `${config.imagesURL}/${userId}?${new Date().getTime()}`;
    }
}
