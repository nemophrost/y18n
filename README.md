# y18n-browser

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM version][npm-image]][npm-url]
[![js-standard-style][standard-image]][standard-url]

The bare-bones internationalization library.

Inspired by [i18n](https://www.npmjs.com/package/i18n).
and [y18n](https://www.npmjs.com/package/y18n).

## Examples

_simple string translation:_

```js
var __ = require('y18n').__

console.log(__('my awesome string %s', 'foo'))
```

output:

`my awesome string foo`

_pluralization support:_

```js
var __n = require('y18n').__n

console.log(__n('one fish %s', '%d fishes %s', 2, 'foo'))
```

output:

`2 fishes foo`

## JSON Language Files

The JSON language files can be stored anywhere as long as you can include them
when you instantiate a new Y18N.
File names correspond to locales, e.g., `en.json`, `pirate.json`.

When strings are observed for the first time they will be
added to the JSON file corresponding to the current locale.

## Usage

It is recommended to create a helper file/module to handle constructing a new Y18N instance like so:

`y18n.js`

```js
import Y18N from 'y18n-browser'

export default new Y18N({
	sources: {
		en: require('./path/to/en.json'),
		pirate: require('./path/to/pirate.json'),
	}
})
```

Create an instance of y18n with the config provided, options include:

* `sources`: an object mapping to existing json source files
* `writeLocalUpdates`: should newly observed strings be written to local storage, default `false`.
* `locale`: what locale should be used.
* `fallbackToLanguage`: should fallback to a language-only file (e.g. `en.json`)
  be allowed if a file matching the locale does not exist (e.g. `en_US.json`),
  default `true`.

## Methods

### import y18n from './my/instance/y18n'

Now you can use your configured instance anywhere.

### y18n.\_\_(str, arg, arg, arg)

Print a localized string, `%s` will be replaced with `arg`s.

### y18n.\_\_n(singularString, pluralString, count, arg, arg, arg)

Print a localized string with appropriate pluralization. If `%d` is provided
in the string, the `count` will replace this placeholder.

### y18n.setLocale(str)

Set the current locale being used.

### y18n.getLocale()

What locale is currently being used?

### y18n.updateLocale(obj)

Update the current locale with the key value pairs in `obj`.

## Example locale json file
```json
{
  "Hello": "Hello!",
  "Hello %s %s": "Hello %s %s",
  "%d cat": {
    "one": "%d cat",
    "other": "%d cats"
  },
  "%d %s cat": {
    "one": "%d %s cat",
    "other": "%d %s cats"
  },
  "There is one monkey in the %s": {
    "one": "There is one monkey in the %s",
    "other": "There are %d monkeys in the %s"
  }
}
```

## License

ISC

[travis-url]: https://travis-ci.org/nemophrost/y18n-browser
[travis-image]: https://img.shields.io/travis/nemophrost/y18n-browser.svg
[coveralls-url]: https://coveralls.io/github/nemophrost/y18n-browser
[coveralls-image]: https://img.shields.io/coveralls/nemophrost/y18n-browser.svg
[npm-url]: https://npmjs.org/package/y18n-browser
[npm-image]: https://img.shields.io/npm/v/y18n-browser.svg
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: https://github.com/feross/standard
