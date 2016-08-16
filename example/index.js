'use strict';

var ingenico  = require('../src/')();

var config    = { uri : 'URL' };

if (ingenico.prepare(config)) {
  ingenico.giftCard().getBalance('CARD_NUMBER', 'PIN_CODE').then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
}