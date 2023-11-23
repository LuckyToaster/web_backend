import { getThread, insert, nextPostId, like, dislike} from './queries'
import { AppDataSource } from "./orm"
import { Logger } from "./logger"
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'

let log = new Logger('./index.ts')

const PORT = 3000
const upload = multer({ storage: multer.memoryStorage() })
const server = express()
server.use(express.json())
server.use(cors({ 
    origin: 'http://localhost:5173', 
    methods: 'GET, POST', credentials: true 
}))

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
        res.status(500).send(err) 
        log.handle(err)
    })
    res.status(201).send()
})

server.post('/api/like/:id', async (req, _) => await like(req.params.id))

server.post('/api/dislike/:id', async (req, _) => await dislike(req.params.id))

server.listen(PORT, () => console.log('=> Server running'))
