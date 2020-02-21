'use strict';

var ingenico  = require('../src/')();
var _ = require('lodash');

var config    = {
  staging : { uri : 'https://3pqat.ims-loyalty.de/prepaidplus/vindemia' },
  production : { uri : 'https://3p.ims-loyalty.de/prepaidplus/vindemia' }
};

config = _.first(_.values(_.pick(config, _.toLower(process.env.NODE_ENV) || 'staging')));
console.log('testing in with following env values : ', config);

if (ingenico.prepare(config)) {
  ingenico.giftCard().getBalance('6391999501000285673', '1404').then(function (response) {
    console.log('response', response);
  }).catch(function (error) {
    console.log('error', error);
  });
}