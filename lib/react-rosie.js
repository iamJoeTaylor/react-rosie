'use strict';

var _rosie = require('rosie');

var ReactPropTypes = ['string'];

var generators = {
  string: function string() {
    return Math.random().toString(36).slice(-8);
  }
};

_rosie.Factory.prototype.props = function (propTypes, React) {
  var _this = this;

  // add `displayName` to each validator we support
  ReactPropTypes.forEach(function (type) {
    return React.PropTypes[type].displayName = type;
  });

  var _loop = function _loop(prop) {
    var validator = propTypes[prop];
    var displayName = validator.displayName;
    if (!displayName) throw new Error('validator for prop \'' + prop + '\' not recognized');

    // If isRequired is still accessible then it hasn't been required yet
    var isRequired = !validator.isRequired;

    if (isRequired) {
      _this.attr(prop, generators[displayName]);
    } else {
      _this.option('_' + prop, false);
      _this.attr(prop, ['_' + prop], function (isIncluded) {
        if (isIncluded) return generators[displayName]();
      });
    }
  };

  for (var prop in propTypes) {
    _loop(prop);
  }
  return this;
};