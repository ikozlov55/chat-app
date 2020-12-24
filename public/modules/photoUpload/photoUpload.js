export default class PhotoUpload {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.addDefaultListeners()
    }

    set onCloseButtonClick(handler) {
        this.appContainer.addEventListener('click', (event) => {
            const action = event.target.parentNode.dataset.action;
            if (action && action === 'close') {
                handler()
            }
        });
    }

    set onFileDropped(handler) {
        this.appContainer.addEventListener('drop', event => {
            event.preventDefault()
            const action = event.target.dataset.action;
            if (action && action === 'drag') {
                this.clearPlaceholderActive()
                if (!event.dataTransfer.items.length) {
                    return
                }
                const data = event.dataTransfer.items[0]
                if (!data.type.startsWith('image')) {
                    return;
                }
                const file = data.getAsFile()
                if (file.size === 0) {
                    return;
                }
                handler(file)
            }
        })
    }

    addDefaultListeners() {
        this.appContainer.addEventListener('dragover', event => {
            event.preventDefault()
            const action = event.target.dataset.action;
            if (action && action === 'drag') {
                this.setPlaceholderActive()
            }
        })

        this.appContainer.addEventListener('dragleave', event => {
            const action = event.target.dataset.action;
            if (action && action === 'drag') {
                this.clearPlaceholderActive()
            }
        })
    }

    setPlaceholderActive() {
        const placeholder = this.appContainer.querySelector('.photo-upload__placeholder-img-container')
        placeholder.classList.add('photo-upload__placeholder-img-container--active')
    }

    clearPlaceholderActive() {
        const placeholder = this.appContainer.querySelector('.photo-upload__placeholder-img-container')
        placeholder.classList.remove('photo-upload__placeholder-img-container--active')
    }

}
