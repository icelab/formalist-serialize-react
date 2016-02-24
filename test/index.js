var enzyme = require('enzyme')
var formalistCompose = require('formalist-compose')
var jsdom = require('jsdom')
var test = require('tape')
var React = require('react')
var serializer = require('..')
var data = require('./fixtures/data.js')

var composeForm = formalistCompose.default
var mount = enzyme.mount

// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = {userAgent: 'node.js'}

test('it should serialize a form', function (nest) {
  var serializedTemplate = composeForm(serializer)
  var serializedForm = serializedTemplate(data)
  var wrapper = mount(React.createElement(
    'article',
    {},
    serializedForm.render()
  ))

  nest.test('... with the right number of fields', function (assert) {
    var inputs = wrapper.find('input')
    assert.equal(inputs.length, 4)
    assert.end()
  })
  nest.test('... with the correct name attributes', function (assert) {
    var expectedNames = [
      'field-one-name',
      'field-two-name',
      'field-three-name',
      'field-four-name'
    ]
    var inputs = wrapper.find('input')
    var names = inputs.map(function (input) {
      return input.node.getAttribute('name')
    })
    assert.deepLooseEqual(names, expectedNames)
    assert.end()
  })
  nest.test('... with the correct values', function (assert) {
    var expectedValues = [
      123,
      'Title goes here',
      321,
      'Content goes here'
    ]
    var inputs = wrapper.find('input')
    var values = inputs.map(function (input) {
      return input.node.value
    })
    assert.deepLooseEqual(values, expectedValues)
    assert.end()
  })
})
