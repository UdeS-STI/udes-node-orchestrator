"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Get current user information from CAS.
 * @private
 * @param {Object} [req] - HTTP request.
 * @returns {Object} User.
 */
var getUser = exports.getUser = function getUser(req) {
  if (req && req.session && req.session.cas && req.session.cas.user) {
    return req.session.cas.user;
  }

  return {};
};

/**
 * Get CAS attributes.
 * @private
 * @param {Object} req - HTTP request.
 * @returns {Object} Attributes.
 */
var getAttributes = exports.getAttributes = function getAttributes(req) {
  if (req && req.session && req.session.cas && req.session.cas.attributes) {
    var attributes = req.session.cas.attributes;

    return Object.keys(attributes).reduce(function (acc, key) {
      var accumulation = acc;
      var attribute = attributes[key];
      var getValue = Array.isArray(attribute) && attribute.length === 1;

      accumulation[key] = getValue ? attribute[0] : attribute;

      return accumulation;
    }, {});
  }

  return {};
};