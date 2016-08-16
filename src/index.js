'use strict';

var _       = require('lodash');
var logger  = require('yocto-logger');
var joi     = require('joi');

/**
 * Default ingenico module
 */
function Ingenico (l) {
  /**
   * Default logger instance
   */
  this.logger = l;

  /**
   * Default gift card modules
   */
  this.modules = {
    giftCard : require('./modules/giftCard')(l)
  };

  /**
   * Default state
   */
  this.isReady = false;
}

/**
 * Default prepare function. Check config and valid preparation
 *
 * @param {Object} config default config to use
 * @return {Boolean} true if all is ok false otherwise
 */
Ingenico.prototype.prepare = function (config) {
  // default validation schema
  var schema = joi.object().required().keys({
    uri : joi.string().required().uri()
  });

  // validate config
  var validate = joi.validate(config, schema, { abortEarly : true });

  // has error ?
  if (!validate.error) {
    // parle all module to set config
    _.every(this.modules, function (module) {
      // set config on each module
      return module.use(validate.value);
    });

    // change ready state
    this.isReady  = true;
    // valid statement
    return true;
  } else {
    // log error
    this.logger.error([ '[ Ingenico.prepare ] - An error occured during prepare :',
      validate.error ].join(' '));
  }
  // default statement
  return false;
};

/**
 * Accessor method to retreive gift card module
 *
 * @return {Object} giftCard module to use
 */
Ingenico.prototype.giftCard = function () {
  // default statement
  return this.modules.giftCard;
};

/**
 * Export Ingenico classes
 */
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // log warning message
    logger.warning('[ Ingenico.constructor ] - Invalid logger given. Use internal logger');
    // assign new logger instance
    l = logger;
  }
  // default statement
  return new (Ingenico)(l);
};
