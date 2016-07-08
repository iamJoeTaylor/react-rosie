import { expect } from 'chai';

import Factory from '../src/index';
import React from 'react';

Factory.setUpReact(React);

describe.only('kitchen sink', () => {
  let factory;
  beforeEach(() => {
    factory = new Factory()
      .props({
        any: React.PropTypes.any.isRequired,
        array: React.PropTypes.array.isRequired,
        bool: React.PropTypes.bool.isRequired,
        func: React.PropTypes.func.isRequired,
        node: React.PropTypes.node.isRequired,
        number: React.PropTypes.number.isRequired,
        object: React.PropTypes.object.isRequired,
        string: React.PropTypes.string.isRequired,

        arrayOf: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        instanceOf: React.PropTypes.instanceOf(Array).isRequired,
        oneOf: React.PropTypes.oneOf(['foo', 'bar', 'baz']).isRequired,
        shape: React.PropTypes.shape({
          array: React.PropTypes.array.isRequired,
          bool: React.PropTypes.bool.isRequired,
          func: React.PropTypes.func.isRequired,
          node: React.PropTypes.node.isRequired,
          number: React.PropTypes.number.isRequired,
          object: React.PropTypes.object.isRequired,
          string: React.PropTypes.string.isRequired,

          arrayOf: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
          instanceOf: React.PropTypes.instanceOf(Factory).isRequired,
          oneOf: React.PropTypes.oneOf(['foo', 'bar', 'baz']).isRequired,
        }).isRequired,
        oneOfType: React.PropTypes.oneOfType([
          React.PropTypes.string,
          React.PropTypes.number,
          React.PropTypes.object,
        ]).isRequired,
        objectOf: React.PropTypes.objectOf( React.PropTypes.arrayOf( React.PropTypes.number ) ).isRequired,
      }, {
        array: {
          array: {
            weight: { 6: 1 }
          }
        },
        number: {
          number: {
            min: 1,
            max: 36
          }
        },
        func: {
          func: {
            stub: () => 'im a stub'
          }
        },
        instanceOf: {
          instanceOf: {
            args: ['123', 456]
          }
        },
        shape: {
          arrayOf: {
            arrayOf: {
              weight: { 6: 1 },
              string: {
                stringLength: 20
              }
            }
          }
        },
        objectOf: {
          objectOf: {
            keys: ['a', 'b', 'ect'],
            opts: {
              arrayOf: {
                weight: { 6: 1 },
                number: {
                  min: 20,
                  max: 400
                }
              }
            }
          }
        }
      });
  });

  it('is valid', () => {
    console.log(factory.build());
    expect(factory.build.bind(factory)).to.not.throw()
  });
});

describe('standard React.PropTypes', () => {
  it('switched on isRequired', () => {
    const factory = new Factory()
      .props({
        username: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string
      });

    const user1 = factory.build();
    const user2 = factory.build({}, { _displayName: true });

    expect(user1).to.have.property('username');
    expect(user1).to.have.property('displayName');
    expect(user1.displayName).to.be.undefined;

    expect(user2).to.have.property('username');
    expect(user2).to.have.property('displayName');
    expect(user1.displayName).to.be.defined;
  });
});

describe('custom PropType validators', () => {
  let matchMeProp;
  beforeEach(() => {
    matchMeProp = function(props, propName, componentName) {
      if (!/matchme/.test(props[propName])) {
        return new Error(
          'Invalid prop `' + propName + '` supplied to' +
          ' `' + componentName + '`. Validation failed.'
        );
      }
    }
  });

  it('registers and generates', () => {
    const factory = new Factory()
      .validator(matchMeProp, () => 'look I matchme')
      .props({
        matchMe: matchMeProp
      });

    const output = factory.build();
    expect(output.matchMe).to.equal('look I matchme');
  });

  it('throws if it has not been registered', () => {
    const factory = new Factory()
      .props.bind(this, {
        matchMe: matchMeProp
      })

    expect(factory).to.throw(/validator for prop 'matchMe' not recognized/);
  });
});

describe('static generators', () => {
  [{bool: 'boolean'}, 'number', 'object', 'string'].forEach(_type => {
    const type = typeof _type === 'string' ?
      _type :
      Object.keys(_type)[0];

    it(type, () => {
      const tester = new Factory().props({ prop: React.PropTypes[type].isRequired }).build();
      expect(tester.prop).to.be.a(_type[type] || type);
    });
  });
});

describe('complex generators', () => {
  describe('isRequired vs optional', () => {
    it('it is isRequired', () => {
      const arrayPropType = React.PropTypes.arrayOf(React.PropTypes.string).isRequired;

      const factory = new Factory().props({ array: arrayPropType });
      const tester = factory.build();

      expect(tester).to.have.property('array');
      expect(tester.array).to.be.defined;
    });

    it('it is not isRequired', () => {
      const arrayPropType = React.PropTypes.arrayOf(React.PropTypes.string);

      const factory = new Factory().props({ array: arrayPropType });
      const testerPlain = factory.build();
      const testerManual = factory.build({}, { _array: true });

      expect(testerPlain).to.have.property('array');
      expect(testerPlain.array).to.be.undefined;
      expect(testerManual).to.have.property('array');
      expect(testerManual.array).to.an('array');
    });
  });

  describe('arrayOf', () => {
    it('returns an array', () => {
      const arrayPropType = React.PropTypes.arrayOf(React.PropTypes.string).isRequired;
      const factory = new Factory()
        .props({ array: arrayPropType }, {
          array: {
            arrayOf: {
              weight: { 1: 1 }
            }
          }
        });
      const tester = factory.build();

      expect(tester.array.length).to.be.eq(1);
      expect(Array.isArray(tester.array)).to.be.true;
    });
  });

  describe('shape', () => {
    it('deeply nests object shapes', () => {
      const factory = new Factory()
        .props(
          {
            first: React.PropTypes.shape({
              second: React.PropTypes.shape({
                array: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
              }).isRequired
            }).isRequired
          }
        );
      const tester = factory.build();

      expect(tester).to.have.property('first')
        .that.is.an('object')
        .with.property('second')
          .that.is.an('object')
          .with.property('array')
            .that.is.an('array');
    });
  });
});
