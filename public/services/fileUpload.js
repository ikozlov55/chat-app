export default class FileUploader {
    constructor(host) {
        this.host = host
    }

    upload(file, userId, callback) {
        let formData = new FormData()
        formData.append('file', file)
        formData.append('userId', userId)

        fetch(`${this.host}/photo/upload`, {
            method: 'POST',
            body: formData
        })
        .then(callback())
        .catch(error => {
            console.error('Error:', error);
        });
    }
}