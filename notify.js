// @flow

const aws = require('aws-sdk');

const options = require('./options');

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: options.region,
});

module.exports = {
  email(message/*: string*/) {
    return new Promise((resolve, reject) => {

      ses.sendEmail(
        {
          Source: options.notifyFrom,
          Destination: {
            ToAddresses: options.notifyTo,
          },
          Message: {
            Subject: {
              Data: message,
            },
            Body: {
              Text: {
                Data: message,
              },
            },
          },
        },
        (err, data) => {
          if (err) return reject(err);
          else return resolve(data);
        }
      );
    });
  },
};
