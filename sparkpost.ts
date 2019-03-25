//import * as SparkPostApi from 'sparkpost'
const SparkPost = require('sparkpost')
import * as pulumi from '@pulumi/pulumi'
import * as dynamic from '@pulumi/pulumi/dynamic'

const spApiKey = new pulumi.Config('sparkpost').require('api-key')

class SparkPostWebhookProvider implements dynamic.ResourceProvider {
  check = (olds: any, news: any) => {
    const failedChecks: dynamic.CheckFailure[] = []

    if (news['url'] === undefined) {
      failedChecks.push({
        property: 'url',
        reason: "required property 'url' missing"
      })
    }

    if (news['events'] === undefined) {
      failedChecks.push({
        property: 'events',
        reason: "required property 'events' missing"
      })
    }

    return Promise.resolve({ inputs: news, failedChecks })
  }

  diff = (id: pulumi.ID, olds: any, news: any) => {
    const replaces: string[] = []

    return Promise.resolve({ replaces })
  }

  create = async (inputs: any) => {
    const client = new SparkPost(spApiKey)

    const res = await client.webhooks.create({
      name: 'Pulumi created Webhook',
      target: inputs['url'],
      events: inputs['events']
    })

    console.log(res)

    return {
      id: `${res.results.id}`
    }
  }

  update = async (id: string, olds: any, news: any) => {
    const client = new SparkPost(spApiKey)

    const res = await client.webhooks.update(id, {
      target: news['url'],
      events: news['events']
    })

    return { outs: { id: res.results.id } }
  }

  delete = async (id: pulumi.ID, props: any) => {
    const client = new SparkPost(spApiKey)

    const res = await client.webhooks.delete(id)
  }
}

interface SparkPostWebhookResourceArgs {
  url: pulumi.Input<string>
  events: pulumi.Input<Array<string>>
}

export class SparkPostWebhookResource extends dynamic.Resource {
  constructor(
    name: string,
    args: SparkPostWebhookResourceArgs,
    opts?: pulumi.ResourceOptions
  ) {
    super(new SparkPostWebhookProvider(), name, args, opts)
  }
}
