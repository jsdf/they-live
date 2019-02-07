// @flow

'use strict';

const request = require('request');

const options = require('./options');
const db = require('./db');
const notify = require('./notify');

const requestAsync = url =>
  new Promise(resolve => {
    request(url, (error, response, body) => {
      return resolve({error, response, body});
    });
  });

/*:: type Site = {name: string, url: string}; */
/*:: type Stats = {up: boolean, lastUp: number, lastDown: number}; */

async function healthcheck(site /*: Site*/, prevStats /*: Stats*/) {
  const {error, response, body} = await requestAsync(site.url);
  const up = !error && response && response.statusCode == 200;

  const nextStats = {
    up: up,
    lastUp: up ? Date.now() : prevStats.lastUp,
    lastDown: up ? prevStats.lastDown : Date.now(),
  };

  await db.write(site, nextStats);

  const message = `THEY LIVE: ${site.name} is now ${
    nextStats.up ? 'up' : 'down'
  }`;
  if (prevStats.up !== nextStats.up) {
    console.log('notify.email', message);
    notify.email(message);
  }

  return {
    ...nextStats,
    ...site,
  };
}

async function cron(
  event /*: Object*/,
  context /*: Object*/,
  callback /*: Function*/
) {
  try {
    const stats = await Promise.all(
      options.websites.map(async site => {
        try {
          const prevStats = await db.read(site);
          return await healthcheck(site, prevStats);
        } catch (error) {
          return {
            ...site,
            error,
          };
        }
      })
    );

    callback(null, {
      message: 'completed healthcheck',
      stats,
    });
  } catch (err) {
    callback(err);
  }
}

module.exports.cron = cron;
