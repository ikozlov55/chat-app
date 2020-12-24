const path = require('path')
const fs = require('fs')
const http = require("http");
const express = require('express')
const multer = require('multer')

const imgFolderPath = path.join(__dirname, 'img/')
const upload = multer({dest: imgFolderPath})

const WebSocketServer = require('./webSocket')
const port = 3000
const app = express()
const server = http.createServer(app);
const wsServer = new WebSocketServer(server)

const imgDir = '/img'
const allowedExtensions = ['.png', '.jpg']

app.use(express.static('public'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/photo/:userId', (request, response) => {
    const userId = request.params.userId
    response.setHeader('Cache-Control', 'no-cache')
    let photo = null
    for (let ext of allowedExtensions) {
        let photoPath = path.join(__dirname, imgDir, `${userId}${ext}`)
        if (fs.existsSync(photoPath)) {
            photo = photoPath
        }
    }
    let result = photo || path.join(__dirname, imgDir, 'unknown.png')
    response.sendFile(result);
})

app.post('/photo/upload', upload.single('file'), (request, response) => {
    const file = request.file
    const userId = request.body.userId

    if (!userId || !file) {
        response.sendStatus(400)
    } else if (!allowedExtensions.includes(path.extname(file.originalname))) {
        let tempFile = path.join(file.destination, file.filename)
        fs.unlinkSync(tempFile)
        response.sendStatus(400)
    } else {
        let tempFile = path.join(file.destination, file.filename)
        let targetFile = path.join(imgFolderPath, userId + path.extname(file.originalname))
        fs.copyFileSync(tempFile, targetFile)
        fs.unlinkSync(tempFile)
        response.sendStatus(200)
    }
})

server.listen(port)
wsServer.start()