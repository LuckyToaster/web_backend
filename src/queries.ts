import { AppDataSource } from "./orm"
import { Post } from "./orm";
import { Logger } from "./logger";
import fs from 'fs'

export { getThread, insert, nextPostId }

const MIMES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'audio/mp3', 'video/mp4', 'video/webm']
const log = new Logger('./util.ts');

async function getThread(): Promise<any> {
    return await AppDataSource.manager.find(Post)
        .catch(err => log.handle(err, 'getThread'))
}

async function nextPostId(): Promise<number> {
    const maxId = await AppDataSource.getRepository(Post)
        .query("select max(id) from post")
        .catch(e => log.handle(e, 'nextPostId', 'cannot select latest id'))
    return maxId[0].max + 1
}

async function insert(msg: string, f?: Express.Multer.File) {
    const p = new Post()
    p.msg = msg
    if (f) {
        if (f.size > 8388608) throw new Error(`${f.originalname} exceeds 8MB max size`)
        if (!MIMES.includes(f.mimetype)) throw new Error(`${f.originalname} of type ${f.mimetype} not supported`)
        const ext = f.mimetype.split('/')[1]
        fs.writeFile(`./media/${await nextPostId()}.${ext}`, f.buffer, e => log.handle(e, 'insert', 'error saving media'))
        p.media = true
        p.mediaMimeType = ext
    }
    await AppDataSource.manager.save(p).catch(e => log.handle(e, 'insert', 'insert post error'))
}

