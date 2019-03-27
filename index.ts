import * as cloud from '@pulumi/cloud'
import { SparkPostWebhookResource } from './sparkpost'

// Create a table `events` with `event_id` as primary key
let events = new cloud.Table('sparkpost-events', 'event_id')

// Create an internet-facing HTTP API
const webhookHandler = new cloud.API('sparkpost-webhook-handler')

// GET /  returns a simple message
webhookHandler.get('/', async (_, res) => {
  res
    .status(200)
    .end(
      'SparkPost Webhook Responder 🔥\n☁️ infrastructure made with ❤️ by Pulumi 🍹\n'
    )
})

// GET /events lists all events in the table
webhookHandler.get('/events', async (_, res) => {
  try {
    const items = await events.scan()
    res.status(200).json(items)
  } catch (err) {
    res.status(500).json(err.stack)
    console.log(`GET /events error: ${err.stack}`)
  }
})

// POST / inserts webhook events to the table
webhookHandler.post('/', async (req, res) => {
  const strBatchId = `Batch ID: ${req.headers['x-messagesystems-batch-id']}`
  console.log(`${strBatchId} ACK`)
  const payload = JSON.parse(req.body.toString())
  for (let event of payload) {
    const { message_event, track_event } = event.msys
    try {
      if (message_event) {
        console.log(`${strBatchId} INSERT message_event: ${message_event.type}`)
        await events.insert(message_event)
      }
      if (track_event) {
        console.log(`${strBatchId} INSERT track_event: ${track_event.type}`)
        await events.insert(track_event)
      }
    } catch (err) {
      console.log(`${strBatchId} INSERT error: ${JSON.stringify(err.stack)}`)
    }
  }
  res.status(200).end()
})

export const url = webhookHandler.publish().url

// Creates the SparkPost Webhook
const webhook = new SparkPostWebhookResource('sparkpost-webhook', {
  name: 'Pulumi Event Webhook',
  target: url,
  events: ['delivery', 'initial_open', 'click']
})
