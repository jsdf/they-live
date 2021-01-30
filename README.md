![THEY LIVE](https://i.imgur.com/xjcXdWS.jpg)

THEY LIVE is a simple endpoint health monitor with email notifications, which
runs on AWS free tier services (Lambda, SimpleDB, SES), so it costs next-to-nothing to run.

### instructions

first, clone this repo

copy [config.default.js](config.default.js) to config.js and customise it:

```js
module.exports = {
  region: 'us-east-1', // aws region for simpledb & ses
  websites: {
    // websites grouped by key which must match the 'group' parameter
    // passed to the cron event in serverless.yml. this makes it possible to
    // configure different intervals of invocation for different endpoints
    oncePer10Mins: [
      {
        name: 'example-site', // unique site name
        url: 'http://example.com/health', // endpoint to request for healthcheck
      },
    ],
    // another group which pings at a different interval
    oncePerDay: [
      {
        name: 'other-site',
        url: 'http://example.com/health2',
      },
    ],
  },
  notifyTo: ['someguy@example.com'], // email to notify of health changes
  notifyFrom: 'someguy@example.com', // email to send notification from
};
```

run `yarn install` to install dependencies

run `aws configure` if you haven't already, to set up aws credentials

run `node migrate.js` to create the AWS SimpleDB 'domain' (basically a database)

verify your email address [in AWS SES console](https://console.aws.amazon.com/ses/home?region=us-east-1#verified-senders-email:)

deploy using serverless framework

```bash
yarn global add serverless # install globally
serverless deploy
```

watch for a successful invocation [in lambda console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/theylive-dev-cron?tab=monitoring)

you can also test that it runs locally


```bash
# assuming you've installed serverless globally
yarn local
```
