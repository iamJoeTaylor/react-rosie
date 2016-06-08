# React-Rosie

React-Rosie takes the power of [RosieJs](https://github.com/rosiejs/rosie) and adds some
specific upgrades for React. The upgrades allow you to quickly generate Factories from your
component's PropTypes.

```js
// factories/user.js
import { dateString, dateStringGenerator } from 'utils/PropTypes';
import Factory from 'react-rosie';

export default new Factory()
  .validator(dateString, dateStringGenerator)
  .props({
    date: dateString.isRequired,
    username: React.PropTypes.string.isRequired,
    displayName: React.PropTypes.string
   });
```

`validator` and `props` are both new methods added onto Rosie's Factory class.

## Supported Generators

- Any
- Array
- Bool
- Func
- Node
- Number
- Object
- String

- ArrayOf
- InstanceOf
- ObjectOf
- OneOf
- OneOfType
- Shape

## API

### Factory.setUpReact( `React` )

React-Rosie needs your React instance so it can decode and apply generators for each
of Reacts standard PropTypes. This function needs to be called before part of your code
uses React PropTypes. We recommend that you do this first thing in your test setup.

### instance.validator( `validatorFn`, `generator_function` )

The `validatorFn` should be the same function that is passed in as your components custom
PropType validator.

_note:_ you must register your custom validator before passing it to the `props` method.

### instance.props( `PropTypesDictionary`, [`options`] )

React-Rosie will match up React's standard PropTypes with a generator and automatically setup
your factory.

If the prop `isRequired` then that property will be set as an
[attribute](https://github.com/rosiejs/rosie#instanceattr) that will always be included in the
factory unless overridden.

If the prop is not required then it'll be an optional property. Optional properties will be `undefined`
unless explicitly included by passing the option of `_PROPNAME: true`.

#### Options

Options use a nested format that can be as deep or as shallow as you'd like. Options can be
used to control things like likely-hood of array length.

##### `arrayOf`

- weight - <Object> key of length, value of decimal percentage of likely-hood

  EXAMPLE: `{ 0: .3, 1: .4, 2: .1, 3: .1, 4: .1 }`

More to come soon.

## Example

```js
import User from './factories/user';

// with displayName
const user1 = User.build({}, { _displayName: true });

// without displayName
const user2 = User.build();
```
