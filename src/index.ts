import { getThread, insertPost, like, dislike, getThreadSlice } from './queries'
import { AppDataSource } from "./orm"
import { Logger } from "./logger"
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import geoip from 'geoip-lite'

let log = new Logger('./index.ts')

const upload = multer({ storage: multer.memoryStorage() })
const server = express()
server.use(express.json())
server.use(cors({ 
    origin: '*',
    methods: 'GET, POST', credentials: true 
}))

AppDataSource.initialize()
    .then(async () => console.log("=> DB Connection established"))
    .catch(error => log.handle(error))

server.get('/api/media/:id.:ext', async (req, res) => {
    res.set('Cache-control', 'public, max-age=1d') 
    res.sendFile(path.join(__dirname, '..', 'media', `${req.params.id}.${req.params.ext}`), err => {
        if (err instanceof Error) log.handle(err, 'GET', 'File not found')
        if (!res.headersSent) res.status(404).send('404 File Not Found')
    })
});

server.post('/api/insert', upload.single('file'), async (req, res) => {
    console.log(`Post from ${geoip.lookup(req.ip).city} with ip ${req.ip}`) 
    await insertPost(req.body.msg.trim(), req.file ? req.file : null).catch(err => {
        res.status(500).send(err) 
        log.handle(err)
    })
    res.status(201).send()
})

server.get('/api/thread', async (_, res) => res.send(await getThread()))
server.get('/api/slice/:id', async (req, res) => res.send(await getThreadSlice(parseInt(req.params.id, 10))))
server.post('/api/like/:id', async (req, _) => await like(parseInt(req.params.id)))
server.post('/api/dislike/:id', async (req, _) => await dislike(parseInt(req.params.id)))
server.listen(3000, '0.0.0.0', () => console.log('=> Server running'))

