'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cluster = undefined;

var _couchbase = require('couchbase');

var couchbase = _interopRequireWildcard(_couchbase);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Cluster = couchbase.Cluster; /* eslint import/prefer-default-export: 0 */

exports.Cluster = Cluster;