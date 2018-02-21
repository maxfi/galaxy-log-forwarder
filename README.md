# galaxy-log-forwarder

> A microservice that accepts Meteor Galaxy Elasticsearch logs and forwards them as simple JSON to your endpoint of choice.

## Why?

Meteor Galaxy can currently only forward logs to an Elasticsearch server. From the [Meteor Galaxy docs](https://github.com/meteor/galaxy-docs/blob/0a56e24aa6a4b64ecc801457a90be77b8171e338/source/logs.md):

> To use Galaxy's custom log storage support, set up your Elasticsearch server, and provide its URL as the `USER_LOG_DESTINATION` [environment variables](/environment-variables.html) in your app's `settings.json`.  Galaxy will send your app's standard output and standard error, as well as notifications of container start and exit events, to your Elasticsearch server.  Note that logs from building containers, as well as some other service logs from the Galaxy scheduler, are not at this time sent to your Elasticsearch server.

But what if you don't want to setup, configure and maintain and Elasticsearch server and would rather just forward the logs to a logging platform or other service that you are already using? That's where this project helps out!


## Usage

1. Run this package somewhere that is accessible to the internet.

```sh
npm start
```

2. Base64 encode the URL to forward galaxy logs to: 

```sh
echo "https://some-logging-service.com" | base64
```

3. Add the `USER_LOG_DESTINATION` environment variable to your meteor `settings.json` file:

```json
{
  "galaxy.meteor.com": {
    "env": {
      "USER_LOG_DESTINATION": "https://{{TOKEN}}:{{FORWARD_URL}}@{{ADDRESS}}"
    }
  }
}
```

* `TOKEN`       : This is not currently used. Can be set to anything.
* `FORWARD_URL` : Base64 encoded URL from step 2.
* `ADDRESS`     : Public URL of where this service is running.