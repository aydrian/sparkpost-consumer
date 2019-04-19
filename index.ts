import * as awsx from '@pulumi/awsx'
import * as aws from '@pulumi/aws'
import { SparkPostWebhookResource } from './sparkpost'

// Create a table `events` with `event_id` as primary key
const events = new aws.dynamodb.Table('sparkpost-events', {
  attributes: [
    {
      name: 'event_id',
      type: 'S'
    }
  ],
  hashKey: 'event_id',
  billingMode: 'PAY_PER_REQUEST'
})

// Create an internet-facing HTTP API
const webhookHandler = new awsx.apigateway.API('sparkpost-webhook-handler', {
  routes: [
    {
      // GET /  returns a simple message
      path: '/',
      method: 'GET',
      eventHandler: async event => {
        return {
          statusCode: 200,
          body:
            'SparkPost Webhook Responder 🔥\n☁️ infrastructure made with ❤️ by Pulumi 🍹\n'
        }
      }
    },
    {
      // GET /events lists all events in the table
      path: '/events',
      method: 'GET',
      eventHandler: async event => {
        try {
          const client = new aws.sdk.DynamoDB.DocumentClient()
          const scanResult = await client
            .scan({
              TableName: events.name.get()
            })
            .promise()
          return {
            statusCode: 200,
            body: JSON.stringify(scanResult.Items)
          }
        } catch (err) {
          console.log(`GET /events error: ${err.stack}`)
          return {
            statusCode: 500,
            body: err.stack
          }
        }
      }
    },
    {
      // POST / inserts webhook events to the table
      path: '/',
      method: 'POST',
      eventHandler: async event => {
        const strBatchId = `Batch ID: ${
          event.headers['X-MessageSystems-Batch-ID']
        }`
        console.log(`${strBatchId} ACK`)
        const body = event.body || '[]'
        const payload = JSON.parse(Buffer.from(body, 'base64').toString())
        const client = new aws.sdk.DynamoDB.DocumentClient()
        // TODO: Use some kind of pub sub (SNS) to move processing out of this function
        for (let event of payload) {
          const { message_event, track_event } = event.msys
          try {
            if (message_event) {
              console.log(
                `${strBatchId} INSERT message_event: ${message_event.type}`
              )
              await client
                .put({
                  TableName: events.name.get(),
                  Item: message_event
                })
                .promise()
            }
            if (track_event) {
              console.log(
                `${strBatchId} INSERT track_event: ${track_event.type}`
              )
              await client
                .put({
                  TableName: events.name.get(),
                  Item: track_event
                })
                .promise()
            }
          } catch (err) {
            console.log(
              `${strBatchId} INSERT error: ${JSON.stringify(err.stack)}`
            )
            return {
              statusCode: 500,
              body: ''
            }
          }
        }
        return {
          statusCode: 200,
          body: ''
        }
      }
    }
  ]
})

export const url = webhookHandler.url

// Creates the SparkPost Webhook
const webhook = new SparkPostWebhookResource('sparkpost-webhook', {
  name: 'Pulumi Event Webhook',
  target: url,
  events: ['delivery', 'initial_open', 'click']
})
