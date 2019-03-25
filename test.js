const SparkPost = require('sparkpost')
const spApiKey = '58380d85577c306418587b2f2b640fed51dfc6f2'

const inputs = {
  url: 'http://requestbin.fullcontact.com/1k06v0t1',
  events: ['initial_open']
}

const main = async () => {
  const client = new SparkPost(spApiKey)

  const res = await client.webhooks.create({
    name: 'Pulumi created Webhook',
    target: inputs['url'],
    events: inputs['events']
  })

  console.log(res)
}

main()
