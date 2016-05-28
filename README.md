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
   }), React);
```

`validator` and `props` are both new methods added onto Rosie's Factory class.

## Supported Generators

- Strings
- Numbers
- Booleans

More to come soon.

## API

### instance.validator( `validatorFn`, `generator_function` )

The `validatorFn` should be the same function that is passed in as your components custom
PropType validator.

_note:_ you must register your custom validator before passing it to the `props` method.

### instance.props( `PropTypesDictionary`, `React` )

React-Rosie will match up React's standard PropTypes with a generator and automatically setup
your factory.

If the prop `isRequired` then that property will be set as an
[attribute](https://github.com/rosiejs/rosie#instanceattr) that will always be included in the
factory unless overridden.

If the prop is not required then it'll be an optional property. Optional properties will be `undefined`
unless explicitly included by passing the option of `_PROPNAME: true`.

_note:_ you must pass in the same React instance that is used to declare your PropTypes. We use this to
match up Types to Generators.

```js
import User from './factories/user';

// with displayName
const user1 = User.build({}, { _displayName: true });

// without displayName
const user2 = User.build();
```
