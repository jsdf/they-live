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
