export default class PhotoSubmit {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.currentFile = null
    }

    showImage(file) {
        this.currentFile = file
        const img = this.appContainer.querySelector('.photo-submit__img')
        const reader = new FileReader()
        reader.onload = (event) => {
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }

    set onCloseButtonClick(handler) {
        this.appContainer.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            if (action && action === 'close') {
                this.currentFile = null
                handler()
            }
        });
    }

    set onSubmitButtonClick(handler) {
        this.appContainer.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            if (action && action === 'submit') {
                handler(this.currentFile)
                this.currentFile = null
            }
        });
    }


}
