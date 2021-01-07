export default class Router {
    constructor(appContainer, modalContainer) {
        this.appContainer = appContainer;
        this.modalContainer = modalContainer;
        this.map = {
            login: './modules/login/loginPage.html',
            photoUpload: './modules/photoUpload/photoUpload.html',
            photoSubmit: './modules/photoSubmit/photoSubmit.html',
            chat: './modules/chat/chatPage.html'
        };
    }

    async openLoginPage() {
        await this.openPage('login')
    }

    async openChatPage() {
        await this.openPage('chat')
    }

    async openPage(route) {
        const pageHtmlPath = this.map[route];
        if (pageHtmlPath) {
            let response = await fetch(pageHtmlPath);
            let html = await response.text();
            this.appContainer.innerHTML = html;
        }
    }

    async showPhotoUploadPopup() {
        await this.openModal('photoUpload')
    }

    async showPhotoSubmitPopup() {
        await this.openModal('photoSubmit')
    }

    async openModal(route) {
        const popupHtmlPath = this.map[route];
        if (popupHtmlPath) {
            const response = await fetch(popupHtmlPath);
            const html = await response.text();
            this.modalContainer.innerHTML = html;
            this.modalContainer.classList.remove('hidden')
        }
    }

    closeModal() {
        this.modalContainer.innerHTML = ''
        this.modalContainer.classList.add('hidden')
    }
}
