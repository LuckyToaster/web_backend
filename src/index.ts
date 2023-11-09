import { AppDataSource } from "./data-source"
import { Logger } from "./logger"
import { getThread, insert, nextPostId } from './util'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'

let log = new Logger('./index.ts')

const PORT = 3000
const server = express()
server.use(express.json())
server.use(cors({ 
    origin: 'http://localhost:5173', 
    methods: 'GET, POST', credentials: true 
}))
const upload = multer({ storage: multer.memoryStorage() })

AppDataSource.initialize()
    .then(async () => console.log("=> DB Connection established"))
    .catch(error => log.handle(error))

server.get('/api/thread', async (_, res) => res.send(await getThread()))

server.get('/api/media/:id.:ext', async (req, res) => 
    res.sendFile(path.join(__dirname, '..', 'media', `${req.params.id}.${req.params.ext}`), err => {
        if (err instanceof Error) log.handle(err, 'GET', 'File not found')
        if (!res.headersSent) res.status(404).send('404 File Not Found')
    })
);

server.post('/api/insert', upload.single('file'), async (req, res) => {
    await insert(req.body.msg, req.file ? req.file : null).catch(err => {
        res.status(500).send(err.json()) // .send(err.json())
        log.handle(err)
    })
    res.status(201).send()
})

server.listen(PORT, () => console.log('=> Server running'))
