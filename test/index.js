var enzyme = require('enzyme')
var formalistCompose = require('formalist-compose')
var jsdom = require('jsdom')
var test = require('tape')
var React = require('react')
var serializer = require('..')

// Import various data
var dataSimple = require('./fixtures/data.js')
var dataAttr = require('./fixtures/data-attr.js')
var dataMany = require('./fixtures/data-many.js')

var composeForm = formalistCompose.default
var mount = enzyme.mount

// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = {userAgent: 'node.js'}

/**
 * Create a wrapper
 * @param  {ImmutableList} data Formalist AST
 * @param  {Object} options Hash of options { prefix: ... }
 * @return {EnzymeDOM} Enzyme wrapper for the DOM
 */
function createWrapper (data, options) {
  var serializedTemplate = composeForm(serializer(options))
  var serializedForm = serializedTemplate(data)
  return mount(React.createElement(
    'article',
    {},
    serializedForm.render()
  ))
}

function assertInputNames (assert, wrapper, expectedNames) {
  var inputs = wrapper.find('input')
  var names = inputs.map(function (input) {
    return input.node.getAttribute('name')
  })
  assert.deepLooseEqual(names, expectedNames)
}

function assertInputValues (assert, wrapper, expectedValues) {
  var inputs = wrapper.find('input')
  var values = inputs.map(function (input) {
    return input.node.value
  })
  assert.deepLooseEqual(values, expectedValues)
}

/**
 * Begin the tests!
 */
test('it should serialize a formalist AST', function (nest) {
  var options = {}

  nest.test('... with the right number of fields', function (assert) {
    var wrapper = createWrapper(dataSimple, options)
    var inputs = wrapper.find('input')
    assert.equal(inputs.length, 4)
    assert.end()
  })

  nest.test('... with the correct name attributes', function (assert) {
    var wrapper = createWrapper(dataSimple, options)
    var expectedNames = [
      'field-one-name',
      'field-two-name',
      'field-three-name',
      'field-four-name'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... with the correct values', function (assert) {
    var wrapper = createWrapper(dataSimple, options)
    var expectedValues = [
      123,
      'Title goes here',
      321,
      'Content goes here'
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })

  nest.test('... for fields nested in `attr` blocks', function (assert) {
    assert.plan(2)
    var wrapper = createWrapper(dataAttr, options)
    // Names
    var expectedNames = [
      'attr[field-one-attr]',
      'attr[field-two-attr]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    // Values
    var expectedValues = [
      'Attr 1',
      456
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })

  nest.test('... for fields nested in `many` blocks', function (assert) {
    assert.plan(2)
    var wrapper = createWrapper(dataMany, options)
    // Names
    var expectedNames = [
      'many[0][field-one-many]',
      'many[1][field-one-many]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    // Values
    var expectedValues = [
      'Great',
      'Foobar'
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })
})

test('it should handle namespacing prefixes', function (nest) {
  var options = {
    prefix: 'user'
  }

  nest.test('... for normal inputs', function (assert) {
    var wrapper = createWrapper(dataSimple, options)
    var expectedNames = [
      'user[field-one-name]',
      'user[field-two-name]',
      'user[field-three-name]',
      'user[field-four-name]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... for fields nested in `attr` blocks', function (assert) {
    var wrapper = createWrapper(dataAttr, options)
    var expectedNames = [
      'user[attr][field-one-attr]',
      'user[attr][field-two-attr]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... for fields nested in `many` blocks', function (assert) {
    var wrapper = createWrapper(dataMany, options)
    var expectedNames = [
      'user[many][0][field-one-many]',
      'user[many][1][field-one-many]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })
})
