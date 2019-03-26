import * as pulumi from '@pulumi/pulumi'
import * as cloud from '@pulumi/cloud'
import { SparkPostWebhookResource } from './sparkpost'

let events = new cloud.Table('sparkpost-events', 'event_id')

const webhookHandler = new cloud.API('sparkpost-webhook-handler')

webhookHandler.get('/', async (_, res) => {
  res
    .status(200)
    .end(
      'SparkPost Webhook Responder 🔥\n☁️ infrastructure made with ❤️ by Pulumi 🍹\n'
    )
})

webhookHandler.get('/events', async (_, res) => {
  try {
    const items = await events.scan()
    res.status(200).json(items)
  } catch (err) {
    res.status(500).json(err.stack)
    console.log(`GET /events error: ${err.stack}`)
  }
})

webhookHandler.post('/', async (req, res) => {
  console.log(`Batch ID ${req.headers['x-messagesystems-batch-id']}`)
  const payload = JSON.parse(req.body.toString())
  payload.forEach(
    async (event: { msys: { message_event: any; track_event: any } }) => {
      const { message_event, track_event } = event.msys
      try {
        if (message_event) {
          console.log(`Inserting message_event ${message_event.type}`)
          await events.insert(message_event)
        }
        if (track_event) {
          console.log(`Inserting track_event ${track_event.type}`)
          await events.insert(track_event)
        }
      } catch (err) {
        console.log(`Insert error: ${JSON.stringify(err.stack)}`)
      }
    }
  )
  res.status(200).end()
})

export const url = webhookHandler.publish().url

const webhook = new SparkPostWebhookResource('sparkpost-webhook', {
  url,
  events: ['delivery', 'initial_open']
})

export const id = webhook.id
