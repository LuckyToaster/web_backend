import { getThread, insertPost, nextPostId, like, dislike, postExists} from './queries'
import { AppDataSource } from "./orm"
import { Logger } from "./logger"
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import Stripe from 'stripe';

//const stripe = require('stripe')('sk_test...')
const stripe = new Stripe('sk_test...');

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

server.get('/api/thread', async (_, res) => res.send(await getThread()))

server.get('/api/media/:id.:ext', async (req, res) => 
    res.sendFile(path.join(__dirname, '..', 'media', `${req.params.id}.${req.params.ext}`), err => {
        if (err instanceof Error) log.handle(err, 'GET', 'File not found')
        if (!res.headersSent) res.status(404).send('404 File Not Found')
    })
);

server.post('/api/insert', upload.single('file'), async (req, res) => {
    await insertPost(req.body.msg, req.file ? req.file : null).catch(err => {
        res.status(500).send(err) 
        log.handle(err)
    })
    res.status(201).send()
})

server.post('/api/like/:id', async (req, _) => await like(req.params.id))

server.post('/api/dislike/:id', async (req, _) => await dislike(req.params.id))

server.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  // Handle the event
  console.log(`Unhandled event type ${event.type}`);
  console.log(event)
  // Return a 200 response to acknowledge receipt of the event
  res.send(); // is this necessary?
});

server.listen(PORT, () => console.log('=> Server running'))

