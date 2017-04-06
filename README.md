![THEY LIVE](https://i.imgur.com/xjcXdWS.jpg)

THEY LIVE is a simple endpoint health monitor with email notifications, which
runs on AWS free tier services (Lambda, SimpleDB, SES), so it costs next-to-nothing to run.

### instructions

copy [config.default.js](config.default.js) to config.js and customise it:

```js
module.exports = {
  region: 'us-east-1', // aws region for simpledb & ses
  websites: [
    {
      name: 'example-site', // unique site name
      url: 'http://example.com/health', // endpoint to request for healthcheck
    },
  ],
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
yarn global add serverless
serverless deploy
```

watch for a successful invocation [in lambda console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/theylive-dev-cron?tab=monitoring)

