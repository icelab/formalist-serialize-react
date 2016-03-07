import { mount } from 'enzyme'
import composeForm from 'formalist-compose'
import test from 'tape'
import React from 'react'
import serializer from '..'

import createDOM from './fixtures/dom'
createDOM()

// Import various data
import dataSimple from './fixtures/data.js'
import dataAttr from './fixtures/data-attr.js'
import dataMany from './fixtures/data-many.js'

/**
 * Create a wrapper
 * @param  {ImmutableList} data Formalist AST
 * @param  {Object} options Hash of options { prefix: ... }
 * @return {EnzymeDOM} Enzyme wrapper for the DOM
 */

function createWrapper (data, options) {
  const serializedTemplate = composeForm(serializer(options))
  const serializedForm = serializedTemplate(data)
  return mount(React.createElement(
    'article',
    {},
    serializedForm.render()
  ))
}

function assertInputNames (assert, wrapper, expected) {
  const inputs = wrapper.find('input')
  const actual = inputs.map(function (input) {
    return input.node.getAttribute('name')
  })
  assert.deepLooseEqual(actual, expected)
}

function assertInputValues (assert, wrapper, expected) {
  const inputs = wrapper.find('input')
  const actual = inputs.map(function (input) {
    return input.node.value
  })
  assert.deepLooseEqual(actual, expected)
}

test('it should serialize a formalist AST', (nest) => {
  let options = {}

  nest.test('... with the right number of fields', (assert) => {
    const wrapper = createWrapper(dataSimple, options)
    const inputs = wrapper.find('input')
    assert.equal(inputs.length, 4)
    assert.end()
  })

  nest.test('... with the correct name attributes', (assert) => {
    const wrapper = createWrapper(dataSimple, options)
    const expectedNames = [
      'field-one-name',
      'field-two-name',
      'field-three-name',
      'field-four-name'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... with the correct values', (assert) => {
    const wrapper = createWrapper(dataSimple, options)
    const expectedValues = [
      123,
      'Title goes here',
      321,
      'Content goes here'
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })

  nest.test('... for fields nested in `attr` blocks', (assert) => {
    const wrapper = createWrapper(dataAttr, options)
    // Names
    const expectedNames = [
      'attr[field-one-attr]',
      'attr[field-two-attr]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    // Values
    const expectedValues = [
      'Attr 1',
      456
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })

  nest.test('... for fields nested in `many` blocks', (assert) => {
    const wrapper = createWrapper(dataMany, options)
    // Names
    const expectedNames = [
      'many[0][field-one-many]',
      'many[1][field-one-many]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    // Values
    const expectedValues = [
      'Great',
      'Foobar'
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })
})

test('it should handle namespacing prefixes', (nest) => {
  const options = {
    prefix: 'user'
  }

  nest.test('... for normal inputs', (assert) => {
    const wrapper = createWrapper(dataSimple, options)
    const expectedNames = [
      'user[field-one-name]',
      'user[field-two-name]',
      'user[field-three-name]',
      'user[field-four-name]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... for fields nested in `attr` blocks', (assert) => {
    const wrapper = createWrapper(dataAttr, options)
    const expectedNames = [
      'user[attr][field-one-attr]',
      'user[attr][field-two-attr]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... for fields nested in `many` blocks', (assert) => {
    const wrapper = createWrapper(dataMany, options)
    const expectedNames = [
      'user[many][0][field-one-many]',
      'user[many][1][field-one-many]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })
})
