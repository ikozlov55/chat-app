export default class FileUploader {
    constructor(host) {
        this.host = host
    }

    async upload(file, userId) {
        let formData = new FormData()
        formData.append('file', file)
        formData.append('userId', userId)

        try {
            await fetch(`${this.host}/photo/upload`, {
                method: 'POST',
                body: formData
            })
        } catch (e) {
            console.error('Error:', error);
        }
    }
}