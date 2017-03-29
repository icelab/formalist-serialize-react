import React from 'react'
import createDataObjectRenderer from 'formalist-data-object-renderer'
import { List, Map } from 'immutable'

/**
 * Simple check to see if a variable is an object
 * @param  {Mixed} obj The variable to check
 * @return {Boolean}
 */

function isObject(obj) {
  return obj === Object(obj)
}

/**
 * serializeName
 * Join our path and return a string
 * @param  {Array} path : [["foo"], ["bar"], ["baz"]]
 * @return {String} name : "foo[bar][baz]"
 */

function serializeName (path) {
  return path.map((s, i) => {
    return i === 0 ? s : '[' + s + ']'
  }).join('')
}

function render (name, value, path = []) {
  if (value && value.toJS) {
    value = value.toJS()
  }
  if (Array.isArray(value)) {
    return renderList(name, value, path)
  } else if (isObject(value)) {
    return renderMap(name, value, path)
  }
  return renderValue(name, value, path)
}

function renderValue (name, value, path) {
  const append = Array.isArray(name) ? name : [name]
  path = path.concat(append)
  name = serializeName(path)
  value =  (value != null) ? value : ''
  const key = [name, value]
  return React.createElement(
    'input',
    {
      key,
      name,
      value,
      type: 'hidden',
    }
  )
}

function renderList (name, value, path) {
  // Render an empty input for a list if it contains nothing
  if (!value || value.length === 0) {
    return render(name, '', path)
  }
  return value.map((c) => {
    // Insert a junk value as the _first_ item in an array where the contents of
    // the array are a map to ensure params are parsed correctly by rack
    // https://github.com/rack/rack/issues/951
    if (isObject(c) || Map.isMap(c)) {
      return [
        render([name, '', '__rack_workaround'], '', path),
        render([name, ''], c, path)
      ]
    } else {
      return render([name, ''], c, path);
    }
  })
}

function renderMap (name, value, path) {
  const append = Array.isArray(name) ? name : [name]
  path = path.concat(append)
  return Object.keys(value).map((key, index) => {
    return render(key, value[key], path)
  })
}

/**
 * Map input/wrappers to the various formalist-schema
 * @param  {Array} Formalist-compatible AST
 * @param  {Object} options Options hash: { prefix: String, additionalFieldTypes: [] }
 * @return {Array} An array of React elements
 */

export default function serialize (ast, options = {}) {
  const { prefix } = options
  const path = (prefix) ? [prefix] : []
  const dataObjectRenderer = createDataObjectRenderer()
  const dataObject = dataObjectRenderer(ast)
  return Object.keys(dataObject).map((key, index) => {
    return render(key, dataObject[key], path)
  })
}
