[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new)

# Serverless SparkPost Webhook Consumer

This example will create an endpoint that will insert events posted by [SparkPost](https://www.sparkpost.com) to a database.

## Deploying and running the program

Note: some values in this example will be different from run to run. These values are indicated
with `***`.

1. Create a new stack:

   ```
   $ pulumi stack init sparkpost-consumer
   ```

1. Set Cloud Provider config values
   ```
   $ pulumi config set aws:region us-east-1
   ```
1. Add your [SparkPost API Key](https://support.sparkpost.com/customer/portal/articles/1933377-create-api-keys). It must have `Event Webhook: Read/Write` permissions. It is recommended that it has no other permissions.
   ```
   $ pulumi config set --secret sparkpost:api-key <YOUR API KEY>
   ```
1. Restore NPM modules via `npm install` or `yarn install`.

1. Preview and run the deployment via `pulumi up`. The operation will take about 2 minutes to complete and will create 24 resources.

1. To view the url for the API endpoint, run `pulumi stack output`:

   ```
   $ pulumi stack output endpointUrl
   https://***.us-east-1.amazonaws.com/stage/
   ```

### Logging

To view aggregated logs of the running application, use the `pulumi logs` command. These are logs across all of the compute for the application. To view a log stream, use the `--follow` flag:

```
$ pulumi logs --follow
```

## Clean up

To clean up resources, run `pulumi destroy` and answer the confirmation question at the prompt.
