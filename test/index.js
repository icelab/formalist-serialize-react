import { mount } from 'enzyme'
import composeForm from 'formalist-compose'
import test from 'tape'
import React from 'react'
import serializer from '../src'

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
    assert.equal(inputs.length, 20)
    assert.end()
  })

  nest.test('... with the correct name attributes', (assert) => {
    const wrapper = createWrapper(dataSimple, options)
    const expectedNames = [
      'text_field',
      'number_field',
      'check_box',
      'select_box',
      'radio_buttons',
      'text_area',
      'date_field',
      'date_time_field',
      'section_text_field',
      'section_number_field',
      'group_text_field',
      'group_number_field',
      'many[][many_text_field]',
      'many[][many_date_field]',
      'many[][many_text_field]',
      'many[][many_date_field]',
      'attr[attr_text_field]',
      'attr[attr_date_field]',
      'compound_field_text_field',
      'compound_field_date_field'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... with the correct values', (assert) => {
    const wrapper = createWrapper(dataSimple, options)
    const expectedValues = [
      'Text field value',
      'Number field value',
      'Check box value',
      '3',
      '2',
      'Text area value',
      '2016-03-10',
      '2016-03-10 17:00:00 +1100',
      'Section text field value',
      '123',
      'Group text field value',
      '123',
      'Many text field 1',
      '2016-03-10',
      'Many text field 2',
      '2016-03-09',
      'Attr text field value',
      '2016-03-10',
      'Compound text field value',
      '2016-03-10'
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })

  nest.test('... for fields nested in `attr` blocks', (assert) => {
    const wrapper = createWrapper(dataAttr, options)
    // Names
    const expectedNames = [
      'attr[attr_text_field]',
      'attr[attr_date_field]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    // Values
    const expectedValues = [
      'Attr text field value',
      '2016-03-10'
    ]
    assertInputValues(assert, wrapper, expectedValues)
    assert.end()
  })

  nest.test('... for fields nested in `many` blocks', (assert) => {
    const wrapper = createWrapper(dataMany, options)
    // Names
    const expectedNames = [
      'many[][many_text_field]',
      'many[][many_date_field]',
      'many[][many_text_field]',
      'many[][many_date_field]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    // Values
    const expectedValues = [
      'Many text field 1',
      '2016-03-10',
      'Many text field 2',
      '2016-03-09'
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
      'user[text_field]',
      'user[number_field]',
      'user[check_box]',
      'user[select_box]',
      'user[radio_buttons]',
      'user[text_area]',
      'user[date_field]',
      'user[date_time_field]',
      'user[section_text_field]',
      'user[section_number_field]',
      'user[group_text_field]',
      'user[group_number_field]',
      'user[many][][many_text_field]',
      'user[many][][many_date_field]',
      'user[many][][many_text_field]',
      'user[many][][many_date_field]',
      'user[attr][attr_text_field]',
      'user[attr][attr_date_field]',
      'user[compound_field_text_field]',
      'user[compound_field_date_field]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... for fields nested in `attr` blocks', (assert) => {
    const wrapper = createWrapper(dataAttr, options)
    const expectedNames = [
      'user[attr][attr_text_field]',
      'user[attr][attr_date_field]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })

  nest.test('... for fields nested in `many` blocks', (assert) => {
    const wrapper = createWrapper(dataMany, options)
    const expectedNames = [
      'user[many][][many_text_field]',
      'user[many][][many_date_field]',
      'user[many][][many_text_field]',
      'user[many][][many_date_field]'
    ]
    assertInputNames(assert, wrapper, expectedNames)
    assert.end()
  })
})
