import { AppDataSource } from "./orm"
import { Post, Payment} from "./orm";
import { Logger } from "./logger";
import fs from 'fs'

export { 
    getThread, 
    insertPost, 
    nextPostId, 
    like, 
    dislike, 
    postExists, 
    paymentExists
}

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

// test this method
async function postExists(id: number): Promise<boolean> {
    return await AppDataSource.getRepository(Post)
        .exist({where: {id: id}})
}

// test this method
async function paymentExists(stripeId: string): Promise<boolean> {
    return await AppDataSource.getRepository(Payment)
        .exist({where: {stripeId: stripeId}})
}

async function like(id: string) {
    await AppDataSource.getRepository(Post)
        .query(`update post set likes = likes + 1 where id = ${parseInt(id, 10)}`)
}

async function dislike(id: string) {
    await AppDataSource.getRepository(Post)
        .query(`update post set dislikes = dislikes + 1 where id = ${parseInt(id, 10)}`)
}

async function insertPost(msg: string, f?: Express.Multer.File) {
    const p = new Post()
    if (p.msg == null || p.msg.length == 0) {
        log.handle(new Error('not gonna insert an empty message'))
        return
    }

    p.msg = msg
    if (f) {
        if (f.size > 8388608) throw new Error(`${f.originalname} exceeds 8MB max size`)
        if (!MIMES.includes(f.mimetype)) throw new Error(`${f.originalname} of type ${f.mimetype} not supported`)
        const ext = f.mimetype.split('/')[1]
        fs.writeFile(`./media/${await nextPostId()}.${ext}`, f.buffer, e => log.handle(e, 'insert', 'error saving media'))
        p.media = true
        p.mediaMimeType = ext
    }
    await AppDataSource.manager.save(p)
        .catch(e => log.handle(e, 'insertPost'))
}