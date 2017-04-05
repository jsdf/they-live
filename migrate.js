'use strict';

const db = require('./db');
const options = require('./options');

const params = {
  DomainName: options.domain,
};

db.simpledb.createDomain(params, function(err, data) {
  if (err) {
    console.error(err, err.stack);
  } else {
    console.log(data);
  }
});
