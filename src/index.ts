import { AppDataSource } from "./data-source"
import { Post, Media } from "./entities"
import { Logger } from "./logger"
import express from 'express'
import cors from 'cors'
import multer from 'multer'

const PORT = 3000
const MIMES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'audio/mp3', 'video/mp4', 'video/webm']
const upload = multer({ storage: multer.memoryStorage() })
const server = express()
server.use(express.json())
server.use(cors({ origin: 'http://localhost:5173', methods: 'GET, POST', credentials: true }))
let log = new Logger('./index.ts')


AppDataSource.initialize().then(async () => {
    server.get('/api/thread', async (_, res) => res.send(await getThread()))
    server.get('/api/media/:id', async (req, res) => res.send(await getMediaByPostId(parseInt(req.params.id))))
    server.post('/api/insert', upload.single('file'), async (req, res) => {
        await insert(req.body.msg, req.file? req.file: null).catch(err => res.status(500).send(err.json()))
        res.status(201).send()
    })
    server.listen(PORT, () => console.log('=> Server running'))
}).catch(error => log.handle(error))


async function getThread(): Promise<any> {
    return await AppDataSource.manager.find(Post)
        .catch(err => log.handle(err, 'getThread'))
}


async function getMediaByPostId(id: number): Promise<Buffer> {
    return await AppDataSource.manager.getRepository(Media)
        .query(`select data where post_id = ${id}`)
        .catch(err => log.handle(err, 'getMediaByPostId'))
}


async function insert(msg: string, f?: Express.Multer.File) {
    const p = new Post()
    p.msg = msg
    if (f) {
        if (f.size > 2097152) throw new Error(`${f.originalname} exceeds 2MB max size`)
        if (!MIMES.includes(f.mimetype)) throw new Error(`${f.originalname} of type ${f.mimetype} not supported`)
        p.media = true;
        await AppDataSource.manager.save(p).catch(e => log.handle(e, 'insert', 'couldnt insert post'))
        const m = new Media()
        m.data = f.buffer
        m.post_id = p.id
        await AppDataSource.manager.save(m).catch(e => log.handle(e, 'insert', 'insert media error'))
    } else await AppDataSource.manager.save(p).catch(e => log.handle(e, 'insert', 'insert post error'))
}

