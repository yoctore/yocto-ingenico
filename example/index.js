'use strict';

var ingenico  = require('../src/')();

var config    = { uri : 'https://3p.ims-loyalty.de/opallight/vindemia' };

if (ingenico.prepare(config)) {
  ingenico.giftCard().getBalance('CARD_NUMBER', 'PIN_CODE').then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
}
