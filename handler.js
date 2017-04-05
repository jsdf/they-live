// @flow

'use strict';

const request = require('request');

const options = require('./options');
const db = require('./db');
const notify = require('./notify');

/*:: type Site = {name: string, url: string}; */
/*:: type Stats = {up: boolean, lastUp: number, lastDown: number}; */

const healthcheck = (site/*: Site*/, prevStats/*: Stats*/) => {
  return new Promise(resolve => {
    request(site.url, (error, response, body) => {
      const up = !error && response && response.statusCode == 200;

      const nextStats = {
        up: up,
        lastUp: up ? Date.now() : prevStats.lastUp,
        lastDown: up ? prevStats.lastDown : Date.now(),
      };
      resolve(nextStats);
    });
  }).then(
    nextStats => {
      return db.write(site, nextStats)
        .then(() => {
          const message = `THEY LIVE: ${site.name} is now ${nextStats.up ? 'up' : 'down'}`;
          if (prevStats.up !== nextStats.up) {
            console.log('notify.email', message);
            notify.email(message);
          }
        })
        .then(() => Object.assign({}, nextStats, site))
    }
  );
};

module.exports.cron = (
  event/*: Object*/,
  context/*: Object*/,
  callback/*: Function*/
) => {
  Promise.all(
    options.websites.map(site =>
      db.read(site)
        .then(prevStats => healthcheck(site, prevStats))
        .catch(err => Object.assign({}, site, {error: err}))
    )
  )
    .then(stats => {
      callback(null, {
        message: 'completed healthcheck',
        stats: stats,
      });
    })
    .catch(callback);
};
