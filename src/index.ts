import { getThread, insertPost, insertPayment, nextPostId, like, dislike, postExists} from './queries'
import { AppDataSource } from "./orm"
import { Logger } from "./logger"
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import Stripe from 'stripe';
//const stripe = new Stripe('sk_test...');

let log = new Logger('./index.ts')

//const endpointSecret = "whsec_5f8fe6b3b511f7e515b62202ff70040bf5a453883da35fff09e2a066f3815843";
const endpointSecret = "whsec_5f8fe6b3b511f7e515b62202ff70040bf5a453883da35fff09e2a066f3815843";

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


server.get('/api/media/:id.:ext', async (req, res) => 
    res.sendFile(path.join(__dirname, '..', 'media', `${req.params.id}.${req.params.ext}`), err => {
        if (err instanceof Error) log.handle(err, 'GET', 'File not found')
        if (!res.headersSent) res.status(404).send('404 File Not Found')
    })
);

// check the header with jwt from client 
server.post('/api/insert', upload.single('file'), async (req, res) => {
    await insertPost(req.body.msg, req.file ? req.file : null).catch(err => {
        res.status(500).send(err) 
        log.handle(err)
    })
    res.status(201).send()
})

server.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'] // do i even need this?
    if (req.body.type === 'charge.succeeded') // have webhook on charge.succeeded
        await insertPayment(req.body.id, req.body.data.object.amount, req.body.data.object.receipt_url)
    res.send() // Return a 200 response to acknowledge receipt of the event
});

server.get('/api/thread', async (_, res) => res.send(await getThread()))

// check the header with jwt from client 
server.post('/api/like/:id', async (req, _) => await like(req.params.id))

// check the header with jwt from client 
server.post('/api/dislike/:id', async (req, _) => await dislike(req.params.id))

server.listen(PORT, () => console.log('=> Server running'))

