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
