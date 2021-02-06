// @flow

'use strict';

const request = require('request');

const options = require('./options');
const db = require('./db');
const notify = require('./notify');

function log(...args) {
  if (options.log) {
    console.log(...args);
  }
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const requestAsync = url =>
  new Promise(resolve => {
    request(url, (error, response, body) => {
      return resolve({error, response, body});
    });
  });

/*:: type Site = {
  name: string,
  url: string,
  attempts?: number,
  interval?: number,
}; */
/*:: type Stats = {up: boolean, lastUp: number, lastDown: number}; */

async function makeRequestWithRetries(site) {
  const attempts = site.attempts != null ? site.attempts : 1;
  const interval = site.interval != null ? site.interval : 5;
  for (var i = 0; i < attempts; i++) {
    const {error, response, body} = await requestAsync(site.url);
    const up = !error && response && response.statusCode == 200;
    log(
      `${site.name} attempt ${i + 1}: ${up ? 'success' : 'fail'} ${error || (response && response.statusCode)} `
    );
    if (up || i === attempts - 1) return {error, response, body, up};
    await sleep(interval * 1000);
  }
  throw new Error(`unreachable`);
}

async function healthcheck(site /*: Site*/) {
  const prevStats = await db.read(site);

  const result = await makeRequestWithRetries(site);

  const nextStats = {
    up: result.up,
    lastUp: result.up ? Date.now() : prevStats.lastUp,
    lastDown: result.up ? prevStats.lastDown : Date.now(),
  };

  await db.write(site, nextStats);

  const message = `THEY LIVE: ${site.name} is now ${nextStats.up ? 'up' : 'down'}`;
  if (prevStats.up !== nextStats.up) {
    log('notify.email', message);
    notify.email(message);
  }

  return {
    site,
    nextStats,
  };
}

async function cron(
  event /*: Object*/,
  context /*: Object*/,
  callback /*: Function*/
) {
  try {
    const websites = options.websites[event.group] || [];
    log('running cron', event.group, websites.map(w => w.name));
    const stats = await Promise.all(
      websites.map(async site => {
        try {
          return await healthcheck(site);
        } catch (error) {
          return {
            site,
            error,
          };
        }
      })
    );
    log('completed successfully');

    callback(null, {
      message: 'completed healthcheck',
      stats,
    });
  } catch (err) {
    callback(err);
  }
}

module.exports.cron = cron;
