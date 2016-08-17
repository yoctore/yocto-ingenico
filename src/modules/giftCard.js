'use strict';

var _         = require('lodash');
var Q         = require('q');
var request   = require('request');
var xmlParser = require('xml2json');
var logger    = require('yocto-logger');

/**
 * Default module for giftCard request
 */
function GiftCard (l) {
  /**
   * Default logger instance
   */
  this.logger = l;

  /**
   * Default config instance
   */
  this.config = {};
}

/**
 * Default use method to setup config
 *
 * @param {Object} config default config
 * @return {Boolean} true when config is set
 */
GiftCard.prototype.use = function (config) {
  // set config
  this.config = config;
  // default statement
  return true;
};

/**
 * Default method to getBalance from a cardNumber & password
 *
 * @param {String} cardNumber default card number
 * @param {String} password default password to use
 * @return {Object} default promise to catch
 */
GiftCard.prototype.getBalance = function (cardNumber, password) {

  // error lists
  var errors = [
    { code : '00' },
    { code : '02', message : 'Carte ou compte bloqué' },
    { code : '30', message : 'Requête invalide' },
    { code : '33', message : 'Votre carte à expirée' },
    { code : '43', message : 'Votre carte est inactive' },
    { code : '55', message : 'Votre code pin est invalide' },
    { code : '56', message : 'Carte Inconnue' },
    { code : '91', message : 'Erreur interne au système' },
    { code : '-1', message : 'Impossible de connaitre votre solde' }
  ];

  // Create defer process
  var deferred = Q.defer();

  // process request
  request({
    method    : 'GET',
    uri       : [ this.config.uri, 'GetBalance' ].join('/'),
    qs        : { 'CardNumber' : cardNumber, 'Pin' : password }
  }, function (error, response, body) {
    // has no error ?
    if (!error && response.statusCode === 200) {
      // parse response
      var  result = xmlParser.toJson(body, { object : true, trim : true });

      // has valid format ?
      if (_.has(result, 'AutSys.Reply')) {
        // get json reply only
        var reply = _.get(result, 'AutSys.Reply');
        // has a reponse code
        if (_.has(reply, 'ResponseCode')) {
          // response code
          var code    = _.get(reply, 'ResponseCode');
          // response message
          var message = _.first(_.values(_.pickBy(errors, function (error) {
            // default statement
            return error.code === code;
          })));

          // has error ?
          if (code !== '00') {

            // reject error
            this.logger.error([ '[ Ingenico.giftCard.GetBalance ] -',
              'Invalid response code retreive from GetBalance call. Code :', code,
              '- Message :', message.message ].join(' '));
            // reject with an object
            deferred.reject({ code : code, message : message.message });
          } else {
            // resolve with data
            deferred.resolve(reply);
          }
        } else {
          // reject with message
          deferred.reject([ 'Cannot retrive reponse code from response :', body ].join(' '));
        }
      } else {
        // reject error
        deferred.reject([ 'Invalid format retreive from GetBalance call', result ].join(' '));
      }
    } else {
      // reject
      deferred.reject(error);
    }
  }.bind(this));

  // default statement
  return deferred.promise;
};

/**
 * Export GiftCard from Ingenico
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log warning message
    logger.warning('[ Ingenico.GiftCard.constructor ] - Invalid logger given. Use internal logger');
    // assign new logger instance
    l = logger;
  }
  // default statement
  return new (GiftCard)(l);
};
