// @flow

'use strict';

const AWS = require('aws-sdk');

const options = require('./options');

const simpledb = new AWS.SimpleDB({region: options.region});

/*:: type Site = {name: string, url: string}; */
/*:: type Stats = {up: boolean, lastUp: number, lastDown: number}; */

function attr(name, value) {
  return {
    Name: name,
    Value: value,
    Replace: true,
  };
}

function parseResponse(data/*: Object */) /*: Stats */ {
  const result = {};
  data.Attributes.forEach(attr => {
    switch (attr.Name) {
      case 'up':
        result.up = attr.Value === 'true';
      break;
      case 'lastUp':
        result.lastUp = Number(attr.Value);
      break;
      case 'lastDown':
        result.lastDown = Number(attr.Value);
      break;
    }
  });
  return result;
}

module.exports = {
  simpledb: simpledb,
  write(site/*: Site*/, stats/*: Stats*/) {
    return new Promise((resolve, reject) => {
      const params = {
        Attributes: [
          attr('up', String(stats.up)),
          attr('lastUp', String(stats.lastUp)),
          attr('lastDown', String(stats.lastDown)),
        ],
        DomainName: options.domain,
        ItemName: site.name,
      };

      simpledb.putAttributes(params, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  },

  read(site/*: Site*/) /*: Promise<Stats> */ {
    return new Promise((resolve, reject) => {
      const params = {
        DomainName: options.domain,
        ItemName: site.name,
        AttributeNames: [
          'up',
          'lastUp',
          'lastDown',
        ],
        ConsistentRead: true,
      };

      simpledb.getAttributes(params, (err, data) => {
        if (err) return reject(err);
        if (!data.Attributes) return resolve({
          up: true,
          lastUp: 0,
          lastDown: 0,
        });
        return resolve(parseResponse(data));
      });
    });
  },
};
