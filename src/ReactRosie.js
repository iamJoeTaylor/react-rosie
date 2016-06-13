const Factory = require('rosie').Factory;

const randomString = (length = 8) => {
  let random = Math.random().toString(36).slice(2);
  if (length > random.length) {
    random = random + randomString(length - random.length);
  }
  return random.slice(-length);
}
const weightedRand = spec => {
  if (typeof spec === 'number') {
    const _spec = {};
    for (let i = 0; i < spec; i++) {
      _spec[i] = 1/spec;
    }
    spec = _spec
  }
  let i;
  let sum = 0
  const r = Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}

const generateArrayWithOpts = (opts, generator) => {
  const returnArray = [];
  const numberOfItems = weightedRand(opts.weight || {0:0.7, 1:0.2, 2:0.1});
  for (let i = 0; i < numberOfItems; i++ ) {
    returnArray.push(generator(i));
  }
  return returnArray;
};

// Abstract the option accepter function out so the curry below is less crazy
const acceptOptions = (optsName, cb) => (opts = {}) => {
  if (!cb) {
    cb = optsName;
    optsName = undefined;
  }
  if (optsName) opts = opts[optsName];

  return () => cb(opts);
};

const generators = {
  any: () => generators[ Object.keys(generators)[weightedRand(Object.keys(generators).length)] ](),
  array: acceptOptions('array', (opts = {}) => {
    return generateArrayWithOpts(opts, () => generators.node()());
  }),
  bool: () => Boolean(Math.floor(Math.random() * 9) % 2),
  func: acceptOptions('func', (opts = {}) => opts.stub || function() {}),
  node: () => generators[ ['array', 'number', 'string'][weightedRand({ 0: .3, 1: .3, 2: .4 })] ](),
  number: acceptOptions('number', (opts = {}) => {
    const min = opts.min || 0;
    const max = opts.max || 1000;
    return Math.floor(Math.random() * (max - min)) + min;
  }),
  object: () => ({ test: 'props'}),
  string: acceptOptions('string', (opts = {}) => randomString(opts.stringLength)),
};

/*
 * These need to define AT LEAST one curried function. This function will be called once
 * on when assigning a React PropType.
 */
const curiedPropTypes = {
  arrayOf: child => acceptOptions('arrayOf', (opts = {}) => {
    const childOpts = {};
    if(child.displayName && opts[child.displayName]) {
      childOpts[child.displayName] = opts[child.displayName];
    }

    return generateArrayWithOpts(opts, () => {
      return new Factory()
        .props({ value: child }, { value: childOpts })
        .build({}, { _value: true })
        .value
    });
  }),
  instanceOf: Constructor => acceptOptions('instanceOf', (opts = {}) => {
    const args = opts.args || [];
    return new Constructor(...args);
  }),
  objectOf: type => acceptOptions('objectOf', (opts = {}) => {
    const shape = {};
    const propsOpts = opts.opts || {};
    const buildOpts = {};
    if (opts.keys) {
      opts.keys.forEach(key => {
        shape[key] = type;
        buildOpts[`_${key}`] = true;
        if (!propsOpts[key]) propsOpts[key] = opts.opts;
      });
    } else {
      shape.test = type;
      buildOpts._test = true;
    }
    return new Factory().props(shape, propsOpts).build({}, buildOpts);
  }),
  // objectOf: type => () => new Factory().props({ test: type }).build({}, { _test: true }),
  oneOf: enumValues => () => {
    const specWeight = {};
    enumValues.forEach(value => specWeight[value] = 1/enumValues.length);
    return weightedRand(specWeight);
  },
  oneOfType: types => () => {
    return new Factory().props({ value: types[weightedRand(types.length)] }).build({}, { _value: true }).value;
  },
  shape: shape => acceptOptions((opts = {}) => new Factory().props(shape, opts).build()),
}

Factory.setUpReact = function (React) {
  const originalPropTypes = {};

  // We need to add some way to map the actual Type to
  // the function we recieve in the dictionary.
  Object.keys(React.PropTypes).forEach(type => {
    // add `displayName` to each validator we support
    React.PropTypes[type].displayName = type;
    if (React.PropTypes[type].isRequired)  React.PropTypes[type].isRequired.displayName = type;
  });

  Object.keys(curiedPropTypes).forEach(type => {
    if (originalPropTypes[type]) return;

    originalPropTypes[type] = React.PropTypes[type];

    // add `displayName` to each validator we support
    React.PropTypes[type] = (...args) => {
      const returnValue = originalPropTypes[type](...args);
      if (!returnValue.displayName && returnValue && typeof returnValue === 'function') {
        const uuid = `${type}-${randomString()}`;
        generators[uuid] = curiedPropTypes[type](...args);

        returnValue.displayName = uuid;
        returnValue.isRequired.displayName = uuid;
      }
      return returnValue;
    }
  });
  return this;
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
  const uuid = randomString();
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
Factory.prototype.props = function (propTypes, opts = {}) {
  Object.keys(propTypes).forEach(prop => {
    const validator = propTypes[prop];
    const displayName = validator.displayName;

    if (!displayName) throw new Error(`validator for prop '${prop}' not recognized`);

    // If isRequired is still accessible then it hasn't been required yet
    const isRequired = !validator.isRequired;

    if (isRequired) {
      const returnValue = generators[displayName]();
      if (typeof returnValue === 'function') {
        this.attr(prop, generators[displayName](opts[prop]));
      } else {
        this.attr(prop, generators[displayName]);
      }
    } else {
      this.option(`_${prop}`, false);
      this.attr(prop, [`_${prop}`], isIncluded => {
        if (isIncluded) {
          const returnValue = generators[displayName](opts[prop]);
          if (typeof returnValue === 'function') return returnValue();
          return returnValue;
        }
      });
    }
  });
  return this;
};

export default Factory;
