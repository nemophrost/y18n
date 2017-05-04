var vsprintf = require('sprintf-js').vsprintf

var noop = function () {}

function Y18N (opts) {
  // configurable options.
  opts = opts || {}
  this.writeLocal = !!opts.writeLocalUpdates
  this.locale = opts.locale || 'en'
  this.fallbackToLanguage = opts.fallbackToLanguage !== false

  // internal stuff.
  this.cache = opts.sources || {}
  this.writeQueue = []
  this.localStorage = opts.localStorage || window.localStorage

  if (this.writeLocal) {
    var localData
    var sourceData
    var sourceIsUpdated = false
    Object.keys(this.cache).forEach(function (locale) {
      sourceData = this.cache[locale]
      sourceIsUpdated = false
      try {
        // grab from local storage
        localData = JSON.parse(this.localStorage['y18n-' + locale])
        sourceIsUpdated = Object.keys(localData).every(function (key) {
          return key in sourceData
        })
      } catch (e) {
        localData = {}
        sourceIsUpdated = true
      }

      // the source has all the latest keys for this locale,
      // delete from local storage
      if (sourceIsUpdated) {
        delete this.localStorage['y18n-' + locale]
      // local data still has entries we don't have in source,
      // merge the two, update local storage and cache
      } else {
        // apply source data over local storage data
        Object.keys(sourceData).forEach(function (key) {
          localData[key] = sourceData[key]
        })
        this.localStorage['y18n-' + locale] = JSON.stringify(localData, null, 2)
        this.cache[locale] = localData
      }
    }, this)
  }

  this.__ = this.__.bind(this)
  this.__n = this.__n.bind(this)
  this.setLocale = this.setLocale.bind(this)
  this.getLocale = this.getLocale.bind(this)
  this.updateLocale = this.updateLocale.bind(this)
}

Y18N.prototype._writeLocal = function (locale, cb) {
  // write to local storage
  this.localStorage['y18n-' + this._resolveLocaleKey(locale)] = JSON.stringify(this.cache[locale], null, 2)

  // let __ and __n return before firing cb (also can support async writing in the future)
  setTimeout(cb, 1)
}

Y18N.prototype._resolveLocaleKey = function (locale) {
  // attempt fallback to language only
  if (this.fallbackToLanguage && ~locale.lastIndexOf('_')) {
    var language = locale.split('_')[0]
    if (this.cache[language]) {
      return language
    }
  }
  return locale
}

Y18N.prototype._initLocale = function () {
  const locale = this._resolveLocaleKey(this.locale)
  if (locale !== this.locale) {
    console.log('setting', this.locale, 'to', locale, this.cache[locale])
    this.cache[this.locale] = this.cache[locale]
  }
  this.cache[this.locale] = this.cache[this.locale] || {}
  // attempt fallback to language only
  // console.log('initLocale', this.locale, this.fallbackToLanguage, ~this.locale.lastIndexOf('_'))
  // if (this.fallbackToLanguage && ~this.locale.lastIndexOf('_')) {
  //   var language = this.locale.split('_')[0]
  //   console.log('language', language, this.locale, this.cache)
  //   if (this.cache[language]) {
  //     console.log('setting', this.locale, 'to', language, this.cache[language])
  //     this.cache[this.locale] = this.cache[language]
  //   }
  // }
  // this.cache[this.locale] = this.cache[this.locale] || {}
}

Y18N.prototype.__ = function () {
  var args = Array.prototype.slice.call(arguments)
  var str = args.shift()
  var cb = noop // start with noop.

  if (typeof args[args.length - 1] === 'function') cb = args.pop()
  cb = cb || noop // noop.

  if (!this.cache[this.locale]) this._initLocale()

  // we've observed a new string, update the language file.
  if (!this.cache[this.locale][str] && this.writeLocal) {
    this.cache[this.locale][str] = str

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._writeLocal(this.locale, cb)
  } else {
    cb()
  }

  return vsprintf(this.cache[this.locale][str] || str, args)
}

Y18N.prototype.__n = function () {
  var args = Array.prototype.slice.call(arguments)
  var singular = args.shift()
  var plural = args.shift()
  var quantity = args.shift()

  var cb = noop // start with noop.
  if (typeof args[args.length - 1] === 'function') cb = args.pop()

  if (!this.cache[this.locale]) this._initLocale()

  var str = quantity === 1 ? singular : plural
  if (this.cache[this.locale][singular]) {
    str = this.cache[this.locale][singular][quantity === 1 ? 'one' : 'other']
  }

  // we've observed a new string, update the language file.
  if (!this.cache[this.locale][singular] && this.writeLocal) {
    this.cache[this.locale][singular] = {
      one: singular,
      other: plural
    }

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._writeLocal(this.locale, cb)
  } else {
    cb()
  }

  // if a %d placeholder is provided, add quantity
  // to the arguments expanded by vsprintf.
  var values = []
  if (~str.indexOf('%d')) values.push(quantity)

  return vsprintf(str, values.concat(args))
}

Y18N.prototype.setLocale = function (locale) {
  this.locale = locale
}

Y18N.prototype.getLocale = function () {
  return this.locale
}

Y18N.prototype.updateLocale = function (obj) {
  if (!this.cache[this.locale]) this._initLocale()

  for (var key in obj) {
    this.cache[this.locale][key] = obj[key]
  }
}

module.exports = Y18N
