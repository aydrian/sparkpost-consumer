import * as pulumi from '@pulumi/pulumi'
import { SparkPostWebhookResource } from './sparkpost'

const webhook = new SparkPostWebhookResource('hook-registration', {
  url: 'http://requestbin.fullcontact.com/1k06v0t1',
  events: ['delivery', 'initial_open']
})

export const id = webhook.id
