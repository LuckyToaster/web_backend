import { AppDataSource } from "./data-source"
import { Post, Media } from "./entities"
import { Logger } from "./logger"
import express from 'express'
import cors from 'cors'
import multer from 'multer'

const MIMES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'audio/mp3', 'video/mp4', 'video/webm']
const PORT = 3000
const server = express()
server.use(express.json())
server.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET, POST',
    credentials: true
}))
const upload = multer({ storage: multer.memoryStorage() })
let log = new Logger('./index.ts')

AppDataSource.initialize().then(async () => {
    server.get('/api/thread', async (_, res) => res.send(await getThread()))

    server.get('/api/media/:id', async (req, res) => res.send(await getMediaByPostId(parseInt(req.params.id))))

    server.post('/api/insert', upload.single('file'), async (req, res) => {
        await insert(req.body.msg, req.file? req.file: null).catch(err => res.status(500).send())
        res.status(201).send()
    })

    server.listen(PORT, () => console.log(`=> Express running on port ${PORT}`))
}).catch(error => log.handle(error))


async function getThread(): Promise<any> {
    return await AppDataSource.manager.find(Post)
        .catch(err => log.handle(err, 'getThread', 'couldnt get posts from DB'))
}


async function getMediaByPostId(id: number): Promise<Buffer> {
    return await AppDataSource.manager.getRepository(Media)
        .query(`select data where post_id = ${id}`)
        .catch(err => log.handle(err, 'getMediaByPostId', 'couldnt get media file from DB'))
}

async function insert(msg: string, file?: Express.Multer.File) {
    const p = new Post()
    p.msg = msg
    if (file) {
        if (file.size > 2097152) throw new Error(`${file.originalname} exceeds 2MB max size`)
        if (!MIMES.includes(file.mimetype)) throw new Error(`${file.originalname} of type ${file.mimetype} not supported`)
        p.media = true;
        await AppDataSource.manager.save(p).catch(err => log.handle(err, 'insert', 'couldnt insert post'))
        const m = new Media()
        m.data = file.buffer
        m.post_id = p.id
        await AppDataSource.manager.save(m).catch(err => log.handle(err, 'inset', 'couldnt insert media'))
    } else await AppDataSource.manager.save(p).catch(err => log.handle(err, 'insert', 'couldnt insert post'))
}


function sizeSupported(buff: Buffer): boolean {
    if (buff.length > 5242880) 
        throw new Error(`file size exceeds 5MB limit`)
    console.log(buff.length)
    return true
}