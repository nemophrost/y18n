/* global describe, it, beforeEach */

var expect = require('chai').expect
var Y18N = require('../')
var enLocale = require('./locales/en.json')
var pirateLocale = require('./locales/pirate.json')

var localStorage = {}

var y18n = function (options) {
  options = options || {}
  return new Y18N(Object.assign({}, options, {
    localStorage: localStorage,
    sources: Object.assign({
      en: enLocale,
      pirate: pirateLocale
    }, options.sources)
  }, {
    writeLocalUpdates: options.writeLocalUpdates !== false // pretend default is true
  }))
}

require('chai').should()

describe('y18n', function () {
  describe('configure', function () {
    it('allows you to override the default y18n configuration', function () {
      var y = y18n({locale: 'fr'})
      y.locale.should.equal('fr')
    })
  })

  describe('__', function () {
    it('uses replacements from the default locale if none is configured', function () {
      var __ = y18n().__

      __('Hello').should.equal('Hello!')
    })

    it('uses replacements from the configured locale', function () {
      var __ = y18n({
        locale: 'pirate'
      }).__

      __('Hello').should.equal('Avast ye mateys!')
    })

    it('uses language file if language_territory file does not exist', function () {
      var __ = y18n({
        locale: 'pirate_JM'
      }).__

      __('Hello').should.equal('Avast ye mateys!')
    })

    it('does not fallback to language file if fallbackToLanguage is false', function () {
      var __ = y18n({
        locale: 'pirate_JM',
        fallbackToLanguage: false,
        writeLocalUpdates: false
      }).__

      __('Hello').should.equal('Hello')
    })

    it('uses strings as given if no matching locale files found', function () {
      var __ = y18n({
        locale: 'zz_ZZ',
        writeLocalUpdates: false
      }).__

      __('Hello').should.equal('Hello')
    })

    it('expands arguments into %s placeholders', function () {
      var __ = y18n().__

      __('Hello %s %s', 'Ben', 'Coe').should.equal('Hello Ben Coe')
    })

    describe('the first time observing a word', function () {
      beforeEach(function (done) {
        localStorage = {}
        done()
      })

      it('returns the word immediately', function () {
        var __ = y18n({
          locale: 'fr'
        }).__

        __('banana').should.equal('banana')
      })

      it('writes new word to locale file if writeLocalUpdates is true', function (done) {
        var __ = y18n({
          locale: 'fr_FR'
        }).__

        __('banana', function (err) {
          var locale = JSON.parse(localStorage['y18n-fr_FR'])
          locale.banana.should.equal('banana')
          return done(err)
        })
      })

      it('writes new word to language file if language_territory file does not exist', function (done) {
        var __ = y18n({
          locale: 'fr_FR',
          sources: {
            'fr': {'meow': 'le meow'}
          }
        }).__

        __('meow').should.equal('le meow')
        __('banana', function (err) {
          var locale = JSON.parse(localStorage['y18n-fr'])
          locale.banana.should.equal('banana')
          return done(err)
        })
      })

      it('writes word to missing locale file, if no fallback takes place', function (done) {
        var __ = y18n({
          locale: 'fr_FR',
          fallbackToLanguage: false,
          sources: {
            'fr': {'meow': 'le meow'}
          }
        }).__

        __('banana', function (err) {
          // 'banana' should be written to local storage
          console.log('localStoragre', localStorage)
          var locale = JSON.parse(localStorage['y18n-fr_FR'])
          locale.should.deep.equal({
            banana: 'banana'
          })
          // fr should remain untouched
          expect(localStorage['y18n-fr']).to.equal(undefined)
          // frJson.should.equal(undefined)
          return done(err)
        })
      })

      it('handles enqueuing multiple writes at the same time', function (done) {
        var __ = y18n({
          locale: 'fr'
        }).__

        __('apple')
        __('banana', function () {
          __('foo')
          __('bar', function (err) {
            var locale = JSON.parse(localStorage['y18n-fr'])
            locale.apple.should.equal('apple')
            locale.banana.should.equal('banana')
            locale.foo.should.equal('foo')
            locale.bar.should.equal('bar')
            return done(err)
          })
        })
      })

      it('does not write the locale file if writeLocalUpdates is false', function (done) {
        var __ = y18n({
          locale: 'fr',
          writeLocalUpdates: false
        }).__

        __('banana', function (err) {
          expect(localStorage['y18n-fr']).to.equal(undefined)
          return done(err)
        })
      })
    })
  })

  describe('__n', function () {
    it('uses the singular form if quantity is 1', function () {
      var __n = y18n().__n

      __n('%d cat', '%d cats', 1).should.equal('1 cat')
    })

    it('uses the plural form if quantity is greater than 1', function () {
      var __n = y18n().__n

      __n('%d cat', '%d cats', 2).should.equal('2 cats')
    })

    it('allows additional arguments to be printed', function () {
      var __n = y18n().__n

      __n('%d %s cat', '%d %s cats', 2, 'black').should.equal('2 black cats')
    })

    it('allows an alternative locale to be set', function () {
      var __n = y18n({
        locale: 'pirate'
      }).__n

      __n('%d cat', '%d cats', 1).should.equal('1 land catfish')
      __n('%d cat', '%d cats', 3).should.equal('3 land catfishes')
    })

    // See: https://github.com/bcoe/yargs/pull/210
    it('allows a quantity placeholder to be provided in the plural but not singular form', function () {
      var __n = y18n().__n

      var singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, 'tree')
      var plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, 'tree')

      singular.should.equal('There is one monkey in the tree')
      plural.should.equal('There are 3 monkeys in the tree')
    })

    describe('the first time observing a pluralization', function () {
      beforeEach(function (done) {
        localStorage = {}
        done()
      })

      it('returns the pluralization immediately', function () {
        var __n = y18n({
          locale: 'fr'
        }).__n

        __n('%d le cat', '%d le cats', 1).should.equal('1 le cat')
      })

      it('writes to the locale file if writeLocalUpdates is true', function (done) {
        var __n = y18n({
          locale: 'fr'
        }).__n

        __n('%d apple %s', '%d apples %s', 2, 'dude', function (err) {
          var locale = JSON.parse(localStorage['y18n-fr'])
          locale['%d apple %s'].one.should.equal('%d apple %s')
          locale['%d apple %s'].other.should.equal('%d apples %s')
          return done(err)
        })
      })

      it('does not write the locale file if writeLocalUpdates is false', function (done) {
        var __n = y18n({
          locale: 'fr',
          writeLocalUpdates: false
        }).__n

        __n('%d apple %s', '%d apples %s', 2, 'dude', function (err) {
          expect(localStorage['y18n-fr']).to.equal(undefined)
          return done(err)
        })
      })
    })
  })

  describe('setLocale', function () {
    it('switches the locale', function () {
      var i18n = y18n()

      i18n.__('Hello').should.equal('Hello!')
      i18n.setLocale('pirate')
      i18n.__('Hello').should.equal('Avast ye mateys!')
    })
  })

  describe('updateLocale', function () {
    beforeEach(function (done) {
      localStorage = {}
      done()
    })

    it('updates the locale with the new lookups provided', function () {
      var i18n = y18n({
        locale: 'fr'
      })

      i18n.updateLocale({
        foo: 'le bar'
      })

      i18n.__('foo').should.equal('le bar')
    })

    it('loads the locale from disk prior to updating the map', function () {
      var i18n = y18n({
        locale: 'fr',
        sources: {
          'fr': {'meow': 'le meow'}
        }
      })

      i18n.updateLocale({
        foo: 'le bar'
      })

      i18n.__('meow').should.equal('le meow')
    })
  })

  describe('getLocale', function () {
    it('returns the configured locale', function () {
      y18n().getLocale().should.equal('en')
    })
  })
})
