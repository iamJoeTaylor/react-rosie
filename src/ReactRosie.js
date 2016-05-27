var Factory = require('rosie').Factory;

// TODO: Add more standard generators as needed
const generators = {
  bool: () => Boolean(Math.floor(Math.random() * 9) % 2),
  number: () => Math.floor(Math.random() * 1000),
  string: () => Math.random().toString(36).slice(-8),
};

/*
 * This method allows you to add a validator recognizer
 * and generator for custom propTypes
 *
 * EXAMPLE:
 * ```js
 * const customProp = function(props, propName, componentName) {
 *   if (!/matchme/.test(props[propName])) {
 *     return new Error(
 *       'Invalid prop `' + propName + '` supplied to' +
 *       ' `' + componentName + '`. Validation failed.'
 *     );
 *   }
 * };
 * new Factory()
 *   .validator(customProp, () => 'matchme PROP');
 * ```
 */
Factory.prototype.validator = function (validator, generator) {
  const uuid = Math.random().toString(36).slice(-8);
  generators[uuid] = generator;
  validator.displayName = uuid;
  if (validator.isRequired) {
    validator.isRequired.displayName = uuid;
  }
  return this;
};

/*
 * This method allows you to pass a hash of `key : PropType`.
 * Any `isRequired` prop will be auto-generated and any optional
 * prop will require an option of `_PROPNAME: true` to auto-generate.
 */
Factory.prototype.props = function (propTypes, React) {
  // We need to add some way to map the actual Type to
  // the function we recieve in the dictionary.
  Object.keys(React.PropTypes).forEach(type => {
    // add `displayName` to each validator we support
    React.PropTypes[type].displayName = type;
    if (React.PropTypes[type].isRequired) {
      React.PropTypes[type].isRequired.displayName = type;
    }
  });

  Object.keys(propTypes).forEach(prop => {
    const validator = propTypes[prop];

    const displayName = validator.displayName;
    if (!displayName) throw new Error(`validator for prop '${prop}' not recognized`);

    // If isRequired is still accessible then it hasn't been required yet
    const isRequired = !validator.isRequired;

    if (isRequired) {
      this.attr(prop, generators[displayName]);
    } else {
      this.option(`_${prop}`, false);
      this.attr(prop, [`_${prop}`], isIncluded => {
        if (isIncluded) return generators[displayName]();
      });
    }
  });
  return this;
};

export default Factory;
